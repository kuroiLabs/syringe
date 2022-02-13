import { Syringe } from "../../src";
import { Extra } from "../decorator";
import { InjectableClass } from "../injectable-class";

@Syringe.Injectable({
  scope: 'global'
})
@Extra
export class OtherService implements Syringe.OnInit, Syringe.OnDestroy {

  private id: string

  constructor(@Syringe.Inject(InjectableClass) private dependency: InjectableClass) {
    this.id = Syringe.generateId()
  }

  public onInit() {
    this.hello()
  }

  public onDestroy() {
    this.goodbye()
  }

  private hello(): void {
    console.log(`OtherService::${this.id}`, 'Hello!')
  }

  private goodbye(): void {
    console.log(`OtherService::${this.id}`, 'Goodbye!')
  }  

}
