import * as Syringe from "../../src"
import { generateId } from "../../src/utils";
import { GENERATE_ID } from "../generator";
import { BaseInstanceService } from "./base-instance-service";

class InstanceServiceConcretion extends BaseInstanceService {
	constructor(@Syringe.Inject(GENERATE_ID) generator: () => string) {
		super(generator)
	}
	hello(): void {
		console.log("InstanceServiceConcretion:::Hello, I am an instance of BaseInstanceService! [" + this.id + "]")
	}
}

export const InstanceService = new InstanceServiceConcretion(generateId)