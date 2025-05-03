import { ProviderFactory } from "./provider-factory";

export interface IProvider<T = any> {
	token: any;
	provide: ProviderFactory<T>;
}
