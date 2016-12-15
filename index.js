exports.handler = function (event, context) {
    if(event.request.type !== "IntentRequest"){
        switch (event.request.type) {
            case 'LaunchRequest':
                tell(context, "Welcome to post test.");
                break;
            default:
                tell(context, 'WTF you talking about. This is not an intent.');
                break;
        }
    }else{
        switch (event.request.intent.name) {
            case 'GetHeadlinesIntent':
                ask(context, "Headlines are now.");
                break;
            case 'GetContentIntent':
                ConfigAdhoc(event,context);
                break;
            default:
                tell(context, 'WTF you talking about. This is an intent.');
                break;
        }
    }  
};

function ConfigAdhoc(event, context) {
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
    tell(context, sessionToken)
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

};

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
};