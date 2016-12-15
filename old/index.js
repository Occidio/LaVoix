'use strict';
var EsuiteInterface = require('./esuiteInterface');
var Alexa = require('alexa-sdk');
var request = require('request');
var http = require('http');

var checkEntitlementsFull = function (callback) {
    var esuiteInterface = new EsuiteInterface();
    console.log('Starting: Config Miss Charge');
    esuiteInterface.ConfigurationMiscCharge(function (isError, token) {
        if (!isError) {
            console.log('Token from Config Miss Charge: ' + token);
            console.log('Starting: Authenticate Account');
            esuiteInterface.AuthenticateAccount(token, function (isError, token, accountId) {
                if (!isError) {
                    console.log('Token from Authenticate Account: ' + token);
                    console.log('Account Id from Authenticate Account: ' + accountId);
                    console.log('Starting: Check Account Entitlement');
                    this.emit(':tell', 'Full token: '+token);
                    this.attributes["sessionToken"] = token;
                    this.attributes["currentAccountId"] = accountId;
                    checkEntitlementsShort(token, accountId, callback);
                } else {
                    this.emit(':tell', 'Error in auth account.');
                    console.log('Error in Authenticate Account');
                    console.log(token);
                }
            });
        } else {
            this.emit(':tell', 'Error in misc charge.');
            console.log('Error in Configuration Misc Charge');
            console.log(token);
        }
    });
};

var checkEntitlementsShort = function (token, accountId, callback) {
    esuiteInterface.CheckAccountEntitlement(token, accountId, function (isError, entitlements) {
        if (!isError) {
            this.emit(':tell', 'Short token: '+token);
            console.log('Entitlement from Check Account Entitlement: ' + entitlements);
            if (entitlements) {
                entitlements.forEach(function (element) {
                    if (entitlement.identifier === "pamplemousse") {
                        console.log('found Pamplemousse');
                        callback(false, true);
                    }
                }, this);
                console.log('There wasnt any entitlement called Pamplemousse, but there are ' + entitlements.length + ' entitlemnts');
                callback(true);
            } else {
                console.log('This user has no entitlements');
                callback(true);
            }
        } else {
            this.emit(':tell', 'Error in check short.');
            console.log('Error in Check Account Entitlement');
            console.log(entitlements);
        }
    });
}

var processPayment = function () {
    // var esuiteInterface = new EsuiteInterface();
    // esuiteInterface.processPayment(this.attributes["sessionToken"], function (isError, response) {
    //     if (!isError) {
    //         return true;
    //     } else {
    //         return false;
    //     }
    // });
}

exports.handler = function (event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = "amzn1.ask.skill.3fcdbcd8-7d87-4def-8542-7ea11b85acdc";
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var readHeadlines = function () {
    this.emit(':tell', 'Headlines are usually read out here.');
}

var handlers = {
    'LaunchRequest': function () {
        //Gives instruction on how to use app.
        this.emit(':ask', "I can read you the headlines or give you the status of your subscription; Which one would you like?", "Which one would you like?");
    },
    'GetHeadlinesIntent': function () {
        this.attributes["readingHeadlines"] = true;
        //Read headlines one by one.
        this.emit(':ask', 'Headline one; Would you like to hear more?');
    },
    'GetContentIntent': function () {
        //Checks for entitlements and purchases if needed.
        // this.emit(':tell', 'lol');
        // checkEntitlementsFull(function(isError, hasEntitlement){
        //     if (!isError) {
        //         if (hasEntitlement) {
        //             this.emit(':tell', 'Reading full story.');
        //         } else {
        //             this.emit(':ask', 'You do not have access to this content. Would you like to make a single purchase; or purchase a subscription?', 'What would you like to do?');
        //         }
        //     }
        //     else{
        //         this.emit(':tell', 'Error in content check.');
        //     }
        // });

        // Configure the request
        var options = {
            host: 'https://uat.mppglobal.com',
            path: '/api/workflows/configurations/adhoc',
            method: 'POST',
            'Content-Type': 'application/json'
        };

        var callback = function(response){
            this.emit(':tell', 'response is: ' + response);
        }

        var req = http.request(options, callback);
        var postData = '{"orderItems": [{"description": "Grapegruit purchase","priceBreakDown": {"grossAmount": 10}}],"workFlowConfiguration": {"pricing": {"paymentMethod": "CreditCard","currency": "GBP"},"returnUrl": "https://google.com"}}';
        req.write(postData);
        req.end();
    },
    'SinglePurchaseIntent': function () {
        //Do process payment.
        // this.attributes["purchaseType"] = "singlePurchase";

        this.emit(':tell', ''+this.attributes["sessionToken"]);

        // if(processPayment())
        // {
        //     this.emit('GetContentIntent');
        // }
        // else
        // {
        //     this.emit(':ask', 'Payment failed; Would you like to try again?', 'Would you like to try again?');
        // }
    },
    'SubscriptionPurchaseIntent': function () {
        //Do add Subscription.
        this.attributes["purchaseType"] = "subscription";

        this.emit(':ask','Payment failed; Would you like to try again?', 'Would you like to try again?');
    },
    'ServiceInfoIntent': function () {
        //Get service info.
        this.emit(':tell','Service info intent received.');
    },
    'AMAZON.YesIntent': function () {
        if(this.attributes["readingHeadlines"])
        {
            this.attributes["readingHeadlines"] = false;
            this.emit('GetContentIntent');
        }
        else
        {
            if(this.attributes["purchaseType"] == "singlePurchase")
            {
                this.attributes["purchaseType"] = "";
                this.emit(':tell','Purchased single item.');
                //do single purchase
            }
            else if(this.attributes["purchaseType"] == "subscription")
            {
                this.attributes["purchaseType"] = "";
                this.emit(':tell','Purchased subscription.');
                //do subscription purchase
            }
        }
    },
    'AMAZON.NoIntent': function () {
        this.attributes["purchaseType"] = "";
        this.emit('LaunchRequest');
    }
};