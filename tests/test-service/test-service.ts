import { Syringe } from '../../src'
import { GENERATE_ID } from '../generator'
import { InjectableClass } from '../injectable-class'
import { OtherService } from '../other-service'
import { BaseTestService } from './base-test-service'

// singleton injectable
@Syringe.Injectable({
	scope: "global"
})
export class Service extends BaseTestService implements Syringe.OnInit, Syringe.OnDestroy {

	constructor(
		@Syringe.Inject(InjectableClass) public dependency: InjectableClass,
		@Syringe.Inject(OtherService) public childService: OtherService,
		@Syringe.Inject(GENERATE_ID) _generator: () => string
	) {
		super(_generator())
	}

	public onInit() {
		this.hello()
	}

	public onDestroy() {
		this.goodbye()
	}

}
