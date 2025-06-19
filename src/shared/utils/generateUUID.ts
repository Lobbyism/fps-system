/**
 * Génère un UUID v4 (version 4) aléatoire
 * @returns Un UUID au format string
 */
export function generateUUID(): string {
	const template = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
	return template.gsub("[xy]", (c: string) => {
		const r = (math.random() * 16) | 0;
		const v = c === "x" ? r : (r & 0x3) | 0x8;
		return tostring(v);
	})[0];
}
