import { beforeEach, describe, expect, MockInstance, test, vi } from "vitest";
import { OnDestroy, OnInit } from "../lifecycle";
import { NullProviderError } from "../utils";
import { Injector } from "./injector";

describe("Injector", () => {
	let injector: Injector;
	let token: string = "mytoken";

	describe("hasProvider", () => {
		test("should return false if no provider", () => {
			injector = new Injector();

			expect(injector.hasProvider(token)).toBe(false);
		});

		test("should return true if existing provider", () => {
			injector = new Injector({
				providers: [{
					token,
					provide: () => token
				}]
			});

			expect(injector.hasProvider(token)).toBe(true);
		});
	});

	describe("register", () => {
		test("should add providers at any point in time", () => {
			injector = new Injector();

			expect(injector.hasProvider(token)).toBe(false);

			injector.register({ token, provide: () => token });

			expect(injector.hasProvider(token)).toBe(true);
		});
	});

	describe("use", () => {
		test("should set the current Injector", () => {
			injector = new Injector();

			injector.use(() => {
				expect(Injector.active).toBe(injector);
			});
		});

		test("should work with async functions", async () => {
			injector = new Injector();

			const result: string = await injector.use(async () => {
				const value: string = await Promise.resolve("youcantmakeatomletwithoutbreakingsomegregs");

				return value;
			});

			expect(result).toBe("youcantmakeatomletwithoutbreakingsomegregs");
		});
	});

	describe("get", () => {
		let value: OnInit;

		beforeEach(() => {
			value = { onInit: vi.fn() };
		});

		test("should retrieve values from providers by token", () => {
			injector = new Injector({
				providers: [{
					token,
					provide: () => value
				}]
			});

			expect(injector.get(token)).toBe(value);

			// inject the same instance again
			injector.get(token);
			expect(value.onInit).toHaveBeenCalledOnce();
		});

		test("should recursively traverse the Injector tree to find a provider", () => {
			injector = new Injector({
				providers: [{
					token,
					provide: () => value
				}]
			});

			for (let i: number = 0; i < 3; i++)
				injector = new Injector({ parent: injector });

			expect(injector.get(token)).toBe(value);
		});

		test("should throw a NullProviderError if no provider", () => {
			injector = new Injector();

			expect(() => injector.get(token)).toThrow(NullProviderError);
		});

		test("should not throw an error provided a not-found value", () => {
			const notFoundValue: string = "i tried";

			injector = new Injector();

			expect(injector.get(token, notFoundValue)).toBe(notFoundValue);
		});

		test("should provide itself", () => {
			injector = new Injector();

			expect(injector.get(Injector)).toBe(injector);
		});
	});

	describe("destroy", () => {
		let destructible: OnDestroy;

		beforeEach(() => {
			destructible = { onDestroy: vi.fn() };
			injector = new Injector({
				providers: [{
					token,
					provide: () => destructible
				}]
			});
		});

		test("should invoke OnDestroy for any OnDestroy implementations", () => {
			injector.get(token);
			injector.destroy();

			expect(destructible.onDestroy).toHaveBeenCalled();
		});

		test("should clear all providers", () => {
			expect(injector.hasProvider(token)).toBe(true);
			injector.destroy();
			expect(injector.hasProvider(token)).toBe(false);
		});

		test("should destroy any child injectors", () => {
			const parent: Injector = new Injector();
			const child: Injector = new Injector({ parent });

			const parentDestroy: MockInstance<() => void> = vi.spyOn(parent, "destroy");
			const childDestroy: MockInstance<() => void> = vi.spyOn(child, "destroy");

			parent.destroy();

			expect(parentDestroy).toHaveBeenCalled();
			expect(childDestroy).toHaveBeenCalled();
		});
	});
});
