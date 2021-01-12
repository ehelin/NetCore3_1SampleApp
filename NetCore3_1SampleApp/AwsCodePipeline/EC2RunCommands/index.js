var SSH = require('simple-ssh');
var Alexa = require("alexa-sdk");
var fs = require('fs');
var AWS = require('aws-sdk');

AWS.config.update({ region: "us-east-2" });

var ssh = new SSH({
	host: 'host w/o protocol here',
	user: 'ec2-user',
	key: fs.readFileSync('pem file here')
});

exports.handler = function(event, context, callback) {
	var alexa = Alexa.handler(event, context);
	alexa.registerHandlers(handlers);

	ssh.on("close", function () {alexa.execute()});
	ssh.exec('touch DockerFile', { 
	out: console.log.bind(console)
	})
	.exec('exit', {
	out: console.log.bind(console)
	}).start();
	};

	var handlers = {
	'LaunchRequest': function(){
	this.emit(':tell', 'Now opening the garage door.');
	}
};
//console.log('hi mom!');

