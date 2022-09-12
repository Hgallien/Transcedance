import type { GameInviteToServer, Id } from 'backFrontCommon';
import { refuseGame, acceptGame, cancelGame, getUserNow, sendGameInvite } from '$lib/state';
import { PopupCategory, popups, popupMethods } from './popups';
import type { CanBePopup } from './popups';
import type { GameInviteFromServer } from 'backFrontCommon/chatEvents';

function _modeString(classic: boolean) {
	return (classic ? 'Classic' : 'WeIrD') + ' mode';
}

export class ReceivedGameInvite implements CanBePopup {
	public popupCategory = PopupCategory.WARNING;
	public errorMessage?: string = undefined;
	public text: string;
	private valid: boolean = true;

	constructor(public dto: GameInviteFromServer) {
		this.text = '';
		getUserNow(dto.source).then(({ name }) => {
			if (this.valid) {
				this.text = `You have been invited by ${name} to play (${_modeString(dto.classic)})`;
				popups.update((_) => _);
			}
		});
	}

	get hasButton(): boolean {
		return true;
	}
	get buttonLabel(): string {
		return 'Accept';
	}
	onClose() {
		refuseGame(this.dto.source);
	}
	onAccept() {
		acceptGame(this.dto.source, ({ success, errorMessage }) => {
			if (success) {
				popupMethods.removeBy((popup) => popup instanceof ReceivedGameInvite);
			} else {
				popupMethods.removePopup(this);
				alert(errorMessage);
			}
		});
	}
	revoke() {
		this.popupCategory = PopupCategory.ERROR;
		this.text = 'Invitation cancelled';
		popups.update((_) => _);
		setTimeout(() => {
			popupMethods.removePopup(this);
		}, 1000);
	}
}

export class SentGameInvite implements CanBePopup {
	public popupCategory = PopupCategory.WARNING;
	public text: string;

	constructor(public dto: GameInviteToServer) {
		this.text = '';
		getUserNow(dto.target).then(({ name }) => {
			this.text = `You have invited ${name}... (${_modeString(dto.classic)})`;
			popups.update((_) => _);
		});
	}

	get hasButton(): boolean {
		return false;
	}
	onClose() {
		cancelGame(this.dto.target);
	}
}

export function revokeReceived(sender: Id) {
	popups.update((_) => {
		const invite = _.find(
			(popup) => popup instanceof ReceivedGameInvite && popup.dto.source == sender
		);
		if (invite !== undefined) (invite as ReceivedGameInvite).revoke();
		return _;
	});
}

export function removeSent(target: Id) {
	popups.update((_) => {
		const i = _.findIndex((popup) => popup instanceof SentGameInvite && popup.dto.target == target);
		if (i != -1) _.splice(i, 1);
		return _;
	});
}

export function send(dto: GameInviteToServer) {
	sendGameInvite(dto, ({ success, errorMessage }) => {
		if (success) popupMethods.addPopup(new SentGameInvite(dto));
		else alert(errorMessage);
	});
}

export function receive(dto: GameInviteFromServer) {
	popupMethods.addPopup(new ReceivedGameInvite(dto));
}
