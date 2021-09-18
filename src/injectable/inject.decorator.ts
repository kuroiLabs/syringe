import { Container } from '../container'
import { InjectionToken } from '../injection-token'

/**
 * @description Decorates injected constructor parameters
 */
export function Inject(_token: InjectionToken | Function) {
  const _injectionToken: InjectionToken = Container.getToken(_token.name)
  return function _injectDecorator(
    _target: Object,
    _key: string | symbol,
    _index: number
  ) {
    Container.addDependency(_target, _injectionToken, _index)
    return Container.inject(_token.name, _injectionToken.scope || _target)
  }
}
