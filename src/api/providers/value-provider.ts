import { Provider } from "../../common";

export class ValueProvider<T = any> extends Provider<T> {

	public constructor(
		readonly token: any,
		public override readonly value: T
	) {
		super(token);
	}

	public override provide(): T {
		return this.value;
	}

}
