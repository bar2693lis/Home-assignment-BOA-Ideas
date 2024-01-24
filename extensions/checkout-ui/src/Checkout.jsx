import {
	BlockStack,
	Button,
	Choice,
	ChoiceList,
	InlineStack,
	useApi,
	useTranslate,
	reactExtension,
	Banner,
	useCartLines,
	Divider,
	Text,
	InlineSpacer,
} from '@shopify/ui-extensions-react/checkout';
import { useState, useEffect } from 'react';

export default reactExtension('purchase.checkout.block.render', () => <Extension />);

// This is the beginning of the Extension component definition.
function Extension() {
	const translate = useTranslate();
	const { checkoutToken, sessionToken, buyerIdentity } = useApi();
	const cart = useCartLines();

	const [selectedProduct, setSelectedProduct] = useState([]);
	const [selectedSavedProduct, setSelectedSavedProduct] = useState([]);
	const [savedProduct, setSavedProduct] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [showCartItems, setShowCartItems] = useState(true);
	const [bannerTitle, setBannerTitle] = useState('notLoggedIn');
	const [bannerStatus, setBannerStatus] = useState('critical');
	const [customerId, setCustomerId] = useState(null);

	// This function copies the selected products from the lines array and returns a new array with the copied products.
	const copyProducts = async (products, lines) => {
		const productsArray = [];
		for (let i = 0; i < products.length; i++) {
			const foundObject = lines.find((item) => item.id === products[i]);
			if (foundObject) {
				productsArray.push({ ...foundObject }); // using spread operator to create a copy of the object
			}
		}
		return productsArray;
	};

	// This function handles the retrieval of saved products from the DB.
	const handleGetSavedProduct = async () => {
		setIsLoading(true);

		const token = await sessionToken.get();

		const app_url = process.env.APP_URL;
		try {
			const response = await fetch(`${app_url}/api/getCart?customerId=${customerId}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
			});
			const responseData = await response.json(); // Await the JSON data
			setSavedProduct(responseData.data.products);
		} catch (error) {
			console.error('Error while getting cart:', error);
		} finally {
			setIsLoading(false);
		}
	};

	// This function handles the saving of the selected products to the cart.
	const handleSave = async () => {
		setIsLoading(true);

		// Copy the selected products and saved products arrays
		const productsArray = await copyProducts(selectedProduct, cart);
		const savedProductsArray = await copyProducts(selectedSavedProduct, savedProduct);

		const token = await sessionToken.get();
		const data = {
			checkoutToken: checkoutToken.current,
			selectedProduct: [...productsArray, ...savedProductsArray],
			customerId: customerId,
		};

		const app_url = process.env.APP_URL;

		try {
			// Send a POST request to save the cart
			const response = await fetch(`${app_url}/api/saveCart`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(data),
			});
			if (response.ok) {
				// If the response is successful, update the banner status and title
				setShowCartItems(false);
				setBannerTitle('saved');
				setBannerStatus('success');
			} else {
				// If there is an error, log the error and update the banner status and title
				const error = await response.text();
				console.error('Error saving cart:', error);
				setShowCartItems(false);
				setBannerTitle('failed');
				setBannerStatus('critical');
			}
		} catch (error) {
			console.error('Error while saving cart:', error);
		} finally {
			setIsLoading(false);
		}
	};

	// This useEffect hook sets a timeout to show the cart items and update the banner title and status after a delay.
	// It is triggered when showCartItems is false and the bannerStatus is 'critical'.
	useEffect(() => {
		let timeoutId;

		if (!showCartItems && bannerStatus === 'critical') {
			timeoutId = setTimeout(() => {
				setShowCartItems(true);
				setBannerTitle('saveCart');
				setBannerStatus('info');
			}, 4000);
		}

		return () => {
			clearTimeout(timeoutId);
		};
	}, [showCartItems, bannerStatus]);

	// This useEffect hook is responsible for fetching the saved products for the current customer.
	// It runs whenever the customerId changes.
	useEffect(() => {
		const customer = buyerIdentity.customer.current?.id;
		if (customer) {
			const customerIdRegex = customer?.split('/').pop();
			setCustomerId(customerIdRegex);
			setBannerTitle('saveCart');
			setBannerStatus('info');
			handleGetSavedProduct();
		}
	}, [customerId]);

	return (
		<Banner
			title={customerId ? translate(`${bannerTitle}`) : translate(`${bannerTitle}`)}
			status={bannerStatus}
		>
			{showCartItems && customerId && (
				<>
					<BlockStack gap="500">
						<InlineStack>
							<Text size="medium">Not saved: </Text>
							<ChoiceList
								name="choiceMultiple"
								value={selectedProduct}
								allowMultiple
								onChange={(item) => {
									setSelectedProduct(item);
								}}
							>
								<BlockStack>
									{cart.map((item) => (
										<Choice id={item.id} key={item.id}>
											{item.merchandise.title}
										</Choice>
									))}
								</BlockStack>
							</ChoiceList>
							{savedProduct.length > 0 && (
								<>
									<Divider />
									<Text size="medium">Saved cart: </Text>
									<ChoiceList
										name="choiceMultiple"
										value={selectedSavedProduct}
										allowMultiple
										onChange={(item) => {
											setSelectedSavedProduct(item);
										}}
									>
										<BlockStack>
											{savedProduct.map((item) => (
												<Choice id={item.id} key={item.id}>
													{item.merchandise.title}
												</Choice>
											))}
										</BlockStack>
									</ChoiceList>
									<Divider />
								</>
							)}
						</InlineStack>
						<Button
							loading={isLoading}
							accessibilityRole="submit"
							disabled={
								(!selectedProduct.length && !selectedSavedProduct.length) ||
								(selectedProduct.length === 0 && selectedSavedProduct.length === 0)
							}
							onPress={() => handleSave()}
						>
							Save
						</Button>
					</BlockStack>
				</>
			)}
		</Banner>
	);
}
