import { NullProviderError } from "../common/null-provider-error";
import { Provider } from "../common/provider";
import { Destructible } from "../lifecycle/destructible";
import { isOnDestroy } from "../lifecycle/is-on-destroy";
import { isOnInit } from "../lifecycle/is-on-init";

/**
 * @author kuro <kuro@kuroi.io>
 * @description The Injector is the foundational component driving the Syringe system.
 * 	Injectors exist in a hierarchical structure and recursively check their parents for providers
 * 	before throwing an error and giving up.
 */
export class Injector extends Destructible {

	/** The currently active `Injector` instance */
	public static active: Injector | null = null;

	/** The parent of this `Injector` */
	public readonly parent?: Injector;

	/** Child instances of this `Injector` */
	protected readonly children: Set<Injector> = new Set();

	/** Providers accessible in this `Injector` */
	protected readonly providers: Map<any, Provider> = new Map([
		[Injector, {
			token: Injector,
			provide: () => this
		}]
	]);

	/** Cached values returned from this `Injector`'s providers */
	protected readonly values: Map<any, any> = new Map();

	public constructor();
	public constructor(options: Partial<Injector.Options>);
	public constructor(options?: Partial<Injector.Options>) {
		super();

		this.parent = options?.parent || Injector.active;

		if (this.parent === this)
			this.parent = null;
		else
			this.parent?.children.add(this);

		if (options?.providers)
			this.register(...options.providers);
	}

	/**
	 * Checks if the Injector has a registered Provider for a given token
	 * @param token The token representing the Provider
	 * @returns `true` if the Injector has a Provider for the token
	 */
	public hasProvider(token: any): boolean {
		let injector: Injector = this;

		while (injector) {
			if (injector.providers.has(token))
				return true;

			injector = injector.parent;
		}

		return false;
	}

	/**
	 * Adds a Provider to the Injector
	 * @param provider The provider to register
	 */
	public register(...providers: Provider[]): void {
		providers.forEach((provider: Provider) => {
			this.providers.set(provider.token, provider);
		})
	}

	/**
	 * Use the context of an `Injector` instance to run logic with access to the provider scope
	 * 	of the `Injector`.
	 * @param context Logic to run in the context of this `Injector`
	 */
	public use<T = any>(context: () => T): T {
		Injector.active = this;

		const ctx: T = context();

		Injector.active = null;

		return ctx;
	}

	public get<T = any>(token: any): T;
	public get<T = any>(token: any, fallback: T): T;

	/**
	 * Extracts a value for a given Provider token
	 * @param token The token representing the Provider
	 * @param fallback An optional fallback value if no available Provider
	 */
	public get<T = any>(token: any, fallback?: T): T {
		let injector: Injector = this;

		while (injector) {
			if (!injector.providers.has(token)) {
				injector = injector.parent;
				continue;
			}

			let value: T;

			if (!injector.values.has(token)) {
				value = injector.use(() => injector.providers.get(token).provide());

				if (isOnInit(value))
					value.onInit();

				injector.values.set(token, value);
			} else
				value = injector.values.get(token);

			return value;
		}

		if (fallback === undefined)
			throw new NullProviderError(token);

		return fallback;
	}

	public destroy(): void {
		super.destroy();

		this.values.forEach((value: any) => {
			if (isOnDestroy(value))
				value.onDestroy();
		});

		this.providers.clear();
		this.values.clear();

		this.children.forEach(c => c.destroy());
		this.parent?.children.delete(this);
	}

}

export namespace Injector {

	export interface Options {
		parent: Injector;
		providers: Provider[];
	}

}