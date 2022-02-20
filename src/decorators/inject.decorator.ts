import { addDependency, InjectionToken, Token } from "../container"
import { Constructor } from "../utils"

/**
 * @author kuro <kuro@kuroi.io>
 * @namespace kuroi.io.Syringe.Decorators
 * @description Decorates injected constructor parameters to register dependencies
 */
export function Inject(_token: Token) {
	return function _injectDecorator(
		_target: Constructor,
		_key: string | symbol,
		_index: number
	) {
		if (!_token) {
			throw new ReferenceError(`${_target.name} requested an InjectionToken (index [${_index}]) before it was initialized`)
		}
		const _injectionKey: any = _token instanceof InjectionToken ? _token.key : _token.name
		addDependency(_target, _injectionKey, _index)
	}
}
