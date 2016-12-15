'use strict';
var request = require('request');
var esuiteInterfacePrototype = esuiteInterface.prototype;

function esuiteInterface() {};


esuiteInterfacePrototype.ConfigurationMiscCharge = function (callback) {

	// Set the headers
	let headers = {
		'Content-Type': 'application/json',
		'X-Version': '1.0.0',
		'X-ClientId': '433',
		'X-ClientPassword': 'Km25Acr9GRo3b4',
		'Origin': 'https://uat.mppglobal.com'
	};

	// Configure the request
	let options = {
		url: 'https://uat.mppglobal.com/api/workflows/configurations/adhoc',
		method: 'POST',
		headers: headers,
		json: {
			"orderItems": [{
				"description": "Grapegruit purchase",
				"priceBreakDown": {
					"grossAmount": 10
				}
			}],
			"workFlowConfiguration": {
				"pricing": {
					"paymentMethod": "CreditCard",
					"currency": "GBP"
				},
				"returnUrl": "https://google.com"
			}
		}
	};

	request(options, function (error, response, body) {
		if (error) {
			callback(true, response);
			return;
		}
		var sessionToken = body.sessionToken;
		callback(false, sessionToken);
	})
};

esuiteInterfacePrototype.AuthenticateAccount = function (session, callback) {
	// Set the headers
	let headers = {
		'Content-Type': 'application/json',
		'X-Version': '1.0.0',
		'X-TokenId': '9E9F3BEF7D814538AB75AD43CC6D651B',
		'Origin': 'https://skinsuat.mppglobal.com',
		'X-SessionId': session
	};

	// Configure the request
	let options = {
		url: 'https://uat.mppglobal.com/api/accounts/authenticate',
		method: 'POST',
		headers: headers,
		json: {
			"email": "Grapefruit@mppglobal.com",
			"password": "testpassword01"
		}
	};

	request(options, function (error, response, body) {
		if (error) {
			callback(true, response);
			return;
		}
		let sessionToken = body.sessionToken;
		let accountId = body.accountId;
		callback(false, sessionToken, accountId);
	});
};

esuiteInterfacePrototype.CheckAccountEntitolement = function (session, accountId, callback) {
	// Set the headers
	let headers = {
		'Content-Type': 'application/json',
		'X-Version': '1.0.0',
		'X-TokenId': '9E9F3BEF7D814538AB75AD43CC6D651B',
		'Origin': 'https://skinsuat.mppglobal.com',
		'X-SessionId': session
	};

	// Configure the request
	let options = {
		url: 'https://uat.mppglobal.com/api/accounts/'+accountId+'/entitlements',
		method: 'GET',
		headers: headers
	};

	request(options, function (error, response, body) {
		if (error) {
			callback(true, response);
			return;
		}
		let entitlements = body.entitlements;
		callback(false, entitlements);
	});
};

module.exports = esuiteInterface;