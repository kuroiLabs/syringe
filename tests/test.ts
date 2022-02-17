import { Syringe } from '../src'
import { TestApp } from './app'
import { BaseInstanceService, InstanceService } from './instance-service'
import { BaseTestService, Service } from './test-service'

Syringe.inject(TestApp, {
	providers: [
		{ use: Service, for: BaseTestService },
		{ instance: InstanceService, for: BaseInstanceService }
	]
})
Syringe.destroyAllInstances()
