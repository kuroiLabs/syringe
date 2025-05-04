import { describe, expect, test } from "vitest";
import { Injector } from "./injector";
import { Module } from "./module";
import { ProviderToken } from "../common";

describe("Module", () => {
	let module: Module;
	const token: ProviderToken = new ProviderToken("test");

	test("should provide itself", () => {
		module = new Module();
		expect(module.inject(Module)).toBe(module);
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

	test("hasProvider should return true if the provider exists anywhere in its scope", () => {
		class ProvidedClass {

		}

		const parent: Injector = new Injector({
			providers: [{
				token: ProvidedClass,
				provide: () => new ProvidedClass()
			}]
		});

		module = new Module({
			imports: [new Module({ injector: parent })]
		});

		expect(module.hasProvider(ProvidedClass)).toBe(true);
	});
});