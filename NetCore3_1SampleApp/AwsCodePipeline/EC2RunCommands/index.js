var SSH = require('simple-ssh');
var fs = require('fs');
var AWS = require('aws-sdk')
var codepipeline = new AWS.CodePipeline();

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

async function RunCommands(awsHost, params)
{
	console.log('RunCommands(awsHost): ' + awsHost);

	try 
	{	
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
			console.log('commands: ' + commands[i]);
			//await RunCommand(commands[i], awsHost);
		}
		
		console.log('RunCommands(awsHost) done');
			
		return codepipeline.putJobSuccessResult(params).promise();
	} 
	catch(err)
	{
		console.log('exports.handler() error: ' + err);
			
		return codepipeline.putJobFailureResult(params).promise();
	}
}

exports.handler = async function(event, context, callback) {
	var awsHost = null;
	console.log('exports.handler() starting...');

	console.log(JSON.stringify(event, null, 2))
	var jobId = event["CodePipeline.job"].id

    	console.log("Set region...");
	AWS.config.update({region: 'us-east-2'});
	
	var params = { jobId: jobId };
	
	console.log("Create for describe_instances()");
	var describeInstanceParams = { };
	var instanceDescribePromise = new AWS.EC2({apiVersion: '2016-11-15'}).describeInstances(describeInstanceParams).promise();

	return instanceDescribePromise.then(
		function(data) {
		console.log("Call back of describe_instances()");
		console.log(JSON.stringify(data, null, 2));

		console.log("Looking for public id...");
		var canBreak = false;
		for(var o=0; o<data.Reservations.length; o++)
		{		 
			var currentReservation = data.Reservations[o];

			for(var i=0; i<currentReservation.Instances.length; i++)
			{
				var currentInstance = currentReservation.Instances[i];
		   
				if (currentInstance.State.Name === "running"){
					awsHost = currentInstance.PublicDnsName;		
					canBreak = true;
					break;
				}
			}

			if (canBreak === true)
			{
				break;
			}
		}

		console.log("Done looking for public ip!");		  
		console.log("awsHost: " + awsHost);

		return RunCommands(awsHost, params);
	  }).catch(
		  function(err) {
		  console.error(err, err.stack);
		  
		  return codepipeline.putJobFailureResult(params).promise()
	  });
};
