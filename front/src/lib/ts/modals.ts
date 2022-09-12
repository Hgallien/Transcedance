import { removeIfPresent } from 'pong';
import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';

type CloseCallback = () => void;

export let modalCallbackStackRef: CloseCallback[] = [];
export const modalCallbackStack: Writable<CloseCallback[]> = writable([]);
modalCallbackStack.subscribe((_) => (modalCallbackStackRef = _));

export function newModal(close: CloseCallback) {
	modalCallbackStack.update((callbacks) => {
		callbacks.push(close);
		return callbacks;
	});
}

export function removeModal(close: CloseCallback) {
	if (modalCallbackStackRef.includes(close)) {
		modalCallbackStack.update((callbacks) => {
			removeIfPresent(callbacks, close);
			return callbacks;
		});
	}
}

export function closeLastModal() {
	modalCallbackStack.update((callbacks) => {
		if (callbacks.length > 0) {
			callbacks[callbacks.length - 1]();
			callbacks.pop();
		}
		return callbacks;
	});
}

export function closeAllModals() {
	modalCallbackStack.update((callbacks) => {
		while (callbacks.length > 0) {
			callbacks[callbacks.length - 1]();
			callbacks.pop();
		}
		return [];
	});
}

export function closeLastModalListener(event: KeyboardEvent) {
	if (event.key == 'Escape') closeLastModal();
}
