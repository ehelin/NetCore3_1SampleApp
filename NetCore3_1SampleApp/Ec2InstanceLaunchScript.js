var AWS = require('aws-sdk')
var codepipeline = new AWS.CodePipeline()

exports.handler = async (event) => {
    console.log("Starting EC2 creation...");
    
    console.log(JSON.stringify(event, null, 2))
	var jobId = event["CodePipeline.job"].id
	var params = {
		jobId: jobId
	}

    console.log("Load credentials and set region from JSON file");
    AWS.config.update({region: 'us-east-2'});

	var userData = '#!/bin/bash'
					+ 'yum update -y'
					+ 'yum install git -y'
					+ 'amazon-linux-extras install docker -y'
					+ 'service docker start'
					+ 'cd home/ec2-user'
					+ 'git clone https://github.com/ehelin/NetCore3_1SampleApp.git'
					+ 'cd NetCore3_1SampleApp'
					+ 'docker build . -t myawesomerepository'    
	var userDataEncoded = new Buffer(userData).toString('base64');

    console.log("AMI is amzn-ami-2011.09.1.x86_64-ebs");
    var instanceParams = {
       ImageId: 'ami-09558250a3419e7d0',
       InstanceType: 't2.micro',
       KeyName: 'NetCore3_1SampleApp',
       UserData: userDataEncoded,
	   SecurityGroupIds: ['sg-0f2d4961192b272f3'],
       MinCount: 1,
       MaxCount: 1
    };
    
    console.log("Create a promise on an EC2 service object");
    var instancePromise = new AWS.EC2({apiVersion: '2016-11-15'}).runInstances(instanceParams).promise();
    
    console.log("Handle promise's fulfilled/rejected states");
    
    return instancePromise.then(
      function(data) {
    	console.log("inside then");
        console.log(data);
        var instanceId = data.Instances[0].InstanceId;
        console.log("Created instance", instanceId);
			
		return codepipeline.putJobSuccessResult(params).promise()
    }).catch(
        function(err) {
    	console.log("inside error");
        console.error(err, err.stack);
        
		return codepipeline.putJobFailureResult(params).promise()
    });
}
