import * as Syringe from "../../src"

export function generateId(): string {
	const _seed = Math.random() * 10 ** 16
	return _seed.toString(32).substring(0, 10)
}

export const GENERATE_ID = new Syringe.InjectionToken("GENERATE_ID", {
	scope: "global",
	factory: () => () => generateId()
})
