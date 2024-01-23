import React from 'react';
import { FooterHelp, Link, Text } from '@shopify/polaris';

export function BoaFooter() {
	return (
		<FooterHelp>
			<Text>
				Developed with &hearts; by <Link target="_blank" url="https://boaideas.co.il">BOA Ideas</Link> | Learn more{' '}
				<Link target="_blank" url="https://apps.shopify.com/partners/boaideas">
					our Apps
				</Link>
			</Text>
		</FooterHelp>
	);
}
