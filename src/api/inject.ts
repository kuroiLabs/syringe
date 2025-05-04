import { NullInjectorError, NullProviderError } from "../utils";
import { InjectionOptions } from "./injection-options";
import { Injector } from "./injector";

export function inject<T = any>(token: any): T;
export function inject<T = any>(token: any, options: Partial<InjectionOptions<T>>): T;

/**
 * `inject` is the preferred way to access a provided token value. Inject should be called
 * 	from within Injector contexts, like provided class member instantiations or within
 * 	`Injector::use`
 * @param token 
 * @param options 
 * @returns 
 */
export function inject<T = any>(token: any, options?: Partial<InjectionOptions<T>>): T {
	if (Injector.active === null)
		throw new NullInjectorError();

	try {
		let injector: Injector = Injector.active;

		if (options?.preferParent) {
			while (injector.parent && injector.parent?.hasProvider(token))
				injector = injector.parent;
		}

		return injector.get(token);
	} catch (e) {
		if (e instanceof NullProviderError) {
			if (options?.fallback)
				return options.fallback;

			if (options?.optional)
				return undefined;
		}

		throw e;
	}
}
