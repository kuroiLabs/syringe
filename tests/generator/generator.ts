import * as Syringe from "../../src"
import { generateId } from "../../src/utils"

export const GENERATE_ID = new Syringe.InjectionToken("GENERATE_ID", {
	scope: "global",
	factory: () => () => generateId()
})
