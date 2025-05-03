import { IProvider } from "./provider";

export abstract class Provider<T = any> implements IProvider<T> {

	protected value!: T;

	public constructor(public readonly token: any) {

	}

	public abstract provide(): T;

}
