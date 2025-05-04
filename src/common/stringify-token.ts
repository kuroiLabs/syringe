export function stringifyToken(token: any): string {
	if (token?.name)
		return token.name;

	return `${token}`;
}
