'use strict';
var inputFile = process.argv[2] || 'head100.txt';
var outDir = process.argv[3] || 'out';
var maxParallel = process.argv[4] || 200;

////////////////////////////////////
var startTime = new Date().getTime();
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


var count = 0;
var parallel = 0;

var splitTabs = through(function(buf) {
	var item = buf.toString().split('\t');
	if (item !== '') {
		item.push(count);
	}
	this.queue(item);
	count++;
});

var downloadStream = through(function(item) {
	if (!this.paused && parallel >= maxParallel - 1) {
		fileStream.pause();
		this.pause();
	} else if (this.paused && parallel < maxParallel - 1) {
		this.resume();
		fileStream.resume();
	}
	try {
		var fileName = item[0] || Date.now() + '.jpg';
		parallel++;
		console.log('parallel = ' + parallel);

		var filePath = __dirname + '/' + outDir + '/' + fileName + '.jpg';
		var file = fs.createWriteStream(filePath);
		file.on('finish', function() {
			console.log('#' + item[2] + ' Complete');
			downloads.completed.push(item);
			parallel--;
			console.log('parallel = ' + parallel)
			file.end();
		});

		var options = {
			url: item[1],
			timeout: 10000
		}
		request
			.get(options)
			.on('response', function(resp) {
				console.log('#' + item[2] + ' response: ' + resp.statusCode);
			})
			.on('error', function(err) {
				console.log('#' + item[2] + ' Request error:', err);
			})
			.pipe(file);

	} catch (error) {
		console.log(item, ' Got error: ' + error.message);
		downloads.failed.push({
			'item': item,
			'error': error
		});
	}
}, function(err) {
	console.log('---------------------------------');
	console.log('Completed ' + downloads.completed.length + ' of ' + count + ' downloads');
	console.log('with ' + downloads.failed.length + ' failures.');
	var endTime = new Date().getTime();
	console.log('Took ' + (endTime - startTime) + 'ms');
	console.log('---------------------------------');
});

var fileStream = fs.createReadStream(__dirname + '/' + inputFile);
fileStream
	.pipe(split()) // Split file into rows
	.pipe(splitTabs) // Split each row into a array items
	.pipe(downloadStream); // Download each item