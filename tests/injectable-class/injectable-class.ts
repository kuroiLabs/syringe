import * as Syringe from "../../src"
import { Extra } from '../decorator'
import { GENERATE_ID } from '../generator'
import { BaseInstanceService } from '../instance-service'
import { HELLO } from '../message'

// non-singleton, scoped injectable
@Syringe.Injectable()
@Extra
export class InjectableClass implements Syringe.OnInit, Syringe.OnDestroy {

	private id: string

	constructor(
		@Syringe.Inject(HELLO) private message: any,
		@Syringe.Inject(GENERATE_ID) _generator: () => string,
		@Syringe.Inject(BaseInstanceService) private _instance: BaseInstanceService
	) {
		this.id = _generator()
	}

	public onInit() {
		this.hello()
		this._instance.hello()
	}

	public onDestroy() {
		this.goodbye()
	}

	private hello(): void {
		console.log(`InjectableClass::${this.id}`, this.message)
	}

	private goodbye(): void {
		console.log(`InjectableClass::${this.id}`, 'No hello???')
	}

}