import { generateId } from '../utils'
import { InjectionTokenConfig } from './injection-token-config.interface'
import { RegisterToken } from './register-token.decorator'

@RegisterToken
export class InjectionToken implements InjectionTokenConfig {

  public id: string

  public name: string

  public scope: any

  public factory: () => any

  get isSingleton(): boolean {
    return this.scope === 'global'
  }

  constructor(_name: string, _config: InjectionTokenConfig) {
    this.id = generateId()
    this.name = _name
    this.scope = _config.scope
    this.factory = _config.factory
  }

}
