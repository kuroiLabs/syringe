import { Container } from '../container'
import { Constructor } from '../utils'

/**
 * @description Wraps the InjectionToken constructor to allow for code execution
 *  after the fact in order to auto-register the token after creation
 */
export function RegisterToken<T extends Constructor>(Class: T) {
	return new Proxy(Class, {
		construct(_class: T, _args: any[]) {
			const _token = Reflect.construct(_class, _args);
			Container.registerToken(<any>_token);
			return _token;
		}
	})
}
