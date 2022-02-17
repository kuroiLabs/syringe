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

**Note**: The `@Injectable` decorator will not work alongside class decorators that wrap the target class in an *anonymous extending class*. If your decorator returns a `Proxy` to the target constructor or manually preserves the prototype information (particularly the `name`), `Syringe` DI should still work, but it's advised that you put the `@Injectable` decorator *first*.
```typescript
@Syringe.Injectable()
@Wrapper
export class MultiDecorated {
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
Sometimes, you might want to inject constants, function calls, or other non-class entities into your `@Injectable` class. In order to do this, you must manually construct an `InjectionToken` and return your value from its `factory` function.

```typescript
const _someConstant: string = 'Jerry, hello! It\'s me, Uncle Leo!'
export const UNCLE_LEO = new InjectionToken('UncleLeo', {
  scope: 'global',
  factory: () => _someConstant
})

// inject an ID generator function
const GENERATE_ID = new InjectionToken('GenerateId', {
  scope: 'global',
  factory: () => () => Utilities.generateId()
})
```

Then, you can inject this token directly into an `@Injectable` class.

```typescript
@Syringe.Injectable()
export class MyClass {
  public id: string;
  constructor(
    @Syringe.Inject(GENERATE_ID) idGenerator: () => string,
    @Syringe.Inject(UNCLE_LEO) private greeting: string
  ) {
    this.id = idGenerator()
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

#### Providers
Sometimes, you may want to inject an `abstract` class and specify a concretion at a higher level context, or just substitute one implementation for another. Such is the beauty of dependency injection.

To do so, simply include a provider in the arguments to `Syringe.inject` when bootstrapping an entry point to your application.
```typescript
// inject Abstraction
@Syringe.Injectable()
export class MyClass {
  constructor(@Syringe.Inject(AbstractService) service: AbstractService) {}
}

const app = Syringe.inject<MyApp>(MyApp, {
  providers: [
	NonDecoratedClass, // inject singletons that aren't decorated with @Injectable
	{
      for: AbstractService,
      use: ConcreteService // extension type of AbstractService to provide for MyApp
    },
	{
      for: AnotherAbstractService,
	  instance: PreConstructedValueType // extension value of AnotherAbstractService to provide for MyApp
	}
  ]
})
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

## Credits / Considerations
This library is largely inspired by the *feel* of Google Angular's DI framework, minus the custom module pattern and any external dependencies. You can use it for UI/browser apps, but it's better suited for server side Node.js/TypeScript apps.