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
    if (typeof _key === 'function') {
      _key = _key.name
    }
    const _token = InjectionTokens.get(_key)
    if (_token) {
      // create own scope if none detected to keep instances separate
      const _scope = _token.scope || generateId()
      const _instance = _generate(_scope, _token)
      return _instance as T
    }
    throw new NullInjectionTokenError('No injection token for "' + _key + '"')
  }

  export function addDependency(_injectionClient: Object, _token: InjectionToken, _index: number) {
    if (!DependencyMap.has(_injectionClient['name'])) {
      DependencyMap.set(_injectionClient['name'], [])
    }
    const _dependencies = DependencyMap.get(_injectionClient['name'])
    if (!_dependencies[_index]) {
      _dependencies[_index] = _token.name
    }
    return inject(_token.name)
  }

  export function getToken(_key: string): InjectionToken {
    const _token = InjectionTokens.get(_key)
    if (!_token) {
      throw new Error('Invalid token: ' + _key)
    }
    return _token
  }
  //#endregion

  //#region private functions
  function _generate(_scope: any, _token: InjectionToken): any {
    const _cachedInstance: any = _getCachedInstance(_scope, _token)
    if (_cachedInstance) {
      return _cachedInstance
    }
    _checkForCircularDependency(_token)
    const _dependencies: any[] = _recursivelyGenerateDependencies(_scope, _token)
    const _instance: any = _processTokenFactory(_token.factory(), _dependencies)
    _cacheInstance(_scope, _token, _instance)
    return _instance
  }

  function _getCachedInstance(_scope: any, _token: InjectionToken): any | null {
    if (CachedInstances.has(_scope)) {
      const _instance = CachedInstances.get(_scope).get(_token.id)
      if (_instance) {
        return _instance
      }
    }
    return null
  }

  function _recursivelyGenerateDependencies(_scope: any, _token: InjectionToken): any[] {
    return (DependencyMap.get(_token.name) || []).map(
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
  //#endregion

}