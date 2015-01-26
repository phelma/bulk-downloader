'use strict';
var inputFile = process.argv[2] || 'head1k.txt';
var outDir = process.argv[3] || 'out';
var maxParalell = process.argv[4] || 10;

////////////////////////////////////
var fs = require('fs');
var http = require('http');
var request = require('request');
var through = require('through');
var split = require('split');
var url = require('url');
var downloads = {
	completed: [],
	failed: []
};

//example
// downloadFile('http://i.imgur.com/tYPQKZJ.jpg', 'file1.jpg');

var count = 0;
var paralell = 0;

var splitTabs = through(function(buf) {
	var item = buf.toString().split('\t');
	item.push(count);
	this.queue(item);
	count++;
});

var downloadStream = through(function(item) {
	if (!this.paused && paralell >= maxParalell - 1) {
		this.pause();
	} else if (this.paused && paralell < maxParalell) {
		this.resume();
	}
	try {
		var fileName = item[0] || Date.now() + '.jpg';
		paralell++;
		console.log('paralell = ' + paralell);

		var filePath = __dirname + '/' + outDir + '/' + fileName + '.jpg';
		var file = fs.createWriteStream(filePath);
		file.on('finish', function() {
			console.log('#' + item[2] + ' Complete');
			downloads.completed.push(item);
			paralell--;
			file.end();
		});

		request
			.get(item[1])
			.on('response', function(resp) {
				console.log('#' + item[2] + ' response: ' + resp.statusCode);
			})
			.on('error', function(err) {
				console.log('#' + item[2] + ' Request error:', err);
			})
			.pipe(file);
	} catch (error) {
		console.log('#' + item[2] + ' Got error: ' + error.message);
		downloads.failed.push({
			'item': item,
			'error': error
		});
	}
}, function() {
	console.log('downloadStream end');
	console.log('---------------------------------');
	console.log('Completed ' + downloads.completed.length + ' of ' + count + ' downloads');
	console.log('with ' + downloads.failed.length + ' failures.');
	console.log('---------------------------------');
});

var fileStream = fs.createReadStream(__dirname + '/' + inputFile);
fileStream
	.pipe(split()) // Split file into rows
	.pipe(splitTabs) // Split each row into a array items
	.pipe(downloadStream); // Download each item