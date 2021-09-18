import { Container } from '../container'
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
    const _injectionToken: InjectionToken = new InjectionToken(_key, {
      name: _key,
      scope: _token && _token.scope,
      factory: () => _constructor
    })
    // add hidden injectable lifecycle methods
    _constructor.prototype.__initInjectable = () => {
      if (_constructor.prototype.onInit) {
        _constructor.prototype.onInit()
      }
    }
    _constructor.prototype.__destroyInjectable = () => {
      const _scope: any = _injectionToken.scope || _constructor
      Container.destroyInstance(_scope, _injectionToken)
      if (_constructor.prototype.onDestroy) {
        _constructor.prototype.onDestroy()
      }
    }
  }
}
