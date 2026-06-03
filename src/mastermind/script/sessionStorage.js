export const STORAGE_KEY = 'mastermind-state';

export const loadState = () => {
	try {
		const serializedState = sessionStorage.getItem(STORAGE_KEY);
		if (serializedState === null) {
			return undefined;
		}
		return JSON.parse(serializedState);
	} catch (err) {
		return undefined;
	}
};

export const saveState = (state) => {
	try {
		const serializedState = JSON.stringify(state);
		sessionStorage.setItem(STORAGE_KEY, serializedState);
	} catch (err) {
		console.error('error saving state', err);
	}
};

export const clearState = () => {
	try {
		sessionStorage.removeItem(STORAGE_KEY);
	} catch (err) {
		console.error('error clearing state', err);
	}
};
