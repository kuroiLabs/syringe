import * as Syringe from "../src"
import { TestApp } from './app'
import { BaseInstanceService, InstanceService } from './instance-service'
import { BaseTestService, Service } from './test-service'

Syringe.inject(TestApp, {
	providers: [
		{
			for: BaseTestService,
			provide: {
				use: Service, scope: "global"
			}
		},
		{
			for: BaseInstanceService,
			provide: {
				instance: InstanceService, scope: "global"
			}
		}
	]
})

Syringe.destroyAllInstances()
