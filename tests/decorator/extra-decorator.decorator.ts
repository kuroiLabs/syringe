import { Constructor } from "../../src/utils";

/** Extra decorator to test if Syringe decorators play nice with others */
export function Extra<T extends Constructor>(Class: T) {
	return class extends Class {
		constructor(...args: any[]) {
			super(...args)
		}
	}
}
