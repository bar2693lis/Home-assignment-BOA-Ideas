import React from 'react';
import { SkeletonCard } from '../components';

export const LoadingFallback = ({ loading, children }) => {
	if (loading) {
		return <SkeletonCard />;
	}
	return <>{children}</>;
};
