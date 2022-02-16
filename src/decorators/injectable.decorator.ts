import { InjectionToken } from '../injection-token/injection-token'
import { InjectionTokenConfig } from '../injection-token/injection-token-config.interface'
import { Constructor } from '../utils'

/**
 * @description Decorates a class as an injectable entity, generates an InjectionToken,
 *  which automatically registters with the Container
 * @see InjectionToken
 * @see Container
 */
export function Injectable<T extends Constructor>(_token?: InjectionTokenConfig) {
	return function _injectableDecorator(Class: T) {
		new InjectionToken(Class.name, {
			scope: _token && _token.scope,
			factory: () => Class
		})
	}
}
