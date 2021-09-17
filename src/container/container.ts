import { InjectionToken } from '../injection-token'
import { generateId, CircularDependencyError, NullInjectionTokenError } from '../utils'

export namespace Container {
  
  //#region private values
  const InjectionTokens = new Map<string, InjectionToken>() // token name -> token
  const DependencyMap = new Map<string, string[]>() // token name -> dependency names
  const CachedInstances = new Map<any, Map<string, any>>() // scope -> token ID -> cached instance
  //#endregion

  //#region public functions
  export function registerToken(_token: InjectionToken): void {
    InjectionTokens.set(_token.name, _token)
  }

  export function inject<T = any>(_key: string | Function): T {
    _key = _extractEntityName(_key)
    const _token = InjectionTokens.get(_key)
    if (_token) {
      // create own scope if none detected to keep instances separate
      const _scope = _token.scope || generateId()
      return _generate(_scope, _token) as T
    }
    throw new NullInjectionTokenError(_key)
  }

  export function addDependency(_client: Object, _token: InjectionToken, _index: number): void {
    if (!DependencyMap.has(_client['name'])) {
      DependencyMap.set(_client['name'], [])
    }
    const _dependencies = DependencyMap.get(_client['name'])
    if (!_dependencies[_index]) {
      _dependencies[_index] = _token.name
    }
  }

  export function getToken(_key: Function | string): InjectionToken {
    _key = _extractEntityName(_key)
    const _token = InjectionTokens.get(_key)
    if (!_token) {
      throw new NullInjectionTokenError(_key)
    }
    return _token
  }

  export function closeScope(_key: Function | string): void {
    const _token: InjectionToken = getToken(_key)
    const _scope: any = _token.scope
    if (_scope) {
      CachedInstances.delete(_scope)
    }
  }

  export function destroyInstance(_scope: any, _key: Function | string): void {
    const _instanceMap = CachedInstances.get(_scope)
    if (_instanceMap) {
      _key = _extractEntityName(_key)
      _instanceMap.delete(_key)
    }
  }
  //#endregion

  //#region private functions
  function _generate(_scope: any, _token: InjectionToken): any {
    const _cachedInstance: any = _getCachedInstance(_scope, _token)
    if (_cachedInstance) {
      return _cachedInstance
    }
    _checkForCircularDependency(_token)
    const _dependencies: any[] = _generateDependencies(_scope, _token)
    const _instance: any = _processTokenFactory(_token.factory(), _dependencies)
    _cacheInstance(_scope, _token, _instance)
    return _instance
  }

  function _getCachedInstance(_scope: any, _token: InjectionToken): any | null {
    if (CachedInstances.has(_scope)) {
      return CachedInstances.get(_scope).get(_token.id) || null
    }
    return null
  }

  function _generateDependencies(_scope: any, _token: InjectionToken): any[] {
    const _dependencies: any[] = DependencyMap.get(_token.name) || [] 
    return _dependencies.map(
      _dependencyName => {
        const _dependencyToken = getToken(_dependencyName)
        const _dependencyInstance = _generate(_dependencyToken.scope, _dependencyToken)
        _cacheInstance(_scope, _dependencyToken, _dependencyInstance)
        return _dependencyInstance
      }
    )
  }

  function _processTokenFactory(_factory: Function | any, _dependencies: any[]): any {
    let _instance: any
    if (typeof _factory === 'function') {
      const _constructor = _factory.bind.apply(_factory, [null, ..._dependencies])
      _instance = new _constructor()
    } else {
      _instance = _factory
    }
    return _instance
  }

  function _checkForCircularDependency(_token: InjectionToken): void {
    const _dependencies: string[] = DependencyMap.get(_token.name)
    if (!_dependencies || !_dependencies.length) {
      return
    }
    const _circularDependencyIndex: number = _dependencies.indexOf(_token.name)
    if (_circularDependencyIndex > -1) {
      const _circularDependencyName: string = _dependencies[_circularDependencyIndex]
      throw new CircularDependencyError(`${_circularDependencyName} -> ${_token.name} -> ${_circularDependencyName}`)
    }
  }

  function _cacheInstance(_scope: string, _token: InjectionToken, _instance: any): void {
    if (!CachedInstances.has(_scope)) {
      CachedInstances.set(_scope, new Map())
    }
    CachedInstances.get(_scope).set(_token.id, _instance)
  }
  
  function _extractEntityName(_entity: Function | string): string {
    if (typeof _entity === 'function') {
      return _entity.name
    }
    return _entity
  }
  //#endregion

}