import shopify from './shopify.js';

async function getSessionId(req, res) {
	return shopify.api.session.getCurrentId({
		isOnline: false,
		rawRequest: req,
		rawResponse: res,
	});
}

export async function getSessionFromStorage(req, res) {
	const sessionId = await getSessionId(req, res);
	return shopify.config.sessionStorage.loadSession(sessionId);
}

export async function getOfflineSessionFromStorage(domain) {
	const sessionId = shopify.api.session.getOfflineId(domain);
	return shopify.config.sessionStorage.loadSession(sessionId);
}
