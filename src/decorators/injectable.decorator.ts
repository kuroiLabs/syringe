import { InjectionToken } from "../container"
import { Constructor } from "../utils"

/**
 * @author kuro <kuro@kuroi.io>
 * @namespace kuroi.io.Syringe.Decorators
 * @description Decorates a class as an injectable entity, generates an InjectionToken,
 *  which automatically registters with the Container
 * @see InjectionToken
 * @see Container
 */
export function Injectable<T extends Constructor>(_token?: Pick<InjectionToken, "scope">) {
	return function _injectableDecorator(Class: T) {
		new InjectionToken(Class.name, {
			scope: _token && _token.scope,
			factory: () => Class
		})
	}
}
