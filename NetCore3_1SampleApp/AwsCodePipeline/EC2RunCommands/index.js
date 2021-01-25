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
	return new Promise(function(resolve, reject) {  
	  let ourout = "";
  
	  ssh.exec(command, {
		exit: function() {
		  ourout += "\nsuccessfully exited!";
		  resolve(ourout);
		},
		out: function(stdout) {
		  console.log('output - ' + stdout);
		}
	  }).start({
		success: function() {
		  console.log('success output - ' + ourout);
		},		
        	out: function() {
		  console.log.bind(console);
		},
		fail: function(e) {
		  console.log('Fail - ' + e);
		},
		err: function(stderr) {
		  console.log('Error - ' + stderr); 
		},
		exit: function(code) {
		  console.log('Exit code ' + code); 
		}
	  });  
	});
}

exports.handler = async function(event, context, callback) {
	console.log('Start exports.handler()');	
  
	let commands = [
		//1
		'sudo yum update -y',
		'sudo yum install git -y',
		'sudo amazon-linux-extras install docker -y',
		'sudo service docker start',
		'git clone https://github.com/ehelin/NetCore3_1SampleApp.git',

		//2
		'cd NetCore3_1SampleApp; sudo docker build . -t myawesomerepository',
		
		//3
		'cd NetCore3_1SampleApp; sudo docker run -it -p 80:80 myawesomerepository',
	];

	let res = null;
	for(let i=0; i<commands.length;i++){
		res = await RunCommand(commands[i]);
	}

	console.log('exports.handler() done');
  
	return {
	  statusCode: 200,
	  body: res,
	};
};
