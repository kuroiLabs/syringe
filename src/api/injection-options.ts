export interface InjectionOptions<T> {
	/** If true, the system will not throw errors if it can't find a Provider */
	optional: boolean;
	/** If true, the system will check the current Injector's parent for a Provider first */
	preferParent: boolean;
	/** If specified, the system will return this value instead of throwing an error if no Provider found */
	notFoundValue: T;
}
