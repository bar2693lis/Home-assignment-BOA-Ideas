import {
	LegacyCard,
	SkeletonBodyText,
	TextContainer,
	SkeletonDisplayText,
} from '@shopify/polaris';
import React from 'react';

export function SkeletonCard({ title = true, body = true }) {
	return (
		<LegacyCard sectioned>
			<TextContainer>
				{title && <SkeletonDisplayText size="small" />}
				{body && <SkeletonBodyText />}
			</TextContainer>
		</LegacyCard>
	);
}
