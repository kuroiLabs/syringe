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
		class Injected extends Class { }
		const _key: string = _token && _token.name || Class.name
		Object.defineProperty(Injected, "name", { value:  _key })
		new InjectionToken(_key, {
			name: _key,
			scope: _token && _token.scope,
			factory: () => Injected
		})
		return Injected;
	}
}
