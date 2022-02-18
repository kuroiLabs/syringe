/**
 * @author kuro <kuro@kuroi.io>
 * @namespace kuroi.io.Syringe.Utils
 */
export class NullInjectionTokenError extends Error {
	constructor(_key: string) {
		super(`Null injection token for "${_key || 'undefined'}"`)
	}
}