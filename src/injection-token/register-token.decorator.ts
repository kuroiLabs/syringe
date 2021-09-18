import { Container } from '../container'

/**
 * @description Wraps the InjectionToken constructor to allow for code execution
 *  after the fact in order to auto-register the token after creation
 */
export function RegisterToken<T extends { new(...args: any[]): {} }>(_constructor: T) {
  return class extends _constructor {
    constructor(...args: any[]) {
      super(...args)
      Container.registerToken(<any>this)
    }
  }
}
