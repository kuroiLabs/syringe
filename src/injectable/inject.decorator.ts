import { Container } from '../container'
import { InjectionToken } from '../injection-token/injection-token'

/**
 * Decorates injected constructor parameters
 */
export function Inject(_token: InjectionToken | Function) {
  if (!(_token instanceof InjectionToken) && typeof _token === 'function') {
    _token = Container.getToken(_token.name)
  }
  return function (_target: Object, _key: string | symbol, _index: number) {
    Container.addDependency(_target, <InjectionToken>_token, _index)
    return Container.inject(_token.name)
  }
}