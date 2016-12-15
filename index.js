var EsuiteInterface = require('./esuiteInterface');
var Alexa = require('alexa-sdk');

exports.handler = function(event, context, callback){
    var alexa = Alexa.handler(event, context);
    alexa.appId = "amzn1.ask.skill.3fcdbcd8-7d87-4def-8542-7ea11b85acdc";
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var PurchaseNews = function(){  
        this.ConfigurationMiscCharge(function(isError, token){
            this.emit(':tell','Call to misc done.');
            if(!isError){           
                this.AuthenticateAccount(function(isError, token){
                this.emit(':tell','Call to authenticate done.');
                    if(!isError){                  
                        this.emit(':tell','DONE THE THING.');
                    }
                });
            }
        });
};

var headline = "Headline one; Do you care?";
var headlineReprompt = "Would you like to hear the whole story?";

var handlers = {
    'LaunchRequest': function(){
        //Gives instruction on how to use app.
        this.emit(':ask', "I can read you the headlines or give you the status of your subscription.", "Which one would you like?");
    },
    'GetHeadlinesIntent': function () {
        //Read headlines one by one.
        this.emit(':ask',headline, headlineReprompt);
    },
    'GetContentIntent': function () {
        //Checks for entitlements and purchases if needed.
        // PurchaseNews();
        this.emit(':ask','You do not have access to this content. You can make a single purchase for the item or purchase a subscription.', 'What would you like to do?');
    },
    'SinglePurchaseIntent': function (intent, session, response) {
        //Do process payment.
        this.emit(':tell','Single purchase intent received.');

        session.attributes.purchaseType = "singlePurchase";

        this.emit(':ask','Payment failed.', 'Would you like to try again?');
    },
    'SubscriptionPurchaseIntent': function (intent, session, response) {
        //Do add Subscription.
        this.emit(':tell','Subscription purchase intent received.');

        session.attributes.purchaseType = "subscription";

        this.emit(':ask','Payment failed.', 'Would you like to try again?');
    },
    'ServiceInfoIntent': function () {
        //Get service info.
        this.emit(':tell','Serivce info intent received.');
    },
    'AMAZON.YesIntent': function (intent, session, response) {
        if(session.attributes.purchaseType == "singlePurchase")
        {
            this.emit(':tell','Purchased single item.');
            //do single purchase
        }
        else if(session.attributes.purchaseType == "subscription")
        {
            this.emit(':tell','Purchased subscription.');
            //do subscription purchase
        }
    },
    'AMAZON.NoIntent': function (intent, session, response) {
        session.attributes.purchaseType = "";
        this.emit('LaunchRequest');
    }
};