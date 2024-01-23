/* eslint-disable  */

import { DeliveryMethod } from '@shopify/shopify-api';
import shopify from './shopify.js';
import { getOfflineSessionFromStorage } from './session.js';

const webhooksConfig = {
	// TOPIC: {
	// 	deliveryMethod: DeliveryMethod.Http,
	// 	callbackUrl: '/api/webhooks',
	// 	callback: async (topic, shop, body, webhookId) => {
	// 		// const payload = JSON.parse(body);
	// 	},
	// },
};

export async function ensureWebhooksInstalled(req, res, next) {
	try {
		const session = await getOfflineSessionFromStorage(req.query.shop);
		shopify.api.webhooks.register({ session });
	} catch (e) {
		console.warn(e);
	}
	next();
}

export default webhooksConfig;
