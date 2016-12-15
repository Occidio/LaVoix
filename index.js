'use strict';
var EsuiteInterface = require('./esuiteInterface');
var Alexa = require('alexa-sdk');

var checkEntitlements = function () {
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
                    console.log('Starting: Check Account Entitolement');
                    esuiteInterface.CheckAccountEntitolement(token, accountId, function (isError, entitlements) {
                        if (!isError) {
                            console.log('Entitolement from Check Account Entitolement: ' + entitlements);
                            if(entitlements) {
                                entitlements.forEach(function(element) {
                                    if(entitlement.identifier === "pamplemousse") {
                                        console.log('found Pomplemousse');
                                        return true;
                                    }                                    
                                }, this);
                                console.log('There wasnt any entitlement called Pomplemousse, but there are '+entitlements.length+' entitlemnts');
                                return false;
                            }else{
                                console.log('This user has no entitolements');
                                return false;
                            }
                        } else {
                            console.log('Error in Check Account Entitolement');
                            console.log(entitlements);
                        }
                    });
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

checkEntitlements();

exports.handler = function (event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = "amzn1.ask.skill.3fcdbcd8-7d87-4def-8542-7ea11b85acdc";
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var PurchaseNews = function () {
    var hasEntitlement = checkEntitlements();
};

var handlers = {
    'LaunchRequest': function () {
        //Gives instruction on how to use app.
        this.emit(':tell', 'I can read you the headlines or give you the status of your subscription; Which one would you like?');
    },
    'GetHeadlinesIntent': function () {
        //Read headlines one by one.
        this.emit(':tell', 'Headline one.');
    },
    'GetContentIntent': function () {
        //Checks for entitlements and purchases if needed.
        // PurchaseNews();
        this.emit(':tell','You do not have access to this content. You can make a single purchase for the item or purchase a subscription; What would you like to do?');
    },
    'SinglePurchaseIntent': function () {
        //Do process payment.
        this.attributes["purchaseType"] = "singlePurchase";

        this.emit(':ask','Payment failed; Would you like to try again?', 'Would you like to try again?');
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
        if(this.attributes["purchaseType"] == "singlePurchase")
        {
            this.emit(':tell','Purchased single item.');
            //do single purchase
        }
        else if(this.attributes["purchaseType"] == "subscription")
        {
            this.emit(':tell','Purchased subscription.');
            //do subscription purchase
        }
    },
    'AMAZON.NoIntent': function () {
        this.attributes["purchaseType"] = "";
        this.emit('LaunchRequest');
    }
};