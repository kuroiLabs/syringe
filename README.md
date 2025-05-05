# Syringe Dependency Injection
`Syringe` is a lightweight dependency injection framework. Organize your code into modules and inject your dependencies anywhere within an `Injector` context.

## Providers

Providers are the building blocks of `Syringe`. A Provider consists of two things:

1. A token representing an arbitrary provided value
2. A `provide()` function that returns a value for the token

### Example

```typescript
const myProvider: Provider = {
	token: MyClass,
	provide: () => new MyClass()
}
```

Tokens can be anything; a string, a class, etc. As long as JavaScript can evaluate it with strict equality, it's a valid token. However, developers should be careful with using primitives like strings and numbers as tokens as they must be unique to avoid conflicting pointers.

`Syringe` comes with a primitive `ProviderToken` class that is great for representing arbitrary values.

```typescript
const token: ProviderToken = new ProviderToken("myToken");
const myProvider: IProvider = {
	token,
	provide: () => { ... }
};
```

Because `token` is an object reference, even if you create more `ProviderToken`s with `name = "myToken"` (not recommended, obviously), the original token is still unique.

### Built-in Providers

`Syringe` comes with a number of pre-configured `Provider` implementations.

#### `ClassProvider`

`ClassProvider` is a shorthand for the example provider above -- it takes a static class definition as the `token` and provides a factory function for its constructor.

There are two constructor signatures for `ClassProvider`.

If you'd like to simply provide a factory for a given class, use:

```typescript
new ClassProvider(MyClass);
```

If you'd like to provide an alternate implementation for the class token, use:

```typescript
new ClassProvider(MyClass, MyOtherClassImpl);
```

This opens the door to powerful levels of abstraction.

**Note**: Invoking a `ClassProvider`'s `provide` method will only generate the class instance once;

#### `ValueProvider`

`ValueProvider` provides a static value for a given token. Just pass the `token` and `value` to the constructor:

```typescript
new ValueProvider(myToken, "my value");
```

#### `ForwardProvider`

`ForwardProvider` allows you to forward a token to an existing Provider.

```typescript
new ForwardProvider(myToken, () => myOtherToken);
```

This is useful if you have multiple tokens you want to point to the same value.

```typescript
abstract class Foo {
	public abstract run(): void;
}

class Bar implements Foo {
	public run(): void {
		// ...
	}
}

const fooProvider: Provider = new ForwardProvider(Foo, () => Bar);
const barProvider: Provider = new ClassProvider(Bar);
```

Injecting `Foo` will now function the same as injecting `Bar` and will not create a new instance.

## Injectors

The `Injector` class controls dependency scopes. Injectors receive a list of Providers from which it can fetch token values. Injectors are hierarchical, so if they cannot locate a Provider for a token, they will traverse up the tree to attempt to find one.

Creating an `Injector` is simple:

```typescript
class BaseThemeService {

	public readonly options: Record<string, any> = inject(OPTIONS);

}

class MyThemeService extends BaseThemeService {

}

const myInjector: Injector = new Injector({
	parent: myParentInjector,
	providers: [
		new ClassProvider(MyThemeService),
		new ValueProvider(OPTIONS, { foo: 'bar' }),
		new ForwardProvider(BaseThemeService, () => MyThemeService)
	]
});

myInjector.get(MyThemeService); // returns MyThemeServicr instance
myInjector.get(BaseThemeService); // returns MyThemeServicr instance
```

### Injector Context

Injecting a dependency requires a valid `Injector` context. The context is stored synchronously and ephemerally on a `static` field of the `Injector` class itself, meaning the scope must be used while it's available.

Attempting to inject a dependency without a valid context results in a `NullInjectorError`.

## Modules

The `Module` class is a a helpful utility to create, manage, and combine isolated, reusable injection scopes.

A `Module` can be created with a number of options:

- `name: string`
  - A runtime alias for the `Module`. Mostly helpful with debugging.
- `imports: Module[]`
  - Modules inherit the providers of their imported Modules
- `providers: Provider[]`
  - Providers inherent to this Module
- `injector: Injector`
  - The parent Injector to be used in this Module

Once you've configured a `Module` with providers, you can retrieve token values from it using its `inject` method.

### Example

```typescript
// create a module that provides authentication services
const authModule: Module = new Module({
	providers: [
		new ClassProvider(JwtService),
		new ClassProvider(AuthService),
	]
});

// create a top-level module and import the authentication module
const mainModule: Module = new Module({
	imports: [authModule],
});

// mainModule can now inject providers from authModule
const authService: AuthService = mainModule.inject(AuthService);
```

Consolidate common logic into module factories that can be configured with arguments:

```typescript
function authModule(settings: Object): Module {
	return new Module({
		providers: [
			new ClassProvider(JwtService),
			new ClassProvider(AuthService),
			new ValueProvider(SETTINGS, settings),
		]
	});
}

const mainModule: Module = new Module({
	imports: [authModule({ ... })]
});
```

### Teardown

Modules can be torn down with their `destroy` method. This will automatically destroy the `Module`, its `Injector`, and any of its child `Injector`s.

## The `inject` Function

`inject` is the most common way of injecting dependencies, but it requires an `Injector` context to work.

### Options

`inject` can take `options` to control its behavior.

```typescript
export interface InjectionOptions<T> {
	/** If true, the system will not throw errors if it can't find a Provider */
	optional: boolean;
	/** If true, the system will check the current Injector's parent for a Provider first */
	preferParent: boolean;
	/** If specified, the system will return this value instead of throwing an error if no Provider found */
	fallback: T;
}
```

### Examples

Assume all examples have the prerequisite setup:

```typescript
const myInjector: Injector = new Injector({
	providers: [new ClassProvider(MyClass)]
});
```

#### Invalid `Injector` context

Calling `inject` on its own won't work unless the code is being executed in an `Injector` context.

```typescript
// throws NullInjectorError
const myClass: MyClass = inject(MyClass);
```

#### Used in `Injector` context

When invoked within an `Injector` context, `inject` can access the providers for of that `Injector`.

```typescript
// returns MyClass instance
const myClass: MyClass = myInjector.use(() => inject(MyClass));
```

Provider factory functions are always invoked with `Injector` context, so `inject` is safe to call.

Take the following example, where a hypothetical class `MyService` has two constructor arguments that we want to inject. Assuming the `Injector` or its hierarchy has providers for them, they will be injected into the constructor successfully.

```typescript
class MyService {
	constructor(
		public readonly dependency: SomeDependency,
		public readonly settings: Settings
	) {

	}
}

const serviceProvider: Provider = {
	token: MyService,
	provide: () => new MyService(
		inject(SomeDependency),
		inject(SETTINGS),
	)
};
```

A more convenient and intuitive pattern for dependency injection in classes is to use the `inject` function for inline member assignment.

This way, we can remove the `constructor` entirely and simplify the provider:

```typescript
class MyService {

	public readonly dependency: SomeDependency = inject(SomeDependency);

	public readonly settings: Settings = inject(Settings);

}

const serviceProvider: Provider = new ClassProvider(MyService);
```

This also makes it easier to extend `MyService` without having to redeclare and re-inject all of the dependencies in the `constructor`.

#### Asynchronous Execution

`inject` is meant to be used in synchronous contexts, as the active `Injector` is always cleared after use.

The following would not work:

```typescript
async function getTransformedData() {
	const data = await getData();
	
	// doesn't work because active `Injector` was cleared
	// while awaiting getData()
	return inject(TransformService).transform(data);
}

const myData = await myInjector.use(getTransFormedData);
```

To achieve something like this, inject all require dependencies synchronously:

```typescript
async function getTransformedData() {
	// synchronous injection to be referenced later after async logic
	const transformService: TransformService = inject(TransformService);
	const data = await getData();

	return transformService.transform(data);
}

const myData = await myInjector.use(getTransformedData);
```

#### Optional flag

When `optional` is `true`, the system will not throw `NullProviderError` if there is no Provider.

```typescript
// throws a NullProviderError because MyOtherClass is not provided in myInjector
const myOtherClass: MyOtherClass = myInjector.use(() => inject(MyOtherClass));

// Returns undefined but does not throw a NullProviderError
const myOtherClass: MyOtherClass | undefined = myInjector.use(() => inject(MyOtherclass, { optional: true }));
```

#### Not found value

```typescript
// throws a NullProviderError because MyOtherClass is not provided in myInjector
const myOtherClass: MyOtherClass = myInjector.use(() => inject(MyOtherClass));

// Returns {}
const myOtherClass: MyOtherClass | undefined = myInjector.use(() => inject(MyOtherclass, { fallback: {} }));
```

## Lifecycles

`Syringe` exposes two main lifecycle events: `OnInit` and `OnDestroy`.

### `OnInit`

The `onInit` method will run once whenever the instance is created.

```typescript
class MyClass implements OnInit {

	public onInit(): void {
		console.log("MyClass init");
	}

}

const injector: Injector = new Injector({
	providers: [new ClassProvider(MyClass)]
});

injector.get(MyClass); // prints "MyClass init"
injector.get(MyClass); // Returns the same MyClass instance and does not print again
```

### `OnDestroy`

`OnDestroy` is a place to fire cleanup logic when an `Injector` is torn down.

```typescript
class MyClass implements OnDestroy {
	public onDestroy(): void {
		console.log("MyClass destroyed");
	}
}

const injector: Injector = new Injector({
	providers: [new ClassProvider(MyClass)]
});
const myClass: MyClass = injector.get(MyClass);

injector.destroy(); // prints "MyClass destroyed"
```