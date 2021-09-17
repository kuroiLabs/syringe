import { addDependency, getToken, inject } from '../container'
import { InjectionToken } from '../injection-token'

/**
 * @description Decorates injected constructor parameters
 */
export function Inject(_token: InjectionToken | Function) {
  if (!(_token instanceof InjectionToken) && typeof _token === 'function') {
    _token = getToken(_token.name)
  }
  return function (_target: Object, _key: string | symbol, _index: number) {
    addDependency(_target, <InjectionToken>_token, _index)
    return inject(_token.name)
  }
}