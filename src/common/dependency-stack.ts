import { CircularDependencyError } from "./circular-dependency-error";
import { stringifyToken } from "./stringify-token";

export class DependencyStack {

	protected lastToken!: any;

	protected readonly stack: Set<any> = new Set();

	public push(token: any): void {
		this.checkCircular(token);
		this.stack.add(token);

		this.lastToken = token;
	}

	public clear(): void {
		this.lastToken = undefined;
		this.stack.clear();
	}

	protected checkCircular(token: any): void {
		if (this.lastToken !== undefined && this.lastToken === token)
			return;

		if (this.stack.has(token))
			return this.throwError(token);
	}

	protected throwError(token: any): never {
		const stack: string = Array.from([...this.stack, token])
			.map(stringifyToken)
			.join(' -> ');

		throw new CircularDependencyError(`Circular dependency detected: ${stack}`);
	}

}