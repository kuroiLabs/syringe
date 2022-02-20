export abstract class BaseTestService {

	constructor(public id: string) {

	}

	hello() {
		console.log('Service:::' + this.id, 'Hello!')
	}

	goodbye() {
		console.log('Service:::' + this.id, 'Goodbye!')
	}
}