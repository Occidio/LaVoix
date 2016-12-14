var EsuiteInterface = require('./esuiteInterface');
var http = require('http');

var authCallback = function(isError, response){
    if(isError){
			console.log('ERROR:' + response);
  }else{
      console.log('authCallback Token:' + response);
  }
}

var miscCallback = function(isError, response){
  if(isError){
			console.log('ERROR:' + response);
  }else{
      console.log('miscCallback Token:' + response);
      
      var esuiteInterface = new EsuiteInterface();
      esuiteInterface.AuthenticateAccount(response, authCallback);
  }
}

var server = http.createServer(function(req, res) {
  var esuiteInterface = new EsuiteInterface();
  res.writeHead(200);
  esuiteInterface.ConfigurationMiscCharge(miscCallback);
});
server.listen(8080);