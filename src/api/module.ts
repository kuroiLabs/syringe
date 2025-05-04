import { Provider } from "../common";
import { Destructible } from "../lifecycle";
import { Injector } from "./injector";

/**
 * @author kuro <kuro@kuroi.io>
 * @description Utility class for grouping and managing isolated and reusable Injection providers
 */
export class Module extends Destructible implements Module.Options {

	public name: string;

	public injector: Injector;

	public imports: Module[];

	public providers: Provider<any>[];

	public constructor();
	public constructor(options: Partial<Module.Options>);

	public constructor(options?: Partial<Module.Options>) {
		super();

		this.name = options?.name || 'SyringeModule';
		this.imports = options?.imports || [];
		this.providers = options?.providers ? [...options.providers] : [];

		// ensure each Module provides itself
		this.providers.push({
			token: Module,
			provide: () => this
		});

		this.injector = new Injector({
			parent: options?.injector,
			providers: this.getAllProviders()
		});
	}

	public addProvider(...providers: Provider[]): void {
		this.providers.push(...providers);
		this.injector.register(...providers);
	}

	public getAllProviders(): Provider[] {
		const providers: Provider[] = [];

		this.imports.forEach((imported: Module) => {
			providers.push(...imported.getAllProviders());
		});

		// providers local to the module should come last so that 
		// they take the highest priority in the Injector's provider map
		providers.push(...this.providers);

		return providers;
	}

	public inject<T = any>(token: any): T {
		return this.injector.get(token);
	}

	public run<T = any>(context: () => T): T {
		return this.injector.use(context);
	}

	public destroy(): void {
		this.injector.destroy();
	}

}

export namespace Module {
	export interface Options {
		/** The name of the module */
		name: string;
		/** Modules inherit the providers of their imported Modules */
		imports: Module[];
		/** Providers inherent to this Module */
		providers: Provider[];
		/** The parent Injector to be used in this Module */
		injector: Injector;
	}
}
