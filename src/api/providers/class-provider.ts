import { Constructor } from "../../common/constructor";
import { Provider } from "../../common/provider";

/**
 * @author kuro <kuro@kuroi.io>
 * @description Provider for class instances. This provider is designed to handle
 * 	classes with argumentless constructors. Classes with constructor arguments should
 * 	be manually instantiated within an explicit injection context.
 */
export class ClassProvider<T extends Object> implements Provider<T> {

	public constructor(type: Constructor<T, []>);
	public constructor(token: any, type: Constructor<T, []>);

	public constructor(
		public readonly token: any,
		public readonly type?: Constructor<T, []>
	) {
		if (!this.type)
			this.type = token;
	}

	public provide(): T {
		return new this.type();
	}

}