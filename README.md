# Syringe Dependency Injection
`Syringe` is a custom dependency injection framework meant for server-side, Node TypeScript projects. It aims to require minimal effort from the developer by not requiring manual mapping code or any dependencies.

`Syringe` is best suited for applications with simple lifecycles and lots of singletons, as it was developed for use in a bot, and the code has not been production tested against more advanced use cases.

## Usage

### Importing
Use ES6 imports to access the `Syringe` namespace.

```typescript
import { Syringe } from '@kuroi/syringe'
```

### Creating Injectable Classes
Mark classes as injectable entities with the `@Injectable` decorator. If your class is a singleton, provide a scope of `'global'`, otherwise leave the decorator argument blank to allow `Syringe` to construct a new instance for each injection.

#### Singleton
```typescript
@Syringe.Injectable({
  scope: 'global'
})
export class MyService implements IService {
  // ...
}
```

#### Non-singleton
```typescript
@Syringe.Injectable()
export class MyInstance {
  // ...
}
```

### Injecting Classes
To inject your `@Injectable` class as a dependency, use `@Syringe.Inject` to automatically supply the dependency instance to another `@Injectable` constructor. The decorator requires either the class definition for which you want to inject an instance or a direct reference to an `InjectionToken` as an argument.
```typescript
@Syringe.Injectable()
export class MyComponent {
  constructor(@Syringe.Inject(MyService) private service: IService) {
    // ...
  }
}
```

### Creating Injection Tokens
Sometimes, you might want to inject a constants or other non-class entities into your `@Injectable` class. In order to do this, you must manually construct an `InjectionToken` and return your value from its `factory` function.

```typescript
const _someConstant: string = 'Jerry, hello! It\'s me, Uncle Leo!'
export const UNCLE_LEO = new InjectionToken('UncleLeo', {
  scope: 'global',
  factory: () => _someConstant
})
```

Then, you can inject this token directly into an `@Injectable` class.

```typescript
@Syringe.Injectable()
export class MyClass {
  constructor(@Syringe.Inject(UNCLE_LEO) private greeting: string) {

  }
  public greet(): void {
    console.log(this.greeting) // Jerry, hello! It's me, Uncle Leo!
  }
}
```

### Bootstrapping
To get all of your classes actually running, simply tell `Syringe` to inject the top level class(es) at the entry point(s) of your application, usually in `index.ts` or similar. `Syringe` will automatically construct all of its dependencies, and your instance is ready to go.

```typescript
const app = Syringe.inject<MyApp>(MyApp)
app.start()
```

### Lifecycles
There are two main lifecycle hooks available to all entities managed by `Syringe`: `OnInit` and `OnDestroy`. `Syringe`'s container will automatically call these methods if implemented during construction and teardown.

To hook into these lifecycles, implement the interfaces `Syringe.OnInit` and/or `Syringe.OnDestroy`.

```typescript
@Syringe.Injectable()
export class MyLifecycleClass implements Syringe.OnInit, Syringe.OnDestroy {
  public onInit(): void {
    // ...
  }
  public onDestroy(): void {
    // ...
  }
}
```

## Credits and Other Considerations
This library is largely inspired by Google Angular's DI framework. Admittedly, I didn't read much (or any) of their source code because I'm familiar enough with Angular that I know their custom module pattern is too deeply engrained in that code for it to serve as a great example for my implementation.

I moreso wrote the code with Angular DI's overall _feel_ in mind. While they make use of `relfect-metadata` and other methods to remove the need to decorate constructor arguments, I chose to leverage only TypeScript and JavaScript in my code.

I also didn't want to use the paradigm of automatically detecting which instance to inject based on constructor argument type because that makes it harder to create abstraction layers. Decorating each argument with the target concretion for injection allows the instance property itself to be typed as an _abstraction_.