import { Container } from '../container'
import { Constructor } from '../utils'

/**
 * @description Wraps the InjectionToken constructor to allow for code execution
 *  after the fact in order to auto-register the token after creation
 */
export function RegisterToken<T extends Constructor>(Class: T) {
	return class extends Class {
		constructor(...args: any[]) {
			super(...args)
			Container.registerToken(<any>this)
		}
	}
}
