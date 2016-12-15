'use strict';
var EsuiteInterface = require('./esuiteInterface');
var Alexa = require('alexa-sdk');

this.attributes["sessionToken"];
this.attributes["currentAccountId"];

var checkEntitlementsFull = function () {
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
                    this.attributes["sessionToken"] = token;
                    this.attributes["currentAccountId"] = accountId;
                    return checkEntitlementsShort(token, accountId);
                } else {
                    console.log('Error in Authenticate Account');
                    console.log(token);
                }
            });
        } else {
            console.log('Error in Configuration Misc Charge');
            console.log(token);
        }
    });
};

var checkEntitlementsShort = function (token, accountId) {
    esuiteInterface.CheckAccountEntitlement(token, accountId, function (isError, entitlements) {
        if (!isError) {
            console.log('Entitlement from Check Account Entitlement: ' + entitlements);
            if (entitlements) {
                entitlements.forEach(function (element) {
                    if (entitlement.identifier === "pamplemousse") {
                        console.log('found Pamplemousse');
                        return true;
                    }
                }, this);
                console.log('There wasnt any entitlement called Pamplemousse, but there are ' + entitlements.length + ' entitlemnts');
                return false;
            } else {
                console.log('This user has no entitlements');
                return false;
            }
        } else {
            console.log('Error in Check Account Entitlement');
            console.log(entitlements);
        }
    });
}

var processPayment = function () {
    var esuiteInterface = new EsuiteInterface();
    esuiteInterface.processPayment(this.attributes["sessionToken"], function (isError, response) {
        if (!isError) {
            return true;
        } else {
            return false;
        }
    });
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
        var hasEntitlement = false;
        if(!this.attributes["sessionToken"]){
            hasEntitlement = checkEntitlementsFull();
        }else{
            hasEntitlement = checkEntitlementsShort();
        }

        this.emit(':tell', 'So far so good.');

        if (hasEntitlement) {
            this.emit(':tell', 'Reading full story.');
        } else {
            this.emit(':ask', 'You do not have access to this content. Would you like to make a single purchase; or purchase a subscription?', 'What would you like to do?');
        }
    },
    'SinglePurchaseIntent': function () {
        //Do process payment.
        this.attributes["purchaseType"] = "singlePurchase";

        var payment = processPayment();

        if(payment)
        {
            this.emit('GetContentIntent');
        }
        else
        {
            this.emit(':ask', 'Payment failed; Would you like to try again?', 'Would you like to try again?');
        }
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