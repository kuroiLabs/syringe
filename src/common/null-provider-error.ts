import { stringifyToken } from "./stringify-token";

export class NullProviderError extends Error {

	constructor(token: any) {
		super(`Null provider for token ${stringifyToken(token)}`);
	}

}
