import * as Syringe from "../../src"
import { Extra } from "../decorator";
import { GENERATE_ID } from "../generator";
import { InjectableClass } from "../injectable-class";

@Syringe.Injectable({
	scope: "global"
})
@Extra
export class OtherService implements Syringe.OnInit, Syringe.OnDestroy {

	private id: string

	constructor(
		@Syringe.Inject(GENERATE_ID) _generator: () => string,
		@Syringe.Inject(InjectableClass) private dependency: InjectableClass
	) {
		this.id = _generator()
	}

	public onInit() {
		this.hello()
	}

	public onDestroy() {
		this.goodbye()
	}

	private hello(): void {
		console.log(`OtherService::${this.id}`, 'Hello!')
	}

	private goodbye(): void {
		console.log(`OtherService::${this.id}`, 'Goodbye!')
	}

}