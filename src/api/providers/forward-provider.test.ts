import { beforeEach, describe, expect, test } from "vitest";
import { NullInjectorError } from "../../common";
import { Injector } from "../injector";
import { ClassProvider } from "./class-provider";
import { ForwardProvider } from "./forward-provider";

describe("ForwardProvider", () => {
	let provider: ForwardProvider;
	let token: any;
	let injector: Injector;
	let value: TestClass;

	class TestClass {

	}

	beforeEach(() => {
		token = "my_token";
		provider = new ForwardProvider(token, () => TestClass);
	});

	test("should find a value for the forwarded token", () => {
		injector = new Injector({ providers: [new ClassProvider(TestClass)] });
		value = injector.get(TestClass);

		injector.use(() => {
			expect(provider.provide()).toBe(value);
		});
	});

	test("should throw a NullInjectorError if no injection context", () => {
		try {
			provider.provide();
		} catch (e) {
			expect(e).toBeInstanceOf(NullInjectorError);
		}
	});
	
});