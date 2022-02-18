export abstract class BaseInstanceService {

	public id: string;

	constructor(generator: () => string) {
		this.id = generator()
	}

	abstract hello(): void
}