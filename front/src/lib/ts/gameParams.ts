export type GameParams = {
	online: boolean;
	observe?: boolean;
	classic?: boolean;
	matchMaking?: boolean;
	startAGame?: boolean;
	valid: boolean;
};

export function gameParamsAreValid(p?: GameParams) {
	if (p === undefined) {
		return false;
	}
	if (p.online) return true;
	if (p.observe === true || p.matchMaking === true) return false;
	return true;
}
