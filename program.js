'use strict';
var inputFile = process.argv[2] || 'head1k.txt';
var outDir = process.argv[3] || 'out';

////////////////////////////////////

var fs = require('fs');
var http = require('http');
var through = require('through');
var split = require('split');
var url = require('url');

//example
// downloadFile('http://i.imgur.com/tYPQKZJ.jpg', 'file1.jpg');

var count = 0;
var paralell = 0;
var maxParalell = 100;

var splitTabs = through(function(buf) {
	var item = buf.toString().split('\t');
	item.push(count);
	this.queue(item);
	count ++;
});

var downloadStream = through(function(item) {
	if (!this.paused && paralell >= maxParalell) {
		this.pause();
	} else if (this.paused && paralell < maxParalell) {
		this.resume();
	}
	try {
		if (url.parse(item[1]).protocol === 'http:') {
			var fileName = item[0] || Date.now() + '.jpg';
			paralell ++;
			console.log('paralell = ' + paralell);
			var request = http.get(item[1], function(resp) {
				if (resp.statusCode === 200) {
					console.log(item[2] + " got 200 for " + item[1]);
					var filePath = __dirname + '/' + outDir + '/' + fileName + '.jpg';
					var file = fs.createWriteStream(filePath);
					resp.pipe(file);
					file.on('end', function(){
						console.log(item[2] + '--DONE--');
						file.end();
					});
					paralell --;
				} else {
					console.log(item[2] + ' got status ' + resp.statusCode);
					paralell --;
				}
			}).on('error', function(e) {
				console.log(item[2] + " Got error: " + e.message);
				paralell --;
			});
		} else {
			console.log(item[2] + ' Not http so skipping: ' + item);
		}
	} catch (e) {
		console.log(item[2] + ' Got error: ' + e.message);
	}
}, function() {
	console.log('downloadStream end');
});

// var fileWrite = through(function(buf) {
// 	var file = fs.createWriteStream(__dirname + '/' + outDir + '/' + buf[0] + '.jpg')
// 	buf[1].pipe(file);
// });


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