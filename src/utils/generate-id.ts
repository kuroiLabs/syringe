// @todo: replace with IdGenerator from @kuroi/common
export function generateId(): string {
	const _seed = Math.random() * 10 ** 16
	return _seed.toString(32).substring(0, 10)
}