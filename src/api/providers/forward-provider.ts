import { Provider } from "../../common/provider";
import { inject } from "../inject";
import { Injector } from "../injector";

export class ForwardProvider<T = any> implements Provider<T> {

	public constructor(
		public readonly token: any,
		protected readonly forwarder: () => any
	) {

	}

	public provide(): T {
		const token: any = this.forwarder();
		const injector: Injector = inject(Injector);

		return injector.get<T>(token);
	}

}
