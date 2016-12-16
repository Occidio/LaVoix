var NUMBER_OF_HEADLINES = 2;
var attributes = {
    readingHeadlines: false,
    headline: 0,
    context: null,
    purchaseFunction: null,
    readingStory: false
};

exports.handler = function (event, context) {
    attributes.context = context;
    if (event.request.type !== "IntentRequest") {
        switch (event.request.type) {
            case 'LaunchRequest':
                LaunchRequest();
                break;
            default:
                tell('WTF you talking about. This is not an intent.');
                break;
        }
    } else {
        switch (event.request.intent.name) {
            case 'GetHeadlinesIntent':
                GetHeadlines();
                break;
            case 'GetContentIntent':
                GetContent();
                break;
            case 'SinglePurchaseIntent':
                SinglePurchase();
                break;
            case 'SubscriptionPurchaseIntent':
                SubscriptionPurchase();
                break;
            case 'SubscriptionInfoIntent':
                SubscriptionInfo();
                break;
            case 'AMAZON.YesIntent':
                if (attributes.readingHeadlines) {
                    attributes.readingHeadlines = false;
                    switch (attributes.headline) {
                        case 1:
                            GetContent();
                            break;
                        case 2:
                            GetContent();
                            break;
                        default:
                            LaunchRequest();
                            break;
                    }
                } else if (attributes.readingStory) {
                    attributes.readingStory = false;
                    GetHeadlines();
                } else {
                    ask('You have two choises: single purchase, or purchase subscription');
                }
                break;
            case 'AMAZON.NoIntent':
                if (attributes.readingHeadlines) {
                    attributes.readingHeadlines = false;
                    GetHeadlines();
                } else if (attributes.readingStory){
                    attributes.readingStory = false;
                    Stop();
                }else{
                    LaunchRequest();
                }
                break;
            case 'AMAZON.StopIntent':
                Stop();
                break;
            default:
                tell('WTF you talking about. This is an intent.');
                break;
        }
    }
};

function LaunchRequest() {
    ask("I can; give you the headlines, or give you the status of your subscription; Which one would you like?");
}

function GetHeadlines() {
    attributes.readingHeadlines = true;
    if (attributes.headline == NUMBER_OF_HEADLINES) {
        attributes.headline = 0;
    } else {
        attributes.headline = attributes.headline + 1;
    }
    var more = "Would you like to know more?"
    switch (attributes.headline) {
        case 1:
            ask("Alexa integration proof of concept wins MPP Global hack; " + more);
            break;
        case 2:
            ask("MPP goes global; " + more);
            break;
        default:
            ask("There are no more headlines; Would you like to start again?");
            break;
    }
}

function SinglePurchase() {
    attributes.purchaseFunction = 'purchase';
    ConfigAdhoc();
}

function SubscriptionPurchase() {
    attributes.purchaseFunction = 'subscription';
    ConfigSubscription();
}

function SubscriptionInfo() {
    tell("Not implemented yet");
}

function GetContent() {
    attributes.isPurchase = false;
    ConfigAdhoc();
}

function ReadFullStory() {
    var moreHeadlines = 'Would you like another headline?'
    attributes.readingStory = true;
    switch (attributes.headline) {
        case 1:
            ask("The team in charge of developing a proof of concept for integration with Alexa has won first prize at this year's MPP Global hack project. The team will soon be showered with gifts; " + moreHeadlines);
            break;
        case 2:
            ask("With offices across the world, localized websites, and easy integration with widelly used gadgets, MPP is on track to becoming the solution the world needs; " + moreHeadlines);
            break;
        default:
            ask("That is not a valid story! " + moreHeadlines);
            break;
    }
}

function Stop() {
    attributes.headline = 0;
    tell("Fak off");
}

//SERVICE
function ConfigAdhoc() {
    var https = require('https');
    // An object of options to indicate where to post to
    var post_options = {
        host: 'uat.mppglobal.com',
        port: '443',
        path: '/api/workflows/configurations/adhoc',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Version': '1.0.0',
            'X-ClientId': '433',
            'X-ClientPassword': 'Km25Acr9GRo3b4'
        }
    };

    var post_data = '{"orderItems": [{"description": "Grapegruit purchase","priceBreakDown": {"grossAmount": 10}}],"workFlowConfiguration": {"pricing": {"paymentMethod": "CreditCard","currency": "GBP"},"returnUrl": "https://google.com"}}';

    callback = function (response) {
        var str = '';

        response.on('data', function (chunk) {
            str += chunk;
        });

        response.on('end', function () {
            ConfigAdhocSuccess(JSON.parse(str).sessionToken);
        });
    };

    // Set up the request
    var post_req = https.request(post_options, callback);

    // post the data
    post_req.write(post_data);
    post_req.end();
}

function ConfigAdhocSuccess(sessionToken) {
    AuthenticateAccount(sessionToken);
}

function ConfigSubscription() {
    var https = require('https');
    // An object of options to indicate where to post to
    var post_options = {
        host: 'uat.mppglobal.com',
        port: '443',
        path: '/api/workflows/configurations/subscriptions',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Version': '1.0.0',
            'X-ClientId': '433',
            'X-ClientPassword': 'Km25Acr9GRo3b4'
        }
    };

    var post_data = '{"WorkFlowConfiguration": {"subscriptionId": 15472,"pricing": {"priceId": 17715,"paymentMethod": "CreditCard","currency": "GBP","price": 0},"returnUrl": "https://google.com","disable3DSecure": false,"settlementType": "NextAvailable"}}';

    callback = function (response) {
        var str = '';

        response.on('data', function (chunk) {
            str += chunk;
        });

        response.on('end', function () {
            ConfigSubscriptionSuccess(JSON.parse(str).sessionToken);
        });
    };

    // Set up the request
    var post_req = https.request(post_options, callback);

    // post the data
    post_req.write(post_data);
    post_req.end();
}

function ConfigSubscriptionSuccess(sessionToken) {
    AuthenticateAccount(sessionToken);
}

function AuthenticateAccount(sessionToken) {
    var https = require('https');
    // An object of options to indicate where to post to
    var post_options = {
        host: 'uat.mppglobal.com',
        port: '443',
        path: '/api/accounts/authenticate',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Origin': 'https://skinsuat.mppglobal.com',
            'X-TokenId': '9E9F3BEF7D814538AB75AD43CC6D651B',
            'X-Version': '1.0.0',
            'X-SessionId': '' + sessionToken
        }
    };

    var post_data = '{"email": "Grapefruit@mppglobal.com","password": "testpassword01"}';
    callback = function (response) {
        var str = '';

        response.on('data', function (chunk) {
            str += chunk;
        });

        response.on('end', function () {
            var data = JSON.parse(str);
            var sessionToken = data.sessionToken;
            var accountId = data.accountId;
            AuthenticateSuccess(sessionToken, accountId);
        });
    };

    // Set up the request
    var post_req = https.request(post_options, callback);

    // post the data
    post_req.write(post_data);
    post_req.end();
}

function AuthenticateSuccess(sessionToken, accountId) {
    if (attributes.purchaseFunction === 'purchase') {
        ProcessPayment(sessionToken);
    }else if(attributes.purchaseFunction === 'subscription') {
        ProcessAddSubscription(sessionToken);
    } else {
        CheckAccountEntitlement(sessionToken, accountId);
    }
}

function ProcessPayment(sessionToken) {
    var https = require('https');
    // An object of options to indicate where to post to
    var post_options = {
        host: 'uat.mppglobal.com',
        port: '443',
        path: '/api/workflows/purchases/adhoc',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Origin': 'https://skinsuat.mppglobal.com',
            'X-TokenId': '9E9F3BEF7D814538AB75AD43CC6D651B',
            'X-Version': '1.0.0',
            'X-SessionId': '' + sessionToken
        }
    };

    var post_data = '{"paymentMethod": "CreditCard","cvv": "123","orderItems": [{"description": "Pumplemousse To the Resque","entitlements": [{"identifier": "Pamplemousse Entitlement","startDate": "2016-12-15T21:19:12.4607675Z","expiryDate": "2018-12-16T21:19:12.4607675Z"}]}]}';
    callback = function (response) {
        var str = '';

        response.on('data', function (chunk) {
            str += chunk;
        });

        response.on('end', function () {
            ProcessPaymentSuccess();
        });
    };

    // Set up the request
    var post_req = https.request(post_options, callback);

    // post the data
    post_req.write(post_data);
    post_req.end();
}

function ProcessPaymentSuccess() {
    tell('Purchase successful. Check e.H.Q.!');
}

function ProcessAddSubscription(sessionToken) {
    var https = require('https');
    // An object of options to indicate where to post to
    var post_options = {
        host: 'uat.mppglobal.com',
        port: '443',
        path: '/api/workflows/purchases/subscriptions',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Origin': 'https://skinsuat.mppglobal.com',
            'X-TokenId': '9E9F3BEF7D814538AB75AD43CC6D651B',
            'X-Version': '1.0.0',
            'X-SessionId': '' + sessionToken
        }
    };

    var post_data = '{"cvv": "123","paymentMethod": "CreditCard"}';
    callback = function (response) {
        var str = '';

        response.on('data', function (chunk) {
            str += chunk;
        });

        response.on('end', function () {
            var data = JSON.parse(str);
            var sessionToken = data.sessionToken;
            var accountId = data.accountId;
            AddSubscriptionSuccess();
        });
    };

    // Set up the request
    var post_req = https.request(post_options, callback);

    // post the data
    post_req.write(post_data);
    post_req.end();
}

function AddSubscriptionSuccess() {
    tell('Subscription added successfully. Check e.H.Q.!');
}

function VerifySession(sessionToken) {
    var https = require('https');
    // An object of options to indicate where to post to
    var post_options = {
        host: 'uat.mppglobal.com',
        port: '443',
        path: '/api/sessions',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Origin': 'https://skinsuat.mppglobal.com',
            'X-TokenId': '9E9F3BEF7D814538AB75AD43CC6D651B',
            'X-Version': '1.0.0',
            'X-SessionId': '' + sessionToken
        }
    };

    callback = function (response) {
        var str = '';

        response.on('data', function (chunk) {
            str += chunk;
        });

        response.on('end', function () {
            var data = JSON.parse(str);
            var accountId = data.accountId;
            CheckAccountEntitlement(sessionToken, accountId);
        });
    };

    // Set up the request
    var post_req = https.request(post_options, callback);

    post_req.end();
}

function CheckAccountEntitlement(sessionToken, accountId) {
    var https = require('https');

    // An object of options to indicate where to post to
    var post_options = {
        host: 'uat.mppglobal.com',
        port: '443',
        path: '/api/accounts/' + accountId + '/entitlements',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Origin': 'https://skinsuat.mppglobal.com',
            'X-TokenId': '9E9F3BEF7D814538AB75AD43CC6D651B',
            'X-Version': '1.0.0',
            'X-SessionId': '' + sessionToken
        }
    };

    callback = function (response) {
        var str = '';

        response.on('data', function (chunk) {
            str += chunk;
        });

        response.on('end', function () {
            var data = JSON.parse(str);
            var entitlements = data.entitlements;
            CheckEntitlementSuccess(entitlements);
        });
    };

    // Set up the request
    var post_req = https.request(post_options, callback);

    post_req.end();
}

function CheckEntitlementSuccess(entitlements) {
    if (entitlements) {
        var count = entitlements.length;
        if (count === 0) {
            ask('You do not have any entitlements, would you like to buy this?');
        } else {
            entitlements.forEach(function (entitlement) {
                if (entitlement.identifier === 'Pamplemousse Entitlement') {
                    ReadFullStory();
                }
            }, this);
            ask('You have'+count+' entitlements, but none match this story; Would you like to buy this?');
        }
    } else {
        ask('You do not have any entitlements, would you like to buy this?');
    }
}

function tell(text) {

    var response = {
        outputSpeech: {
            type: "PlainText",
            text: text
        },
        shouldEndSession: true
    };

    attributes.context.succeed({
        response: response
    });
}

function ask(text) {

    var response = {
        outputSpeech: {
            type: "PlainText",
            text: text
        },
        shouldEndSession: false
    };

    attributes.context.succeed({
        response: response
    });
}