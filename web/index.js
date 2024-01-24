import { join } from 'path';
import { readFileSync } from 'fs';
import express from 'express';
import serveStatic from 'serve-static';

import shopify from './shopify.js';
import webhooks from './webhooks.js';

import { PrismaClient } from '@prisma/client';

const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT, 10);

const prisma = new PrismaClient();

const STATIC_PATH =
	process.env.NODE_ENV === 'production'
		? `${process.cwd()}/frontend/dist`
		: `${process.cwd()}/frontend/`;

const app = express();

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
	shopify.config.auth.callbackPath,
	shopify.auth.callback(),
	shopify.redirectToShopifyOrAppRoot()
);
app.post(
	shopify.config.webhooks.path,
	// @ts-ignore
	shopify.processWebhooks({ webhookHandlers: webhooks })
);

// All endpoints after this point will require an active session
app.use('/api/*', shopify.validateAuthenticatedSession());

app.use(express.json());

app.use(serveStatic(STATIC_PATH, { index: false }));

// Endpoint to get the cart for a specific customer
app.get('/api/getCart', async (req, res) => {
	const customerId = req.query.customerId;
	try {
		// Retrieve the existing customer cart from the database
		const existingCustomerCart = await prisma.savedCart.findUnique({
			where: { customerId },
		});
		// Return the cart data as a JSON response
		res.json({ isSuccess: true, data: existingCustomerCart });
	} catch (err) {
		// Return an error message if there was an error retrieving the cart
		res.json({ isSuccess: false, error: err.message });
	}
});

// Endpoint to save the cart for a specific customer
app.post('/api/saveCart', async (req, res) => {
	const { checkoutToken, selectedProduct, customerId } = req.body;

	// Check if the required fields are present in the request body
	if (!selectedProduct || !checkoutToken || !customerId) {
		// Return a 400 Bad Request status with an error message if any required field is missing
		res.status(400).json({ message: 'Invalid request' });
		return;
	}

	try {
		// Check if the customer already has a saved cart
		const existingCart = await prisma.savedCart.findUnique({
			where: { customerId },
		});

		if (existingCart) {
			// If the customer has an existing cart, update the cart with the selected products
			const updatedCart = await prisma.savedCart.update({
				where: { customerId },
				data: { products: selectedProduct },
			});

			// Return a success message and the updated cart as a JSON response
			res.status(200).json({ message: 'Cart updated successfully!', cart: updatedCart });
		} else {
			// If the customer does not have an existing cart, create a new cart
			const newCart = await prisma.savedCart.create({
				data: {
					checkoutToken,
					products: selectedProduct,
					customerId,
				},
			});

			// Return a success message and the newly created cart as a JSON response
			res.status(201).json({ message: 'Cart created successfully!', cart: newCart });
		}
	} catch (error) {
		// Return a 500 Internal Server Error status with an error message if there was an error saving the cart
		res.status(500).json({ success: false, message: `Error saving cart: -> ${error}` });
	} finally {
		// Disconnect from the Prisma client after the request is processed
		await prisma.$disconnect();
	}
});

app.use('/*', shopify.ensureInstalledOnShop(), async (_req, res) => {
	return res.set('Content-Type', 'text/html').send(readFileSync(join(STATIC_PATH, 'index.html')));
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
