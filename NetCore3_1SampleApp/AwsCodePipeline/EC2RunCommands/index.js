var SSH = require('simple-ssh');
var fs = require('fs');
var AWS = require('aws-sdk');

AWS.config.update({ region: "us-east-2" });

var ssh = new SSH({
	host: 'your host w/o protocol here!',
	user: 'ec2-user',
	key: fs.readFileSync('NetCore3_1KeyPairV2.pem'),
	timeout: 120000
});

async function RunCommand(command) {
	console.log('Start RunCommand(command) - command: ' + command);	

	return new Promise(function(resolve, reject) {  
	  let ourout = "";
  
	  ssh.exec(command, {
		exit: function() {
		  ourout += "\nsuccessfully exited!";
		  resolve(ourout);
		},
		out: function(stdout) {
		  ourout += stdout;
		}
	  }).start({
		success: function() {
		  console.log("successful connection! command - " + command);
		},
		fail: function(e) {
		  console.log("failed connection! command - " + command);
		  console.log(e);
		}
	  });  
	});
}

exports.handler = async function(event, context, callback) {
	console.log('Start exports.handler()');	
  
	let commands = [
		'sudo yum update -y',
		'sudo yum install git -y',
		'sudo amazon-linux-extras install docker -y',
		'sudo service docker start',
		'cd home/ec2-user',
		'git clone https://github.com/ehelin/NetCore3_1SampleApp.git',
		'cd NetCore3_1SampleApp',
		'sudo docker build . -t myawesomerepository',
		'sudo docker run -it -p 80:80 myawesomerepository'
	];
	let res = null;
	for(let i=0; i<commands.length;i++){
		res = await RunCommand(commands[i]);
	}

	console.log('exports.handler() done');
  
	const response = {
	  statusCode: 200,
	  body: res,
	};
	return response;
};
