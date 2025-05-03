import { Injector } from "..";
import { inject } from "../inject";
import { Provider } from "../../common";

export class ForwardProvider<T = any> extends Provider<T> {

	public constructor(
		readonly token: any,
		protected readonly forwarder: () => any
	) {
		super(token);
	}

	public override provide(): T {
		if (!this.value) {
			const token: any = this.forwarder();
			const injector: Injector = inject(Injector);

			this.value = injector.get(token);
		}

		return this.value;
	}

}
