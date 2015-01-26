'use strict';
var urlList              = process.argv[2] || 'https://gist.githubusercontent.com/phelma/e1558aeb181c0cfe47b8/raw/cc5e667277308fda408f6af1404bc2d322b5186c/images.txt';
var outDir               = process.argv[3] || 'out';
var maxParallelDownloads = process.argv[4] || 200;

var fs      = require('fs'),
    request = require('request'),
    through = require('through'),
    split   = require('split');
    stream  = require('stream');

var splitByTab = through(function(buf) {
    var item = buf.toString().split('\t');
    this.queue(item);
});

var downloadStream = new Stream;
downloadStream.writable = true;
downloadStream.bytes = 0;

downloadStream.write = function(buf){
    downloadStream.bytes += buf.length;
}

downloadStream.end = function(buf){
    if (buf.length) {

    }
}

// var downloadStream = through(function(item) {
// // item is array [ filename , URL ]
//     var fileName = item[0] + '.jpg';
//     var filePath = __dirname + '/' + outDir + '/' + fileName + '.jpg';
//     var file = fs.createWriteStream(filePath);
//     file.on('finish', function() {
//         console.log(item[0] + ' Complete');
//         file.end();
//     });

//     request
//         .get(item[1])
//         .on('error', function(err) {
//             console.log(err);
//         })
//         .pipe(file);
// });

request
    .get(urlList)
    .pipe(split()) // Split file into rows
    .pipe(splitByTab) // Split each row into a array items
    .pipe(downloadStream); // Download each item