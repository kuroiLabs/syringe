import { Syringe } from '../../src'
import { HELLO } from '../message'

// non-singleton, scoped injectable
@Syringe.Injectable()
export class InjectableClass implements Syringe.OnInit, Syringe.OnDestroy {

  private id: string

  constructor(@Syringe.Inject(HELLO) private message: any) {
    this.id = Syringe.generateId()
  }

  public onInit() {
    this.hello()
  }

  public onDestroy() {
    this.goodbye()
  }

  private hello(): void {
    console.log(`InjectableClass::${this.id}`, this.message)
  }

  private goodbye(): void {
    console.log(`InjectableClass::${this.id}`, 'No hello???')
  }

}