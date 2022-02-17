/**
 * @author kuro <kuro@kuroi.io>
 * @namespace kuroi.io.Syringe.Utils
 */
export function generateId(): string {
	const _seed = Math.random() * 10 ** 16
	return _seed.toString(32).substring(0, 10)
}