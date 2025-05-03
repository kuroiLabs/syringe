import { ProviderFactory } from "./provider-factory";

/**
 * A simple provider memoization utility to ensure a provider factory only gets called once.
 * @param factory 
 * @returns 
 */
export function provideCached<T = any>(provide: ProviderFactory<T>): ProviderFactory<T> {
	let value!: T;

	return (): T => {
		return value ?? provide();
	};
}
