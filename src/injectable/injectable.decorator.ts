import { destroyInstance } from '../container'
import { InjectionToken } from '../injection-token/injection-token'
import { InjectionTokenConfig } from '../injection-token/injection-token-config.interface'

/**
 * @description Decorates a class as an injectable entity, generates an InjectionToken,
 *  and registers it to the Container
 * @see InjectionToken
 * @see Container
 */
export const Injectable = (_token?: InjectionTokenConfig) => (_constructor: Function) => {
  const _key: string = _token && _token.name || _constructor.name
  const _injectionToken: InjectionToken = new InjectionToken(_key, {
    name: _key,
    scope: _token && _token.scope,
    factory: () => _constructor
  })
  // add hidden injectable methods
  _constructor.prototype.__initInjectable = () => {
    if (_constructor.prototype.onInit) {
      _constructor.prototype.onInit()
    }
  }
  _constructor.prototype.__destroyInjectable = () => {
    destroyInstance(_injectionToken.scope, _constructor)
    if (_constructor.prototype.onDestroy) {
      _constructor.prototype.onDestroy()
    }
  }
}
