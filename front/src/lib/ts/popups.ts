import { writable, type Writable } from 'svelte/store';

export enum PopupCategory {
	WARNING = 'alert-warning',
	ERROR = 'alert-error'
}

export interface CanBePopup {
	text: string;
	popupCategory: PopupCategory;
	hasButton: boolean;
	buttonLabel?: string;
	onAccept?: () => void;
	onClose?: () => void;
}

export const popups: Writable<CanBePopup[]> = writable([]);

function addPopup(popup: CanBePopup) {
	popups.update((_) => {
		_.push(popup);
		return _;
	});
}

function removePopup(popup: CanBePopup) {
	removeBy((popup2) => popup == popup2);
}

function removeBy(filterCallback: (popup: CanBePopup) => boolean) {
	popups.update((_) => {
		return _.filter((_) => {
			if (filterCallback(_)) {
				_.onClose?.();
				return false;
			}
			return true;
		});
	});
}

export const popupMethods = {
	addPopup,
	removeBy,
	removePopup
};
