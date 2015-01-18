var inputFile = 'head.txt';
var outDir = 'out';

////////////////////////////////////

var fs = require('fs');
var http = require('http');
var through = require('through');
var split = require('split');

var downloadFile = function(url, fileName) {
	console.log('downloadFile got: ' + url + ' ' + fileName);
	var fileName = fileName || Date.now() + '.jpg';
	var request = http.get(url, function(resp) {
		console.log('status: ' + resp.statusCode);
		if (resp.statusCode = 200) {
			console.log('out to: ' + __dirname + '/' + outDir + '/' + fileName)
			var file = fs.createWriteStream(__dirname + '/' + outDir + '/' + fileName + '.jpg');
			console.log('pipe to file');
			resp.pipe(file);
		}
	});
};

//example
// downloadFile('http://i.imgur.com/tYPQKZJ.jpg', 'file1.jpg');

var fileStream = fs.createReadStream(__dirname + '/' + inputFile);
fileStream
	.pipe(split())
	.pipe(through(function(buf) {
		var line = buf.toString();
		if (line) {
			console.log('got line: ' + line);
			console.log('gonna download ' + line.split('\t')[1] + ' ' + line.split('\t')[0]);
			this.queue(
				downloadFile(line.split('\t')[1], line.split('\t')[0])
			);
		}
	}));