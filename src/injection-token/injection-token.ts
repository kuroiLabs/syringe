import { Constants, Constructor, generateId } from '../utils'
import { InjectionScope } from './injection-scope.type'
import { InjectionTokenConfig } from './injection-token-config.interface'
import { RegisterToken } from './register-token.decorator'

@RegisterToken
export class InjectionToken implements InjectionTokenConfig {

	public id: string

	public key: string

	public scope: InjectionScope

	public factory: () => any

	get isSingleton(): boolean {
		return this.scope === Constants.GLOBAL_SCOPE
	}

	constructor(_key: any, _config: InjectionTokenConfig) {
		this.id = generateId()
		this.key = _key
		this.scope = _config.scope
		this.factory = _config.factory
	}

}
