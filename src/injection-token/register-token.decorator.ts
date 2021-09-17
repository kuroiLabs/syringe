import { registerToken } from '../container'

/**
 * @description Wraps the InjectionToken constructor to allow for code execution
 *  after the fact in order to auto-register the token after creation
 */
export function RegisterToken<T extends {new(...args: any[]): {}}>(target: T) {
  return class extends target {
    constructor(...args: any[]) {
      super(...args)
      registerToken(<any>this)
    }
  }
}
