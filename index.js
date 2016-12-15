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
}

var instructions = "I can read you the headlines, or get you service fuck.";

var headline = "Headline one; Do you care?";
var headlineReprompt = "Would you like to hear the whole story?";

var handlers = {
    'LaunchRequest': function(){
        //Gives instruction on how to use app.
        this.emit(':tell',instructions);
    },
    'GetHeadlinesIntent': function () {
        //Read headlines one by one.
        this.emit(':ask',headline, headlineReprompt);
    },
    'GetContentIntent': function () {
        //Checks for entitlements and purchases is needed.

        PurchaseNews();
    },
};