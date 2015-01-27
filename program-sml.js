'use strict';
var fs = require('fs'),
    request = require('request'),
    through = require('through'),
    split = require('split');
// var urlList = 'https://raw.githubusercontent.com/phelma/bulk-downloader/master/head100.txt';
var urlList = 'https://raw.githubusercontent.com/phelma/bulk-downloader/master/head1k.txt';
// var urlList = 'https://raw.githubusercontent.com/phelma/bulk-downloader/master/head10k.txt';
// var urlList = 'https://raw.githubusercontent.com/phelma/bulk-downloader/master/head100k.txt';

var requestLimit = 100,
    activeRequests = 0;

var splitByTab = through(function(buf) {
    var item = buf.toString().split('\t');
    this.push(item);
});

var downloadStream = through(function(item) {
    // item is array [ filename , URL ]
    console.log(activeRequests + ' active requests');
    if (item[1]) {
        if (activeRequests++ >= requestLimit) {
            splitByTab.pause();
            this.pause();
        }
        console.log('Requesting ' + item[1]);
        request
            .get({
                url: item[1],
                timeout: 10000
            })
            .on('error', function(err) {
                console.log('\nError: ' + err.message + '\n' + item[1]);
                if (--activeRequests < requestLimit) {
                    this.resume();
                    splitByTab.resume();
                }
            })
            .on('response', function(response) {
                if (--activeRequests < requestLimit) {
                    this.resume();
                    splitByTab.resume();
                }
            })
            .pipe(fs.createWriteStream(__dirname + '/out/' + item[0] + '.jpg'));
    }
});

request
    .get(urlList) // Request the
    .pipe(split()) // Split file into rows
    .pipe(splitByTab) // Split each row into a array items
    .pipe(downloadStream); // Download each item