import * as Syringe from "../../src"

// manually constructed injection token to represent constant value
const helloMessage = 'Jerry, hello!'
export const HELLO = new Syringe.InjectionToken('HELLO_MESSAGE', {
  factory: () => helloMessage,
  scope: 'global'
})
