import { Syringe } from '../src/syringe'

// manually constructed injection token
const helloMessage = 'Jerry, hello!'
const HELLO = new Syringe.InjectionToken('HELLO_MESSAGE', {
  factory: () => helloMessage
})

// non-singleton, scoped injectable
@Syringe.Injectable()
class IndependentClass {
  constructor(@Syringe.Inject(HELLO) private message: any) {

  }
  hello() {
    console.log(this.message)
  }
}

// singleton injectable
@Syringe.Injectable({
  scope: 'global'
})
class Service {
  private id: string
  constructor(@Syringe.Inject(IndependentClass) public dependency: IndependentClass) {
    const _hex = (Math.random() * 10 ** 10).toString(16)
    this.id = _hex.substring(2, 8)
  }
  goodbye() {
    console.log('Goodbye from Service ' + this.id + '!')
  }
}

@Syringe.Injectable()
class Component {

  private id: string

  constructor(@Syringe.Inject(Service) public service: Service) {
    const _hex = Date.now().toString(16)
    this.id = _hex.substring(2, _hex.length)
  }

  public greet() {
    console.log('Greetings from ' + this.id + '!')
  }
}

// retrieve instance from 
const _component1: Component = Syringe.inject(Component)
// const _component2: Component = Syringe.inject(Component)

// console.log('COMPONENTS:::', _component1, _component2)

_component1.greet()
// _component2.greet()

_component1.service.goodbye()
// _component2.service.goodbye()

// test suite scenario, using manual DI
// const _independent = new IndependentClass(`It's me, Uncle Leo!`)
// const _myOtherService: Service = new Service(_independent)
// _myOtherService.dependency.hello()
