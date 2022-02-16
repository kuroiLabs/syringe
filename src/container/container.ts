import { InjectionScope, InjectionToken } from "../injection-token"
import { CircularDependencyError, Constructor, IProvider, NullInjectionTokenError } from "../utils"

export namespace Container {

	//#region maps and caches
	const TOKENS = new Map<string, InjectionToken>() // token key -> token
	const DEPENDENCY_MAP = new Map<string, string[]>() // token identifier -> dependency names
	const INSTANCES = new Map<InjectionScope, Map<InjectionToken, any>>() // scope -> token ID -> cached instance
	const PROVIDERS = new Map<any, any>()
	//#endregion

	//#region public functions
	export function registerToken(_token: InjectionToken): void {
		TOKENS.set(_token.key, _token)
	}

	export function inject<T = any>(_key: string | Function, _scope?: InjectionScope, _providers?: IProvider[]): T {
		// register providers before doing anything
		if (_providers)
			_providers.forEach(_provider => provide(_provider))

		_key = _extractEntityName(_key)
		const _token: InjectionToken = getToken(_key)
		_scope = _scope || _token.scope || _token.factory
		return _generate(_scope, _token) as T
	}

	export function addDependency(_client: Constructor, _dependency: string, _index: number): void {
		if (!DEPENDENCY_MAP.has(_client.name)) {
			DEPENDENCY_MAP.set(_client.name, [])
		}
		const _dependencies: string[] = DEPENDENCY_MAP.get(_client.name)
		_dependencies[_index] = _dependency
	}

	export function getToken(_key: any): InjectionToken {
		_key = _extractEntityName(_key)
		if (PROVIDERS.has(_key))
			_key = PROVIDERS.get(_key)

			const _token: InjectionToken = TOKENS.get(_key)
		if (!_token)
			throw new NullInjectionTokenError(_key)
		
		return _token
	}

	export function provide(_provider: IProvider): void {
		PROVIDERS.set(_extractEntityName(_provider.for), _extractEntityName(_provider.use))
	}

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

	export function destroyAllInstances(): void {
		INSTANCES.forEach((_instanceMap: Map<InjectionToken, any>, _scope: InjectionScope) =>
			_instanceMap.forEach((_, _token: InjectionToken) =>
				destroyInstance(_scope, _token)
			)
		)
	}
	//#endregion

	//#region private functions
	function _generate(_scope: InjectionScope, _token: InjectionToken): any {
		const _cachedInstance: any = _getCachedInstance(_scope, _token)
		if (_cachedInstance) {
			return _cachedInstance
		}
		_checkForCircularDependency(_token)
		const _dependencies: any[] = _generateDependencies(_scope, _token)
		const _instance: any = _processTokenFactory(_token.factory(), _dependencies)
		if (
			_instance &&
			_instance.onInit &&
			typeof _instance.onInit === "function"
		) {
			_instance.onInit()
		}
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
			if (_dependencies[i] === _token.key) {
				throw new CircularDependencyError(`${_token.key} lists itself as a dependency!`)
			}
			const _nestedDependencies: any[] = DEPENDENCY_MAP.get(_dependencies[i])
			if (_nestedDependencies) {
				if (_nestedDependencies.indexOf(_token.key) > -1) {
					throw new CircularDependencyError(`${_token.key} -> ${_dependencies[i]} -> ${_token.key}`)
				}
			}
		}
	}

	function _extractEntityName(_entity: Function | string | any): string {
		if (typeof _entity === "function") {
			return _entity.name
		}
		if (typeof _entity === "string") {
			return _entity
		}
		if (_entity.name) {
			return _entity.name
		}
	}
	//#endregion

}