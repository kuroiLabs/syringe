"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Syringe = void 0;
var Syringe;
(function (Syringe) {
    const _injectionTokens = new Map();
    const dependencyMap = new Map();
    const cache = new Map();
    function generateId() {
        return (Math.random() * Math.pow(10, 10)).toString(16).substring(2, 8);
    }
    Syringe.generateId = generateId;
    class InjectionToken {
        constructor(_name, _token) {
            this.id = generateId();
            this.name = _name;
            this.scope = _token.scope;
            this.factory = _token.factory;
            _registerToken(this);
        }
        get isSingleton() {
            return this.scope === 'global';
        }
    }
    Syringe.InjectionToken = InjectionToken;
    Syringe.Injectable = (_token) => {
        return function _injectable(_constructor) {
            const _key = _token && _token.name || _constructor.name;
            const _injectionToken = new InjectionToken(_key, {
                name: _key,
                scope: _token && _token.scope,
                factory: () => _constructor
            });
            _registerToken(_injectionToken);
        };
    };
    function Inject(_token) {
        if (!(_token instanceof InjectionToken) && typeof _token === 'function') {
            _token = _getToken(_token.name);
        }
        return function (_target, _key, _index) {
            if (!dependencyMap.has(_target['name'])) {
                dependencyMap.set(_target['name'], []);
            }
            const _dependencies = dependencyMap.get(_target['name']);
            if (!_dependencies[_index]) {
                _dependencies[_index] = _token.name;
            }
            return inject(_token.name);
        };
    }
    Syringe.Inject = Inject;
    function inject(_key) {
        if (typeof _key === 'function') {
            _key = _key.name;
        }
        const _token = _injectionTokens.get(_key);
        if (_token) {
            if (_token.isSingleton) {
                return _generate('global', _token);
            }
            const _scope = _token.scope || generateId();
            const _instance = _generate(_scope, _token);
            _cacheInstance(_token.scope, _token, _instance);
            return _instance;
        }
        throw new Error('No injection token for ' + _key);
    }
    Syringe.inject = inject;
    function _registerToken(_token) {
        _injectionTokens.set(_token.name, _token);
    }
    function _generate(_scope, _token) {
        if (cache.has(_scope)) {
            const _instance = cache.get(_scope).get(_token.id);
            if (_instance) {
                return _instance;
            }
        }
        const _dependencies = (dependencyMap.get(_token.name) || []).map(_dependencyName => {
            const _dependencyToken = _getToken(_dependencyName);
            const _dependencyInstance = _generate(_dependencyToken.scope, _dependencyToken);
            _cacheInstance(_scope, _dependencyToken, _dependencyInstance);
            return _dependencyInstance;
        });
        const _factory = _token.factory();
        let _instance;
        if (typeof _factory === 'function') {
            const _constructor = _factory.bind.apply(_factory, [null, ..._dependencies]);
            _instance = new _constructor();
        }
        else {
            _instance = _factory;
        }
        if (_token.isSingleton) {
            _cacheInstance(_scope, _token, _instance);
        }
        return _instance;
    }
    function _hasCircularDependency(_name) {
        const _dependencies = dependencyMap.get(_name);
        for (const _dependency of _dependencies) {
            if (dependencyMap.get(_dependency).indexOf(_name) > -1) {
                return true;
            }
        }
        return false;
    }
    Syringe._hasCircularDependency = _hasCircularDependency;
    function _getToken(_key) {
        const _token = _injectionTokens.get(_key);
        if (!_token) {
            throw new Error('Invalid token: ' + _key);
        }
        return _token;
    }
    function _cacheInstance(_scope, _token, _instance) {
        if (cache.has(_scope)) {
            cache.get(_scope).set(_token.id, _instance);
        }
        else {
            cache.set(_scope, new Map([[_token.id, _instance]]));
        }
    }
})(Syringe = exports.Syringe || (exports.Syringe = {}));
