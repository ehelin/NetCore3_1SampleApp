# NetCore3_1SampleApp
A .NET Core 3.1 C# Sample Application used in exploring moving The Globe In My BucketList Application (TGIMBA) to the cloud.

## Related Projects/Items

These items are also related to this project. 

Blog Post(s):
<ul>
	<li><a href="https://erichelin.wordpress.com/2020/10/05/tgimba-going-aws-native-part-1-simple-net-core-3-1-app-running-in-aws-cloud/">Part 1 - Simple .NET Core 3.1 Application in cloud</a></li>
	<li><a href="https://erichelin.wordpress.com/2020/10/22/tgimba-going-aws-native-part-2-dockerfied-simple-net-core-3-1-app-running-in-aws-cloud/">Part 2 – ‘Dockerfied’ Simple .NET Core 3.1 App Running in AWS Cloud</a></li>
	<li><a href="https://erichelin.wordpress.com/2020/12/13/tgimba-going-aws-native-part-2-dockerfied-simple-net-core-3-1-app-running-in-aws-cloud-2/">Part 3 – Updated DockFile w/Code Pipeline</a></li>
	<li><a href="https://erichelin.wordpress.com/2021/02/08/tgimba-going-aws-native-part-4-code-pipeline-talking-directly-to-ec2-instance-2/">Part 4 – Running SSH commands in a Lambda</a></li>
</ul>

## How To Use
Download the zip file, open up in Visual Studio, clean, restore packages, build and run.

### Docker
1) Download or clone repo
2) From command line at root of project where Dockerfile is `docker build . -t local/NetCore3_1SampleApp`
3) From command line docker run -it -p 80:80 local/NetCore3_1SampleApp
4) Open browser to http://localhost:80
