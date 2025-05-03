import { Provider } from "../../common";
import { Constructor } from "../../utils";

/**
 * @author kuro <kuro@kuroi.io>
 * @description Provider for class instances. This provider is designed to handle
 * 	classes with argumentless constructors. Classes with constructor arguments should
 * 	be manually instantiated within an explicit injection context.
 */
export class ClassProvider<T extends Object> extends Provider<T> {

	public constructor(type: Constructor<T, []>);
	public constructor(token: any, type: Constructor<T, []>);

	public constructor(
		readonly token: any,
		public readonly type?: Constructor<T, []>
	) {
		super(token);

		if (!this.type)
			this.type = token;
	}

	public override provide(): T {
		return new this.type();
	}

}