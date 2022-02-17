import { addDependency, InjectionToken } from "../container"
import { Constructor } from "../utils"

/**
 * @description Decorates injected constructor parameters to register dependencies
 */
export function Inject(_token: InjectionToken | Function | string) {
	return function _injectDecorator(
		_target: Constructor,
		_key: string | symbol,
		_index: number
	) {
		if (!_token) {
			throw new ReferenceError(`${_target.name} requested an InjectionToken (index [${_index}]) before it was initialized`)
		}
		const _injectionKey: any = (typeof _token === "string") ? _token :
			(typeof _token === "function" ? _token.name : _token.key)
		addDependency(_target, _injectionKey, _index)
	}
}
