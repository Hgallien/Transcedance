/* Used when falling into a case that is not implemented yet */
export class Unimplemented extends Error {
	constructor() {
		super('Unimplemented');
	}
}
