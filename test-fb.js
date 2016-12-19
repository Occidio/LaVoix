var https = require('https');
var FB_APP_ID = '1218757314803008';
var FB_APP_SECRET = '87b220f191da2b0589c7c001398dcb8f';
var FB_USER_ID = '100012931541050';
var FB_ACCESS_TOKEN_POST_ACTION = 'EAARUdAzQ9UABAKMN78cVUFjn1rIbQIlJrIWiO5ma2OZC4Kk3C50rDzoGgb6byef7PZCJG2aBwzz6U4wcpfA26vDR8cL21vd2DHvZBCZBhZCCbVqsYSQrRGQI91ZCwIY6EgYxZCJ2lXJGR0hNAnnGwZA3eNOQlOqYa14gu97k7UC4GMtN2V5i25nM';


var callFB = function (access_token) {
    // An object of options to indicate where to post to
    var post_options = {
        host: 'graph.facebook.com',
        port: '443',
        path: '/' + FB_USER_ID + '?access_token=' + access_token, //FB Id https://lookup-id.com/#
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

var FB_oauth = function () {
    // An object of options to indicate where to post to
    var post_options = {
        host: 'graph.facebook.com',
        port: '443',
        path: '/oauth/access_token?client_id=' + FB_APP_ID + '&client_secret=' + FB_APP_SECRET + '&grant_type=client_credentials', //FB Id https://lookup-id.com/#
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
            var accessToken = str.substring(30);
            console.log(accessToken);
            //var access_token = //access_token=193234604474088|5zv5-e1o0Bi9EAif6ESeiOM9AH4
            callFB(accessToken);
        });
    };

    // Set up the request
    var post_req = https.request(post_options, callback);

    // post the data
    //post_req.write(post_data);
    post_req.end();
};

var FB_postToFeed = function (userId, access_token, message) {
    // An object of options to indicate where to post to
    var post_options = {
        host: 'graph.facebook.com',
        port: '443',
        path: '/' + userId + '/feed?access_token=' + access_token, //FB Id https://lookup-id.com/#
        method: 'POST'
    };

    var post_data = '{"message": ' + message + '}';

    callback = function (response) {
        var str = '';

        response.on('data', function (chunk) {
            str += chunk;
        });

        response.on('end', function () {
            console.log(str);
        });
    };

    // Set up the request
    var post_req = https.request(post_options, callback);

    // post the data
    post_req.write(post_data);
    post_req.end();
};

var FB_postToFeed2 = function (userId, access_token, message) {
    // An object of options to indicate where to post to
    var post_options = {
        host: 'graph.facebook.com',
        port: '443',
        path: '/me/feed', //FB Id https://lookup-id.com/#
        method: 'POST',
        query: 'mesage=' + message + '&access_token=' + access_token
    };

    //var post_data = '{"message": '+message+'}';

    callback = function (response) {
        var str = '';

        response.on('data', function (chunk) {
            str += chunk;
        });

        response.on('end', function () {
            console.log(str);
        });
    };

    // Set up the request
    var post_req = https.request(post_options, callback);

    // post the data
    //post_req.write(post_data);
    post_req.end();
};

var testFromPostMan = function () {
    var testMessage = 'TestMessage' + timestamp();
    var options = {
        "method": "POST",
        "hostname": "graph.facebook.com",
        "port": null,
        "path": "/me/feed?message=" + testMessage + "&access_token=EAARUdAzQ9UABAKWXIx0MA9eiXH0l4ynBmucc4MQYuitfR0s13BY6ioiUHJiszyjMW5t7S1o01JZBr4sdZA9gngT5QGqqdvt8XWOPD9U0dqVv7Q97J6NVnRCua8POeQfPypwa8TPvrx4wEZAENpGdRrZBgKf9O2Q77ckky63nfJ1EE1QwXoQY",
        "headers": {
            "cache-control": "no-cache"
        }
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
        });
    });

    req.end();
};

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

testFromPostMan();