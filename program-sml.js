'use strict';
var fs = require('fs'),
    request = require('request'),
    through = require('through'),
    split = require('split'),
    log = require('loglevel');
// var urlList = 'https://raw.githubusercontent.com/phelma/bulk-downloader/master/head100.txt';
// var urlList = 'https://raw.githubusercontent.com/phelma/bulk-downloader/master/head1k.txt';
// var urlList = 'https://raw.githubusercontent.com/phelma/bulk-downloader/master/head10k.txt';
var urlList = 'https://raw.githubusercontent.com/phelma/bulk-downloader/master/head100k.txt';

log.setLevel('error');

var totalRequests  = process.argv[2] || 100000,
    requestLimit   = process.argv[3] || 6,
    activeRequests = 0,
    httpTimeout    = 10; // seconds

var line = 0;

var splitByTab = through(function(buf) {
    if (line ++ >= totalRequests) {
        this.push(null);
    } else {
    var item = buf.toString().split('\t');
    this.push(item);
    }
});

var downloads = {
    total: 0,
    success: 0,
    error: [],
    startTime: new Date().getTime(),
    endTime: 0,
    duration: function(){
        return (this.endTime - this.startTime) + 'ms';
    }
}

var downloadStream = through(function(item) {
    try {
        // item is array [ filename , URL ]
        log.info(activeRequests + ' active requests');
        if (item[1]) {
            if (activeRequests++ >= requestLimit) {
                splitByTab.pause();
                this.pause();
            }
            downloads.total++;
            log.info('Requesting ' + item[1]);
            request
                .get({
                    url: item[1],
                    timeout: httpTimeout * 1000
                })
                .on('error', function(err) {
                    log.warn("Error: " + err.message);
                    log.error(downloads.error.push(item) + '\t' + item[0] + '\t' + item[1]);
                    if (--activeRequests < requestLimit) {
                        this.resume();
                        splitByTab.resume();
                    }
                })
                .on('response', function(response) {
                    log.info('Sucess: ' + item[0] + '.jpg' + ' <= ' + item[1]);
                    downloads.success++;
                    if (--activeRequests < requestLimit) {
                        this.resume();
                        splitByTab.resume();
                    }
                })
                .pipe(fs.createWriteStream(__dirname + '/out/' + item[0] + '.jpg'));
        }
    } catch (e){
        console.log(e);
    }
});

request
    .get(urlList) // Request the
    .pipe(split()) // Split file into rows
    .pipe(splitByTab) // Split each row into a array items
    .pipe(downloadStream); // Download each item
