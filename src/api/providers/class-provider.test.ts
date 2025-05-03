import { beforeEach, describe, expect, test } from "vitest";
import { ClassProvider } from "./class-provider";

describe("ClassProvider", () => {
	let provider: ClassProvider<TestClass>;
	let instance: TestClass;

	class TestClass {

	}

	describe("Providing a direct class reference", () => {
		beforeEach(() => {
			provider = new ClassProvider(TestClass);
			instance = provider.provide();
		});
	
		test("should provide a class instance", () => {
			expect(instance).toBeInstanceOf(TestClass);
		});
	});

	describe("Providing a substitute implementation", () => {
		class TestClassImpl extends TestClass {

		}
		
		test("should provide the specified type for the token", () => {
			provider = new ClassProvider(TestClass, TestClassImpl);
			instance = provider.provide();

			expect(instance).toBeInstanceOf(TestClassImpl);
		});
	});
});
