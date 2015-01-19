'use strict';
var inputFile = 'fall11_urls.txt';
var outDir = 'out';

////////////////////////////////////

var fs = require('fs');
var http = require('http');
var through = require('through');
var split = require('split');
var url = require('url');

//example
// downloadFile('http://i.imgur.com/tYPQKZJ.jpg', 'file1.jpg');

var splitTabs = through(function(buf) {
	var item = buf.toString().split('\t');
	this.queue(item);
});

var downloadStream = through(function(item) {
	if (url.parse(item[1]).protocol === 'http:') {
		console.log('downloadStream ' + item);
		var fileName = item[0] || Date.now() + '.jpg';
		var request = http.get(item[1], function(resp) {
			if (resp.statusCode === 200) {
				console.log("200 for " + fileName);
				var file = fs.createWriteStream(__dirname + '/' + outDir + '/' + fileName + '.jpg')
				resp.pipe(file);
				// this.queue([fileName, resp]);
			} else {
				console.log('status ' + resp.statusCode);
			}
		}).on('error', function(e) {
			console.log("Got error: " + e.message);
		});
	} else {
		console.log('Not http so skipping: ' + item);
	}
}, function() {
	console.log('downloadStream end');
});

var fileWrite = through(function(buf) {
	var file = fs.createWriteStream(__dirname + '/' + outDir + '/' + buf[0] + '.jpg')
	buf[1].pipe(file);
});


// var downloadFile = function(url, fileName) {
// 	var fileName = fileName || Date.now() + '.jpg';
// 	var request = http.get(url, function(resp) {
// 		if (resp.statusCode = 200) {
// 			var file = fs.createWriteStream(__dirname + '/' + outDir + '/' + fileName + '.jpg');
// 			resp.pipe(file);
// 		}
// 	});
// };

var fileStream = fs.createReadStream(__dirname + '/' + inputFile);
fileStream
	.pipe(split())
	.pipe(splitTabs)
	.pipe(downloadStream);