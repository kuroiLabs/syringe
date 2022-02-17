import { CircularDependencyError, Constants, Constructor, generateId, NullInjectionTokenError } from "../utils";

/**
 * @author kuro <kuro@kuroi.io>
 * @namespace kuroi.io.Syringe.Container
 * @description This namespace runs the core injection logic and modeling to run the framework.
 * 	Honestly, I hate that all these models are in one file, but since they all call each other,
 * 	it's hard to split up without generating circular imports.
 */

//#region types
/**
 * @author kuro <kuro@kuroi.io>
 * @namespace kuroi.io.Syringe.Container
 * @description Union of types that can act or be interpreted as `InjectionToken`
 */
export type Token = InjectionToken | Constructor | Function

/**
 * @author kuro <kuro@kuroi.io>
 * @namespace kuroi.io.Syringe.Container
 * @description Union of types that can act as a scope for injection
 */
export type InjectionScope = "global" | any

/**
 * @author kuro <kuro@kuroi.io>
 * @namespace kuroi.io.Syringe.Container
 * @description Value provided by a Provider. Can provide a Token or a pre-instaniated value type
 */
interface ProviderValue  {
	use?: Token,
	instance?: any
}

/**
 * @author kuro <kuro@kuroi.io>
 * @namespace kuroi.io.Syringe.Container
 * @description Configuration object for declaring which values to inject
 * 	outside of the decorator system.
 */
export interface Provider {
	for: Token,
	scope?: InjectionScope
	provide: ProviderValue
}

export class Provider implements Provider {
	constructor(_scope: InjectionScope, _for: Token, _provide?: Partial<ProviderValue>) {
		this.for = _for
		this.scope = _scope
		if (!_provide) {
			if (_hasConstructor(_for))
				this.provide = {
					instance: _for
				}
			else
				this.provide = {
					use: _for
				}
		} else {
			this.provide = _provide
		}
	}
}

/**
 * @author kuro <kuro@kuroi.io>
 * @namespace kuroi.io.Syringe.Container
 * @description Module configuration object for entry point injection.
 */
export interface ModuleConfiguration {
	scope?: InjectionScope,
	providers?: Provider[]
}

/**
 * @author kuro <kuro@kuroi.io>
 * @namespace kuroi.io.Syringe.Container
 * @description Token object for an injectable entity. Automatically registers itself
 * 	to the Container on construction.
 */
export interface InjectionToken {
	id: string;
	key: string
	scope: InjectionScope
	factory: () => any
}

export class InjectionToken implements InjectionToken {

	public id: string

	public key: string

	public scope: InjectionScope

	public factory: () => any

	get isSingleton(): boolean {
		return this.scope === Constants.GLOBAL_SCOPE
	}

	constructor(_key: any, _config: Partial<InjectionToken>) {
		this.id = generateId()
		this.key = _key
		if (_config) {
			this.scope = _config.scope
			this.factory = _config.factory
		} else {
			this.factory = () => _key
		}
		registerToken(this)
	}

}
//#endregion

//#region maps and caches
const TOKENS = new Map<string, InjectionToken>() // token key -> token

const DEPENDENCY_MAP = new Map<string, string[]>() // token identifier -> dependency names

const INSTANCES = new Map<InjectionScope, Map<InjectionToken, any>>() // scope -> token ID -> cached instance

const PROVIDERS = new Map<string, string>()
//#endregion

//#region public methods
/**
 * @author kuro <kuro@kuroi.io>
 * @namespace kuroi.io.Syringe.Container
 * @description Stores a token in the Container's token map
 */
export function registerToken(_token: InjectionToken): void {
	TOKENS.set(_token.key, _token)
}

/**
 * @author kuro <kuro@kuroi.io>
 * @namespace kuroi.io.Syringe.Container
 * @description Returns a module instance with all of its dependencies (and their dependencies, and so on)
 * 	generated and injected with a given configuration.
 * @argument _module An injectable entity to serve as an entry point at some hierarchy
 * 	in the Syringe application.
 * @argument _config `ModuleConfiguration`
 */
export function inject<T = any>(_module: Token, _config?: ModuleConfiguration): T {
	// register providers
	if (_config?.providers)
		_provide(_module, ..._config.providers)

	const _key = _extractEntityName(_module)
	const _token: InjectionToken = getToken(_key)
	const _scope = _config?.scope || _token.scope || _token.factory
	return _generate(_scope, _token) as T
}

/**
 * @author kuro <kuro@kuroi.io>
 * @namespace kuroi.io.Syringe.Container
 * @description Registers a dependency to the Container at a given index of
 * 	of the dependent's constructor.
 */
export function addDependency(_client: Constructor, _dependency: string, _index: number): void {
	if (!DEPENDENCY_MAP.has(_client.name))
		DEPENDENCY_MAP.set(_client.name, [])
	const _dependencies: string[] = DEPENDENCY_MAP.get(_client.name)
	_dependencies[_index] = _dependency
}

/**
 * @author kuro <kuro@kuroi.io>
 * @namespace kuroi.io.Syringe.Container
 * @description Returns a token by a given key.
 */
export function getToken(_key: any): InjectionToken {
	_key = _extractEntityName(_key)
	if (PROVIDERS.has(_key))
		_key = PROVIDERS.get(_key)
	const _token: InjectionToken = TOKENS.get(_key)
	if (!_token)
		throw new NullInjectionTokenError(_key)
	
	return _token
}

/**
 * @author kuro <kuro@kuroi.io>
 * @namespace kuroi.io.Syringe.Container
 * @description Destroys an instance an cleans up any of its scoped dependencies.
 */
export function destroyInstance(_scope: InjectionScope, _token: InjectionToken): void {
	const _instanceMap: Map<InjectionToken, any> = INSTANCES.get(_scope)
	if (_instanceMap) {
		const _instance: any = _instanceMap.get(_token)
		if (
			_instance &&
			_instance.onDestroy &&
			typeof _instance.onDestroy === "function"
		) {
			_instance.onDestroy()
		}
		_instanceMap.delete(_token)
		if (!_instanceMap.size)
			INSTANCES.delete(_scope)
		const _factory: any = _token.factory
		if (INSTANCES.has(_factory)) {
			INSTANCES.get(_factory).forEach((_instance, _token) => {
				destroyInstance(_factory, _token)
			})
		}
	}
}

/**
 * @author kuro <kuro@kuroi.io>
 * @namespace kuroi.io.Syringe.Container
 * @description Clears all objects generated by the Container.
 */
export function destroyAllInstances(): void {
	INSTANCES.forEach((_instanceMap: Map<InjectionToken, any>, _scope: InjectionScope) =>
		_instanceMap.forEach((_, _token: InjectionToken) =>
			destroyInstance(_scope, _token)
		)
	)
}
//#endregion

//#region private methods
function _provide(_scope: InjectionScope, ..._providers: Provider[]): void {
	_providers.forEach(_provider => {
		_provider = new Provider(_scope, _provider.for, _provider.provide)
		const _key: string = _extractEntityName(_provider.for)
		if (_provider.provide.use) {
			if (_provider.provide.use instanceof InjectionToken) {
				TOKENS.set(_key, _provider.provide.use)
			} else {
				PROVIDERS.set(_key, _extractEntityName(_provider.provide.use))
			}
		} else if (_provider.provide.instance) {
			new InjectionToken(_key, {
				scope: _provider.scope || "global",
				factory: () => _provider.provide.instance
			})
		}
	})
}

function _generate(_scope: InjectionScope, _token: InjectionToken): any {
	const _cachedInstance: any = _getCachedInstance(_scope, _token)
	if (_cachedInstance)
		return _cachedInstance
	_checkForCircularDependency(_token)
	const _dependencies: any[] = _generateDependencies(_scope, _token)
	const _instance: any = _processTokenFactory(_token.factory(), _dependencies)
	if (_instance?.onInit && typeof _instance.onInit === "function")
		_instance.onInit()
	_cacheInstance(_scope, _token, _instance)
	return _instance
}

function _getCachedInstance(_scope: InjectionScope, _token: InjectionToken): any | null {
	if (INSTANCES.has(_scope))
		return INSTANCES.get(_scope).get(_token) || null

	return null
}

function _cacheInstance(_scope: InjectionScope, _token: InjectionToken, _instance: any): void {
	if (!_scope)
		console.warn("Undefined scope for " + _token.key)

	if (!INSTANCES.has(_scope))
		INSTANCES.set(_scope, new Map())
	
	INSTANCES.get(_scope).set(_token, _instance)
}

function _generateDependencies(_scope: InjectionScope, _token: InjectionToken): any[] {
	const _dependencies: string[] = DEPENDENCY_MAP.get(_token.key) || []
	return _dependencies.map(
		(_dependency: string) => {
			const _dependencyToken: InjectionToken = getToken(_dependency)
			return _generate(
				_dependencyToken.scope || _token.factory,
				_dependencyToken
			)
		}
	)
}

function _processTokenFactory(_factory: Constructor<any> | any, _dependencies: any[]): any {
	if (_hasConstructor(_factory))
		return Reflect.construct(_factory, _dependencies)

	return _factory
}

function _hasConstructor(_factory: any): boolean {
	return !!_factory.prototype?.constructor
}

function _checkForCircularDependency(_token: InjectionToken): void {
	const _dependencies: any[] = DEPENDENCY_MAP.get(_token.key)
	if (!_dependencies || !_dependencies.length) {
		return
	}
	for (let i = 0; i < _dependencies.length; i++) {
		if (_dependencies[i] === _token.key)
			throw new CircularDependencyError(`${_token.key} lists itself as a dependency!`)
		const _nestedDependencies: any[] = DEPENDENCY_MAP.get(_dependencies[i])
		if (_nestedDependencies) {
			if (_nestedDependencies.indexOf(_token.key) > -1)
				throw new CircularDependencyError(`${_token.key} -> ${_dependencies[i]} -> ${_token.key}`)
		}
	}
}

function _extractEntityName(_entity: Function | string | any): string {
	if (_entity instanceof InjectionToken)
		return _entity.key

	if (typeof _entity === "function")
		return _entity.name

	if (typeof _entity === "string")
		return _entity

	if (_entity.name)
		return _entity.name
}
//#endregion