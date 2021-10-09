import { Container } from '../container'
import { InjectionToken } from '../injection-token'
import { CircularDependencyError, NullInjectionTokenError } from '../utils'

/**
 * @description Decorates injected constructor parameters
 */
export function Inject(_token: InjectionToken | Function) {
  return function _injectDecorator(
    _target: Object,
    _key: string | symbol,
    _index: number
  ) {
    if (!_token) {
      throw new CircularDependencyError(
        `${_target['name']} requested an InjectionToken (index [${_index}]) before it was initialized`
      )
    }
    const _injectionToken: InjectionToken = Container.getToken(_token.name)
    if (!_injectionToken) {
      throw new NullInjectionTokenError(_token.name)
    }
    Container.addDependency(_target, _injectionToken, _index)
  }
}
