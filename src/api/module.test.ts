import { describe, expect, test } from "vitest";
import { inject } from "./inject";
import { Injector } from "./injector";
import { Module } from "./module";

describe("Module", () => {
	let module: Module;
	const token: string = "test";

	test("should provide itself", () => {
		module = new Module();
		expect(module.run(() => inject(Module))).toBe(module);
	});

	test("should use specified parent injector", () => {
		const parent: Injector = new Injector({
			providers: [{
				token,
				provide: () => token
			}]
		});

		module = new Module({ injector: parent });

		expect(() => module.inject(token)).not.toThrow();
	});

	test("should pull providers from imported modules", () => {
		module = new Module({
			imports: [
				new Module({
					providers: [{
						token,
						provide: ()	=> 100
					}]
				})
			]
		});

		expect(module.inject(token)).toBe(100);
	});
});