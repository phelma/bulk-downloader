'use strict';
var fs      = require('fs'),
    request = require('request'),
    through = require('through'),
    split   = require('split'),
    urlList = 'https://gist.githubusercontent.com/phelma/e1558aeb181c0cfe47b8/raw/cc5e667277308fda408f6af1404bc2d322b5186c/images.txt';

var splitByTab = through(function(buf) {
    var item = buf.toString().split('\t');
    this.queue(item);
});

var downloadStream = through(function(item) {
    // item is array [ filename , URL ]
    if (item[1]) {
        console.log('Requesting ' + item[1]);
        request
            .get(item[1])
            .on('error', function(err) {
                console.log('\nError: ' + err.message + '\n' + item[1]);
            })
            .pipe(fs.createWriteStream(__dirname + '/out/' + item[0] + '.jpg'));
    }
});

request
    .get(urlList) // Request the
    .pipe(split()) // Split file into rows
    .pipe(splitByTab) // Split each row into a array items
    .pipe(downloadStream); // Download each item