export class NullProviderError extends Error {

	constructor(token: any) {
		super(`Null provider for token ${token}`);
	}

}
