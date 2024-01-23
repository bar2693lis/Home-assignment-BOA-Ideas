import React from 'react';
import { Page, Layout, EmptyState } from '@shopify/polaris';
import { TitleBar } from '@shopify/app-bridge-react';
import { BoaFooter } from '../components';

export default function HomePage() {
	return (
		<Page narrowWidth>
			<TitleBar title="BOA Ideas" primaryAction={null} />
			<Layout>
				<Layout.Section>
					<EmptyState
						heading="BOA Ideas"
						image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
					></EmptyState>
					<BoaFooter />
				</Layout.Section>
			</Layout>
		</Page>
	);
}
