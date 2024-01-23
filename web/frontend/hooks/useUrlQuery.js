import { useSearchParams } from 'react-router-dom';

export function useUrlQuery(key = '', multiple = false) {
	const [searchParams] = useSearchParams();
	if (!key) {
		return searchParams;
	}
	if (multiple) {
		return searchParams.getAll(key);
	}
	return searchParams.get(key);
}
