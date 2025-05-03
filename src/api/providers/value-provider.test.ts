import { describe, expect, test } from "vitest";
import { ValueProvider } from "./value-provider";

describe("ValueProvider", () => {
	const token: any = {};
	const value: string = "test";
	const provider: ValueProvider = new ValueProvider(token, value);

	test("should provide the given value", () => {
		expect(provider.provide()).toBe(value);
	});
});