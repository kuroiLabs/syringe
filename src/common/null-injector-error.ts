export class NullInjectorError extends Error {

	constructor() {
		super('Current Injector context is NULL. Injection must happen within an Injector context.');
	}

}