import { InjectionScope } from './injection-scope.type'

export interface InjectionTokenConfig {
  name?: string
  scope?: InjectionScope
  factory?: () => any
}