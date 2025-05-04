/**
 * @author kuro <kuro@kuroi.io>
 * @namespace kuroi.io.Syringe.Utils
 */
export type Constructor<T = any, A extends any[] = []> = { new (...args: A[]): T }
