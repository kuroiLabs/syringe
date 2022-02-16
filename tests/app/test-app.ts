import { Syringe } from "../../src"
import { Extra } from "../decorator"
import { GENERATE_ID } from "../generator"
import { Service } from "../test-service"

@Syringe.Injectable({
	scope: "global"
})
@Extra
export class TestApp implements Syringe.OnInit {

	private id: string

	constructor(
		@Syringe.Inject(Service) public service: Service,
		@Syringe.Inject(GENERATE_ID) _generator: () => string
	) {
		this.id = _generator()
	}

	public onInit(): void {
		this.hello()
	}

	public onDestroy(): void {
		this.goodbye()
	}

	private hello() {
		console.log("TestApp:::" + this.id, "Hello!")
	}

	private goodbye() {
		console.log("TestApp:::" + this.id, "Goodbye!")
	}

}