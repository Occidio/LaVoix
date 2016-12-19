var NUMBER_OF_HEADLINES = 2;
var attributes = {
    readingHeadlines: false,
    headline: 0,
    context: null,
    purchasing: 0,
    purchaseFunction: null,
    readingStory: false,
    postToSocial: true
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
            case 'testPostToSocial':
                attributes.headline = 1;
                PostToSocial();
            case 'SubscriptionIntent':
                if (attributes.purchasing === 1) {
                    attributes.purchasing = 0;
                    SubscriptionPurchase();
                } else {
                    SubscriptionInfo();
                }
                break;
            case 'AMAZON.YesIntent':
                if (attributes.readingHeadlines) {
                    attributes.readingHeadlines = false;
                    switch (attributes.headline) {
                        case 1:
                        case 2:
                            GetContent();
                            break;
                        default:
                            LaunchRequest();
                            break;
                    }
                } else if (attributes.readingStory) {
                    attributes.readingStory = false;
                    PostToSocial();
                } else if (attributes.postToSocial) {
                    attributes.postToSocial = false;
                    GetHeadlines();
                } else {
                    ask('Would you like to buy access for today for £0.50 or buy a subscription for £4.99 per month?');
                }
                break;
            case 'AMAZON.NoIntent':
                if (attributes.readingHeadlines) {
                    attributes.readingHeadlines = false;
                    GetHeadlines();
                } else if (attributes.readingStory) {
                    attributes.readingStory = false;
                    Stop();
                } else {
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
    attributes.headline = 0;
    attributes.purchasing = 0;
    ask("Welcome to grapefruit news. I can give you the headlines, or give you the status of your subscription; Which one would you like?");
}

function GetHeadlines() {
    attributes.purchaseFunction = null;
    attributes.readingHeadlines = true;
    attributes.purchasing = 0;
    if (attributes.headline === NUMBER_OF_HEADLINES) {
        attributes.headline = 0;
    } else {
        attributes.headline = attributes.headline + 1;
    }
    var more = "Would you like to know more?";
    var startInfo = attributes.headline === 1 ? "Here are your headlines. " : "";
    switch (attributes.headline) {
        case 1:
            ask(startInfo + "Alexa integration proof of concept wins MPP Global hack; " + more);
            break;
        case 2:
            ask(startInfo + "MPP goes global; " + more);
            break;
        default:
            ask("There are no more headlines; Would you like to start again?");
            break;
    }
}

function SinglePurchase() {
    if (attributes.headline === 0)
        LaunchRequest();
    attributes.purchaseFunction = 'purchase';
    ConfigAdhoc();
}

function SubscriptionPurchase() {
    if (attributes.headline === 0)
        LaunchRequest();
    attributes.purchaseFunction = 'subscription';
    ConfigSubscription();
}

function SubscriptionInfo() {
    attributes.purchaseFunction = 'subscriptionInfo';
    AuthenticateAccount('');
}

function GetContent() {
    if (attributes.headline === 0)
        LaunchRequest();
    attributes.purchaseFunction = null;
    ConfigAdhoc();
}

function ReadFullStory(justBought) {
    var moreHeadlines = 'Would you like another headline?';
    var postToFacebook = 'Would you like to post this story to Facebook?';
    var purchaseSuccess = justBought ? 'Purchase successful; Here is your content: ' : "";
    attributes.readingStory = true;
    switch (attributes.headline) {
        case 1:
            var full1 = "The team in charge of developing a proof of concept for integration with Alexa has won first prize at this year's MPP Global hack project. The team will soon be showered with gifts and adoration from colleagues; ";
            ask(purchaseSuccess + full1 + postToFacebook);
            break;
        case 2:
            var full2 = "With offices across the world, localized websites, and easy integration with widelly used gadgets, MPP is on track to becoming the solution the world needs; ";
            ask(purchaseSuccess + full2 + postToFacebook);
            break;
        default:
            ask("That is not a valid story! " + moreHeadlines);
            break;
    }
}

function Stop() {
    attributes.headline = 0;
    tell("Goodbye, we'll chat again soon.");
}

function PostToSocial() {
    attributes.postToSocial = true;
    var moreHeadlines = 'Would you like another headline?';
    var postedByMppFromAlexa = 'This news article was posted by MPP Global from Alexa!'
    switch (attributes.headline) {
        case 1:
            var full1 = "The team in charge of developing a proof of concept for integration with Alexa has won first prize at this year's MPP Global hack project. The team will soon be showered with gifts and adoration from colleagues; ";
            PostArticleToFacebook(full1 + postedByMppFromAlexa);
            break;
        case 2:
            var full2 = "With offices across the world, localized websites, and easy integration with widelly used gadgets, MPP is on track to becoming the solution the world needs; ";
            PostArticleToFacebook(feill2 + postedByMppFromAlexa);
            break;
        default:
            ask("That is not a valid story! " + moreHeadlines);
            break;
    }
}


// -----------------------------------------
//
//              SERVICE
//
// -----------------------------------------

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
        attributes.purchaseFunction = null;
        ProcessPayment(sessionToken);
    } else if (attributes.purchaseFunction === 'subscription') {
        attributes.purchaseFunction = null;
        ProcessAddSubscription(sessionToken);
    } else if (attributes.purchaseFunction === 'subscriptionInfo') {
        attributes.purchaseFunction = null;
        CheckAccountSubscriptions(sessionToken, accountId);
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
    ReadFullStory(true);
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
    ReadFullStory(true);
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
    attributes.purchasing = 1;
    if (entitlements) {
        var count = entitlements.length;
        if (count === 0) {
            ask('You do not have an active subscription, would you like to buy access to this content?');
        } else {
            entitlements.forEach(function (entitlement) {
                if (entitlement.identifier === 'Pamplemousse Entitlement') {
                    attributes.purchasing = 0;
                    ReadFullStory();
                }
            }, this);
            ask('You have ' + count + ' active subscriptions, but none match this story; Would you like to buy access to this content?');
        }
    } else {
        ask('You do not have an active subscription, would you like to buy access to this content?');
    }
}

function CheckAccountSubscriptions(sessionToken, accountId) {
    var https = require('https');

    // An object of options to indicate where to post to
    var post_options = {
        host: 'uat.mppglobal.com',
        port: '443',
        path: '/api/accounts/' + accountId + '/subscriptions',
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
            var subscriptions = data.subscriptions;
            CheckSubscriptionsSuccess(subscriptions);
        });
    };

    // Set up the request
    var post_req = https.request(post_options, callback);

    post_req.end();
}

function CheckSubscriptionsSuccess(subscriptions) {
    if (subscriptions && subscriptions.length > 0) {
        var date = subscriptions[0].accountSubscriptionInfo.recurringPaymentInfo.nextPaymentDate;
        var sub = {
            title: subscriptions[0].defaultSubscriptionInfo.subscriptionTitle,
            price: subscriptions[0].accountSubscriptionInfo.recurringPaymentInfo.subscribedPrice,
            currency: subscriptions[0].accountSubscriptionInfo.recurringPaymentInfo.currency,
            nextPayment: date.substring(0, 10),
            isActive: subscriptions[0].accountSubscriptionInfo.recurringPaymentInfo.statusInfo.statusId == 2
        }
        if (sub.isActive) {
            parseSubscription(sub);
        } else {
            tell('You do not have any active subscriptions.');
        }
    } else {
        tell('You do not have any subscriptions.');
    }
}

function PostArticleToFacebook(article) {
    var https = require('https');
    var querystring = require('querystring');

    var message = '' + article + ' . ' + timestamp();
    var queryStringObj = {
        'message': message,
        'access_token': 'EAARUdAzQ9UABAHyY1cWaVCZCKWjq39g0CLyRZC7sYZAAX93A9Fs8r8VXbSy96g2U600UDUiS2zkwwaaXXobb6ve24e8RBDC2JZBZBCnD804qDN3fZCgeZCew5GGOwQg8inwsYi9puXDDtN47SidSvCg7RGQFkDUMaTnv91cdlgMZAsjBrlXgZALLa'
    }
    var safeQuaryString = querystring.stringify(queryStringObj);

    var options = {
        "method": 'POST',
        "hostname": 'graph.facebook.com',
        "port": null,
        "path": '/me/feed?' + safeQuaryString
    };

    console.log(options);
    var req = https.request(options, function (res) {
        var chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });

        res.on("end", function () {
            var body = Buffer.concat(chunks);
            console.log(body.toString());
            PostToSocialSuccess();
        });
    });

    req.end();
}

function PostToSocialSuccess() {
    ask('Your article has been shared to Facebook! Would you like another headline? ');
}

// HELPER
function parseSubscription(sub) {
    tell('You own 1 subscription. ' + sub.title + ' costs £' + sub.price + ' per month. The next payment is on ' + sub.nextPayment + '.');
}

var timestamp = function () {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();
    var hh = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();

    return '' + yyyy + mm + dd + '_' + hh + m + s;
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