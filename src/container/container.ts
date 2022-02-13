import { InjectionScope, InjectionToken } from '../injection-token'
import { CircularDependencyError, NullInjectionTokenError } from '../utils'

export namespace Container {

  //#region maps and caches
  const TOKENS = new Map<string, InjectionToken>() // token name -> token
  const DEPENDENCY_MAP = new Map<string, string[]>() // token name -> dependency names
  const INSTANCES = new Map<InjectionScope, Map<InjectionToken, any>>() // scope -> token ID -> cached instance
  //#endregion

  //#region public functions
  export function registerToken(_token: InjectionToken): void {
    TOKENS.set(_token.name, _token)
  }

  export function inject<T = any>(_key: string | Function, _scope?: InjectionScope): T {
    _key = _extractEntityName(_key)
    const _token: InjectionToken = getToken(_key)
    _scope = _scope || _token.scope || _token.factory
    return _generate(_scope, _token) as T
  }

  export function addDependency(_client: Object, _token: InjectionToken, _index: number): void {
    if (!DEPENDENCY_MAP.has(_client['name'])) {
      DEPENDENCY_MAP.set(_client['name'], [])
    }
    const _dependencies: string[] = DEPENDENCY_MAP.get(_client['name'])
    _dependencies[_index] = _token.name
  }

  export function getToken(_key: Function | string): InjectionToken {
    _key = _extractEntityName(_key)
    const _token: InjectionToken = TOKENS.get(_key)
    if (!_token) {
      throw new NullInjectionTokenError(_key)
    }
    return _token
  }

  export function destroyInstance(_scope: InjectionScope, _token: InjectionToken): void {
    const _instanceMap: Map<InjectionToken, any> = INSTANCES.get(_scope)
    if (_instanceMap) {
      const _instance: any = _instanceMap.get(_token)
      if (
        _instance &&
        _instance.onDestroy &&
        typeof _instance.onDestroy === 'function'
      ) {
        _instance.onDestroy()
      }
      _instanceMap.delete(_token)
      if (!_instanceMap.size) {
        INSTANCES.delete(_scope)
      }
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
      typeof _instance.onInit === 'function'
    ) {
      _instance.onInit()
    }
    _cacheInstance(_scope, _token, _instance)
    return _instance
  }

  function _getCachedInstance(_scope: InjectionScope, _token: InjectionToken): any | null {
    if (INSTANCES.has(_scope)) {
      return INSTANCES.get(_scope).get(_token) || null
    }
    return null
  }

  function _cacheInstance(_scope: InjectionScope, _token: InjectionToken, _instance: any): void {
    if (!_scope) {
      console.warn('Undefined scope for ' + _token.name)
    }
    if (!INSTANCES.has(_scope)) {
      INSTANCES.set(_scope, new Map())
    }
    INSTANCES.get(_scope).set(_token, _instance)
  }

  function _generateDependencies(_scope: InjectionScope, _token: InjectionToken): any[] {
    const _dependencies: string[] = DEPENDENCY_MAP.get(_token.name) || [] 
    return _dependencies.map(
      (_dependencyName: string) => {
        const _dependencyToken: InjectionToken = getToken(_dependencyName)
        return _generate(
          _dependencyToken.scope || _token.factory,
          _dependencyToken
        )
      }
    )
  }

  function _processTokenFactory(_factory: Function | any, _dependencies: any[]): any {
    if (typeof _factory === 'function') {
      const _constructor: any = _factory.bind.apply(_factory, [null, ..._dependencies])
      return new _constructor()
    } else {
      return _factory
    }
  }

  function _checkForCircularDependency(_token: InjectionToken): void {
    const _dependencies: string[] = DEPENDENCY_MAP.get(_token.name)
    if (!_dependencies || !_dependencies.length) {
      return
    }
    for (let i = 0; i < _dependencies.length; i++) {
      if (_dependencies[i] === _token.name) {
        throw new CircularDependencyError(`${_token.name} lists itself as a dependency!`)
      }
      const _nestedDependencies: string[] = DEPENDENCY_MAP.get(_dependencies[i])
      if (_nestedDependencies) {
        if (_nestedDependencies.indexOf(_token.name) > -1) {
          throw new CircularDependencyError(`${_token.name} -> ${_dependencies[i]} -> ${_token.name}`)
        }
      }
    }
  }
  
  function _extractEntityName(_entity: Function | string): string {
    if (typeof _entity === 'function') {
      return _entity.name
    }
    return _entity
  }
  //#endregion

}