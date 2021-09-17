export namespace Syringe {

  //#region Private properties/values

  type TokenId = string
  type TokenName = string
  type InjectionScope = string

  const _injectionTokens = new Map<TokenName, InjectionToken>()

  const dependencyMap = new Map<string, string[]>()

  const cache = new Map<InjectionScope, Map<TokenId, any>>()

  //#endregion
  
  // @todo: replace with IdGenerator
  export function generateId(): string {
    return (Math.random() * 10**10).toString(16).substring(2, 8)
  }

  //#region Injection Token

  export interface InjectionTokenConfig {
    name?: string
    scope?: any
    factory?: () => any
  }

  export class InjectionToken implements InjectionTokenConfig {
    public id: string
    public name: string
    public scope: any
    public factory: () => any
    get isSingleton(): boolean {
      return this.scope === 'global'
    }
    constructor(_name: string, _token: InjectionTokenConfig) {
      this.id = generateId()
      this.name = _name
      this.scope = _token.scope
      this.factory = _token.factory
      _registerToken(this)
    }
  }

  //#endregion

  //#region Injection

  export const Injectable = (_token?: InjectionTokenConfig) => {
    return function _injectable(_constructor: Function) {
      const _key: string = _token && _token.name || _constructor.name
      const _injectionToken: InjectionToken = new InjectionToken(_key, {
        name: _key,
        scope: _token && _token.scope,
        factory: () => _constructor
      })
      _registerToken(_injectionToken)
    }
  }

  export function Inject(_token: InjectionToken | Function) {
    if (!(_token instanceof InjectionToken) && typeof _token === 'function') {
      _token = _getToken(_token.name)
    }
    return function (_target: Object, _key: string | symbol, _index: number) {
      if (!dependencyMap.has(_target['name'])) {
        dependencyMap.set(_target['name'], [])
      }
      const _dependencies = dependencyMap.get(_target['name'])
      if (!_dependencies[_index]) {
        _dependencies[_index] = _token.name
      }
      return inject(_token.name)
    }
  }

  export function inject<T = any>(_key: string | Function): T {
    if (typeof _key === 'function') {
      _key = _key.name
    }
    const _token = _injectionTokens.get(_key)
    if (_token) {
      if (_token.isSingleton) {
        return _generate('global', _token)
      }
      // create own scope if none detected to keep instances separate
      const _scope = _token.scope || generateId()
      const _instance = _generate(_scope, _token)
      _cacheInstance(_token.scope, _token, _instance)
      return _instance as T
    }
    throw new Error('No injection token for ' + _key)
  }

  //#endregion

  //#region Private functions

  function _registerToken(_token: InjectionToken): void {
    _injectionTokens.set(_token.name, _token)
  }

  function _generate(_scope: any, _token: InjectionToken): any {
    // check if instance has already been generated
    if (cache.has(_scope)) {
      const _instance = cache.get(_scope).get(_token.id)
      if (_instance) {
        return _instance
      }
    }
    // recursively generate dependencies
    const _dependencies = (dependencyMap.get(_token.name) || []).map(
      _dependencyName => {
        const _dependencyToken = _getToken(_dependencyName)
        const _dependencyInstance = _generate(_dependencyToken.scope, _dependencyToken)
        _cacheInstance(_scope, _dependencyToken, _dependencyInstance)
        return _dependencyInstance
      }
    )
    const _factory = _token.factory()
    let _instance: any
    if (typeof _factory === 'function') {
      const _constructor = _factory.bind.apply(_factory, [null, ..._dependencies])
      _instance = new _constructor()
    } else {
      _instance = _factory
    }
    if (_token.isSingleton) {
      _cacheInstance(_scope, _token, _instance)
    }
    return _instance
  }

  export function _hasCircularDependency(_name: string): boolean {
    const _dependencies: string[] = dependencyMap.get(_name)
    for (const _dependency of _dependencies) {
      if (dependencyMap.get(_dependency).indexOf(_name) > -1) {
        return true
      }
    }
    return false
  }

  function _getToken(_key: string): InjectionToken {
    const _token = _injectionTokens.get(_key)
    if (!_token) {
      throw new Error('Invalid token: ' + _key)
    }
    return _token
  }

  function _cacheInstance(_scope: string, _token: InjectionToken, _instance: any): void {
    if (cache.has(_scope)) {
      cache.get(_scope).set(_token.id, _instance)
    } else {
      cache.set(_scope, new Map([[_token.id, _instance]]))
    }
  }

  //#endregion

}
