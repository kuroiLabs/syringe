import { Syringe } from '../../src'
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
    @Syringe.Inject(OtherService) public childService: OtherService
  ) {
    this.id = Syringe.generateId()
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
