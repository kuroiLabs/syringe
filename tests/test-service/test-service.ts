import { Syringe } from '../../src'
import { GENERATE_ID } from '../generator'
import { InjectableClass } from '../injectable-class'
import { OtherService } from '../other-service'

// singleton injectable
@Syringe.Injectable({
  scope: 'global'
})
export class Service implements Syringe.OnInit, Syringe.OnDestroy {

  private id: string

  constructor(
    @Syringe.Inject(InjectableClass) public dependency: InjectableClass,
    @Syringe.Inject(OtherService) public childService: OtherService,
	@Syringe.Inject(GENERATE_ID) _generator: () => string
  ) {
    this.id = _generator()
  }

  public onInit() {
    this.hello()
  }

  public onDestroy() {
    this.goodbye()
  }

  private hello() {
    console.log('Service:::' + this.id, 'Hello!')
  }

  private goodbye() {
    console.log('Service:::' + this.id, 'Goodbye!')
  }

}
