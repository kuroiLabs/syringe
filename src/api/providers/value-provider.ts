import { Provider } from "../../common";

export class ValueProvider<T = any> implements Provider<T> {

	public constructor(
		public readonly token: any,
		public readonly value: T
	) {

	}

	public provide(): T {
		return this.value;
	}

}
