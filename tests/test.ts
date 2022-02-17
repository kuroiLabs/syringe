import { Syringe } from '../src'
import { TestApp } from './app'
import { BaseTestService, Service } from './test-service'

Syringe.inject(TestApp, {
	providers: [{
		use: Service,
		for: BaseTestService
	}]
})
Syringe.destroyAllInstances()
