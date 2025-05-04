import { ProviderFactory } from "./provider-factory";

export interface Provider<T = any> {
	token: any;
	provide: ProviderFactory<T>;
}
