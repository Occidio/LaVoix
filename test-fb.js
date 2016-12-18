var https = require('https');

var callFB = function(access_token) {
    // An object of options to indicate where to post to
    var post_options = {
        host: 'graph.facebook.com',
        port: '443',
        path: '/511214920?access_token='+access_token, //FB Id https://lookup-id.com/#
        method: 'GET'
    };

    //var post_data = '{"orderItems": [{"description": "Grapegruit purchase","priceBreakDown": {"grossAmount": 10}}],"workFlowConfiguration": {"pricing": {"paymentMethod": "CreditCard","currency": "GBP"},"returnUrl": "https://google.com"}}';

    callback = function (response) {
        var str = '';

        response.on('data', function (chunk) {
            str += chunk;
        });

        response.on('end', function () {
            //ConfigAdhocSuccess(JSON.parse(str).sessionToken);
            console.log(JSON.parse(str));
        });
    };

    // Set up the request
    var post_req = https.request(post_options, callback);

    // post the data
    //post_req.write(post_data);
    post_req.end();
};

var FB_oauth = function() {
    // An object of options to indicate where to post to
    var post_options = {
        host: 'graph.facebook.com',
        port: '443',
        path: '/oauth/access_token?client_id=193234604474088&client_secret=294e7ac18f703c486285a2452ce7394c&grant_type=client_credentials', //FB Id https://lookup-id.com/#
        method: 'GET'
    };

    //var post_data = '{"orderItems": [{"description": "Grapegruit purchase","priceBreakDown": {"grossAmount": 10}}],"workFlowConfiguration": {"pricing": {"paymentMethod": "CreditCard","currency": "GBP"},"returnUrl": "https://google.com"}}';

    callback = function (response) {
        var str = '';

        response.on('data', function (chunk) {
            str += chunk;
        });

        response.on('end', function () {
            //ConfigAdhocSuccess(JSON.parse(str).sessionToken);
            console.log(str);
            console.log(str).substrig(29);
            //var access_token = //access_token=193234604474088|5zv5-e1o0Bi9EAif6ESeiOM9AH4
            callFB();
        });
    };

    // Set up the request
    var post_req = https.request(post_options, callback);

    // post the data
    //post_req.write(post_data);
    post_req.end();
};


callFB();
FB_oauth();

