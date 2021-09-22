import { InjectionToken } from '../injection-token/injection-token'
import { InjectionTokenConfig } from '../injection-token/injection-token-config.interface'

/**
 * @description Decorates a class as an injectable entity, generates an InjectionToken,
 *  which automatically registters with the Container
 * @see InjectionToken
 * @see Container
 */
export const Injectable = (_token?: InjectionTokenConfig) => {
  return function _injectableDecorator(_constructor: Function) {
    const _key: string = _token && _token.name || _constructor.name
    new InjectionToken(_key, {
      name: _key,
      scope: _token && _token.scope,
      factory: () => _constructor
    })
  }
}
