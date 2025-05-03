import { beforeEach, describe, expect, test } from "vitest";
import { IProvider } from "../common";
import { NullInjectorError, NullProviderError } from "../utils";
import { inject } from "./inject";
import { Injector } from "./injector";

describe("inject", () => {
	const token: string = "test";
	let injector: Injector;
	let value: any;
	let provider: IProvider<string>;

	beforeEach(() => {
		provider = { token, provide: () => token };
	});

	test("should throw a NullInjectorError if no Injector context", () => {
		expect(() => inject(token)).toThrow(NullInjectorError);
	});

	test("should return the value if the injector has a provider", () => {
		injector = new Injector({ providers: [provider] });
		value = injector.use(() => inject(token));

		expect(value).toBe(token);
	});

	test("should work with inline class member assignment", () => {
		class TestService {

		}

		class TestClass {
			public readonly service: TestService = inject(TestService);
		}

		injector = new Injector({
			providers: [
				{
					token: TestService,
					provide: () => new TestService()
				},
				{
					token: TestClass,
					provide: () => new TestClass()
				}
			]
		});

		const testClass: TestClass = injector.get(TestClass);
		const testService: TestService = injector.get(TestService);

		expect(testClass.service).toBe(testService);
	});

	describe("options", () => {
		beforeEach(() => {
			injector = new Injector();
		});

		describe("optional flag", () => {
			test("should return undefined with no error if optional is true", () => {
				value = injector.use(() => inject(token, { optional: true }));
	
				expect(value).toBe(undefined);
			});
	
			test("should throw a NullProviderError if no provider and optional is false", () => {
				expect(() => injector.use(() => inject(token))).toThrow(NullProviderError);
			})
		});
	
		describe("notFoundValue", () => {
			let notFoundValue: string;

			beforeEach(() => {
				notFoundValue = "oh well";
			});

			test("should fall back to notFoundValue if supplied", () => {
				value = injector.use(() => inject(token, { notFoundValue }));
				expect(value).toBe(notFoundValue);
			});

			test("should throw a NullProviderError if notFoundValue not supplied", () => {
				expect(() => injector.use(() => inject(token))).toThrow(NullProviderError);
			});
		});

		describe("preferParent", () => {
			const alt: string = "alt";

			beforeEach(() => {
				injector.register({ token, provide: () => alt });
				injector = new Injector({ parent: injector, providers: [provider] });
			});

			test("should provide the value from the parent injector if preferParent is true", () => {
				value = injector.use(() => inject(token));
				expect(value).toBe(token);

				value = injector.use(() => inject(token, { preferParent: true }));
				expect(value).toBe(alt);
			});
		});
	});
});