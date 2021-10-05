import { TestApp } from './app'
import { InjectableClass } from './injectable-class'
import { OtherService } from './other-service'
import { Service } from './test-service'

const helloMessage = 'Syringe Test Message!'

class ExtendedInjectableClass extends InjectableClass {}
class ExtendedOtherService extends OtherService {}
class ExtendedService extends Service {}
class ExtendedTestApp extends TestApp {}

const testInstance = new ExtendedInjectableClass(helloMessage)
const testOtherService = new ExtendedOtherService(testInstance)
const testService = new ExtendedService(testInstance, testOtherService)
const testApp = new ExtendedTestApp(testService)
testApp.onInit()