import { useAuthenticatedFetch } from './useAuthenticatedFetch';

export function useAppFetch(url, fetchInit) {
	const authenticatedFetch = useAuthenticatedFetch();
	return async () => {
		const response = await authenticatedFetch(url, fetchInit);
		const data = await response.json();
		if (!response.ok) {
			throw new Error(data);
		}
		return data;
	};
}
