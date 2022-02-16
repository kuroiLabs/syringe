import { InjectionScope } from './injection-scope.type'

export interface InjectionTokenConfig {
	key?: string
	scope?: InjectionScope
	factory?: () => any
}