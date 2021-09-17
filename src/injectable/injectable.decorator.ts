import { registerToken } from '../container'
import { InjectionToken, InjectionTokenConfig } from '../injection-token'

/**
 * @description Decorates a class as an injectable entity, generates an InjectionToken,
 *  and registers it to the Container
 * @see Container
 * @see InjectionToken
 */
export const Injectable = (_token?: InjectionTokenConfig) => (_constructor: Function) => {
  const _key: string = _token && _token.name || _constructor.name
  const _injectionToken: InjectionToken = new InjectionToken(_key, {
    name: _key,
    scope: _token && _token.scope,
    factory: () => _constructor
  })
  registerToken(_injectionToken)
}
