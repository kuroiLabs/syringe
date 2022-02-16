import { InjectionToken } from "../../src/injection-token";
import { generateId } from "../../src/utils";

export const GENERATE_ID = new InjectionToken("GENERATE_ID", {
	scope: "global",
	factory: () => () => generateId()
})
