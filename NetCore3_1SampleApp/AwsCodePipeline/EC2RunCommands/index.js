var SSH = require('simple-ssh');
var fs = require('fs');
var AWS = require('aws-sdk')
var codepipeline = new AWS.CodePipeline()

async function RunCommand(command, awsHost) {	
	var ssh = new SSH({
		host: awsHost,
		user: 'ec2-user',
		key: fs.readFileSync('NetCore3_1KeyPairV2.pem'),
		timeout: 120000
	});

	return new Promise(function(resolve, reject) {  
	  let output = "";
  
	  ssh.exec(command, {
		exit: function() {
			output += "\nsuccessfully exited!";
		  resolve(output);
		},
		out: function(stdout) {
		  console.log('output - ' + stdout);
		}
	  }).start({
		success: function() {
		  console.log('success output - ' + output);
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
	console.log('exports.handler() starting...');

	console.log(JSON.stringify(event, null, 2))
	var jobId = event["CodePipeline.job"].id

    	console.log("Set region...");
	AWS.config.update({region: 'us-east-2'});
	
	var codePipelineParams = { jobId: jobId };	// for exit

	try 
	{
		var params = event["CodePipeline.job"].data.actionConfiguration.configuration.UserParameters;
		console.log('params: ' + JSON.stringify(params, null, 2));

		var awsHost = params[0]; // TODO figure actual parameter
		if (awsHost === null || awsHost === '' || awsHost === undefined)
		{
			throw 'awsHost is not set';
		}
	
		let commands = [
			'sudo yum update -y',
			'sudo yum install git -y',
			'sudo amazon-linux-extras install docker -y',
			'sudo service docker start',
			'git clone https://github.com/ehelin/NetCore3_1SampleApp.git',
			'cd NetCore3_1SampleApp; sudo docker build . -t myawesomerepository'
		];
		for(let i=0; i<commands.length;i++){
			await RunCommand(commands[i], awsHost);
		}

		console.log('exports.handler() done');
			
		return codepipeline.putJobSuccessResult(params).promise();
	} 
	catch(err)
	{
		console.log('exports.handler() error: ' + err);
			
		return codepipeline.putJobFailureResult(codePipelineParams).promise();
	}
};
