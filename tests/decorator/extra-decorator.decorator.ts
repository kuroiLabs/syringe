import { Constructor } from "../../src/utils";

/** Extra decorator to test if Syringe decorators play nice with others */
export function Extra<T extends Constructor>(Class: T) {
	return new Proxy(Class, {
		construct(_class: T, _arguments: any[]) {
			return Reflect.construct(_class, _arguments)
		}
	})
}
