export declare namespace Syringe {
    function generateId(): string;
    interface InjectionTokenConfig {
        name?: string;
        scope?: any;
        factory?: () => any;
    }
    class InjectionToken implements InjectionTokenConfig {
        id: string;
        name: string;
        scope: any;
        factory: () => any;
        get isSingleton(): boolean;
        constructor(_name: string, _token: InjectionTokenConfig);
    }
    const Injectable: (_token?: InjectionTokenConfig) => (_constructor: Function) => void;
    function Inject(_token: InjectionToken | Function): (_target: Object, _key: string | symbol, _index: number) => any;
    function inject<T = any>(_key: string | Function): T;
    function _hasCircularDependency(_name: string): boolean;
}
