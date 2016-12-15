var NUMBER_OF_HEADLINES = 2;
var attributes = {
    readingHeadlines: false,
    headline: 0,
    context: null
};

exports.handler = function (event, context) {
<<<<<<< HEAD
    if (event.request.type !== "IntentRequest") {
=======
    attributes.context = context;
    if(event.request.type !== "IntentRequest"){
>>>>>>> 19c9ddac89770dd85723f7b8dff2b226494925d9
        switch (event.request.type) {
            case 'LaunchRequest':
                LaunchRequest();
                break;
            default:
                tell(context, 'WTF you talking about. This is not an intent.');
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
            case 'AMAZON.YesIntent':
                if(attributes.readingHeadlines === true)
                {
                    attributes.readingHeadlines = false;
                    switch(attributes.headline){
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
                }
                break;
            case 'AMAZON.NoIntent':
                if(attributes.readingHeadlines === true)
                {
                    GetHeadlines();
                }
                break;
            default:
                tell(context, 'WTF you talking about. This is an intent.');
                break;
        }
    }
};

function LaunchRequest(){
    ask(attributes.context, "I can give you the headlines or give you the status of your subscription; Which one would you like?");
}

function GetHeadlines(){
    attributes.readingHeadlines = true;
    if(attributes.headline == NUMBER_OF_HEADLINES)
    {
        attributes.headline = 0;
    }
    else
    {
        attributes.headline = attributes.headline + 1;
    }
    var more = "Would you like to know more?"
    switch(attributes.headline){
        case 1:
            ask(attributes.context, "Alexa integration proof of concept wins MPP Global hack; " + more);
            break;
        case 2:
            ask(attributes.context, "MPP goes global; " + more);
            break;
        default:
            ask(attributes.context, "There are no more headlines; Would you like to start again?");
            break;
    }
}

function SinglePurchase(){
    
}

function SubscriptionPurchase(){
    
}

function GetContent(){
    ConfigAdhoc(attributes.context);
}

function ConfigAdhoc(context) {
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
            ConfigSuccess(context, JSON.parse(str).sessionToken);
        });
    };

    // Set up the request
    var post_req = https.request(post_options, callback);

    // post the data
    post_req.write(post_data);
    post_req.end();
}

function ConfigSuccess(context, sessionToken) {
    //tell(context, sessionToken);
    AuthenticateAccount(context, sessionToken);
}

function AuthenticateAccount(context, sessionToken) {
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
            AuthenticateSuccess(context, sessionToken, accountId);
        });
    };

    // Set up the request
    var post_req = https.request(post_options, callback);

    // post the data
    post_req.write(post_data);
    post_req.end();
}

function AuthenticateSuccess(context, sessionToken) {
    //tell(context, 'The account id is: '+accountId+' and the session is: '+sessionToken);
    //ProcessPayment(context, sessionToken);
     VerifySession(context, sessionToken)
}

function ProcessPayment(context, sessionToken) {
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

    var post_data = '{"paymentMethod": "CreditCard","cvv": "123","voucherCode": "GPM6A374P3"}';
    callback = function (response) {
        var str = '';

        response.on('data', function (chunk) {
            str += chunk;
        });

        response.on('end', function () {
            var data = JSON.parse(str);
            var sessionToken = data.sessionToken;
            var accountId = data.accountId;
            ProcessPaymentSuccess(context);
        });
    };

    // Set up the request
    var post_req = https.request(post_options, callback);

    // post the data
    post_req.write(post_data);
    post_req.end();
}

function ProcessPaymentSuccess(context) {
    tell(context, 'Purchase successful. Check e.H.Q.!');
}

function VerifySession(context, sessionToken) {
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
            CheckAccountEntitlement(context, sessionToken, accountId);
        });
    };

    // Set up the request
    var post_req = https.request(post_options, callback);

    // post the data
    post_req.write(post_data);
    post_req.end();
}

function CheckAccountEntitlement(context, sessionToken, accountId) {
    var https = require('https');

    // An object of options to indicate where to post to
    var post_options = {
        host: 'uat.mppglobal.com',
        port: '443',
        path: '/api/accounts/' + accountId + '/entitlements',
        method: 'POST',
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
            CheckEntitlementSuccess(context, entitlements);
        });
    };

    // Set up the request
    var post_req = https.request(post_options, callback);

    // post the data
    post_req.write(post_data);
    post_req.end();
}

function CheckEntitlementSuccess(context, entitlements) {
    var count = entitlements.length;
    if (count === 0) {
        ask(context, 'You do not have any entitlements, would you like to buy this?');
    } else {
        ask(context, 'You have' + count + 'entitlements');
    }
}

function tell(context, text) {

    var response = {
        outputSpeech: {
            type: "PlainText",
            text: text
        },
        shouldEndSession: true
    };

    context.succeed({
        response: response
    });
}

function ask(context, text) {

    var response = {
        outputSpeech: {
            type: "PlainText",
            text: text
        },
        shouldEndSession: false
    };

    context.succeed({
        response: response
    });
}