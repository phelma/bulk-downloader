'use strict';

var fs = require('fs'),
    request = require('request'),
    through = require('through'),
    split = require('split'),
    log = require('loglevel'),
    exec = require('child_process').exec,
    util = require('util'),
    url = require('url'),

    urlList = 'https://raw.githubusercontent.com/phelma/bulk-downloader/master/head100k.txt',

    totalRequests = process.argv[2] || 100000,
    requestLimit = process.argv[3] || 25,
    activeRequests = 0,
    httpTimeout = 10, // seconds

    line = 0,

    downloads = {
        total: 0,
        success: 0,
        error: [],
        startTime: new Date().getTime(),
        endTime: 0,
        duration: function() {
            return (this.endTime - this.startTime) + 'ms';
        }
    },

    splitByTab = through(function(buf) {
        if (line++ >= totalRequests) {
            this.push(null);
        } else {
            var item = buf.toString().split('\t');
            item[0] += Math.floor(Math.random() * (16 ^ 4)).toString(16);
            this.push(item);
        }
    });

var downloadStream = through(function(item) { // item is array [ filename , URL ]
    try {
        log.info(activeRequests + ' active requests');
        // ++++++++ pause and resume downloadStream
        var pause = function() {
            splitByTab.pause();
            downloadStream.pause();
        }
        var resume = function() {
            if (activeRequests < requestLimit -1) {
                splitByTab.resume();
                downloadStream.resume();
            }
        }
        if (activeRequests > requestLimit) {
            pause();
        }
        // ++++++++ END pause and resume downloadStream


        // Function to download file using wget
        var download_file_wget = function(item) {

            // compose the wget command

            var filename = __dirname + '/out/' + item[0] + '.jpg';

            // options --limit-rate=200k --wait-random
            var wget = 'wget ' + item[1] + ' -q -O ' + filename + ' --user-agent="Cyberdog/2.0 (Macintosh; 68k)" ' +
                       ' -nv --timeout=2 --tries=1 --read-timeout=0.5'

            console.log(" ************* " + wget);
            // excute wget using child_process' exec function

            var child = exec(wget, function(err, stdout, stderr) {
                if (err) {
                    downloads.error.push(code + "," + signal);
                    exec("rm -f " + filename);
                } else {
                    activeRequests--;
                    downloads.success++;
                    resume();
                }
            });

        }

        activeRequests++;
        download_file_wget(item);

    } catch (e) {
        console.log(e);
    }
});


// ++++++  StreamSpy for debugging
// https://www.npmjs.com/package/stream_spy

var StreamSpy = require('stream_spy'),
    streamSpy = new StreamSpy(downloadStream);

// +++++++ END StreamSpy for debugging

// +++++++ Let's do some piping

log.setLevel('info');

request
    .get(urlList) // Request the file
    .pipe(split()) // Split file into rows
    .pipe(splitByTab) // Split each row into a array items
    .pipe(downloadStream); // Download each item

// ++++++++ END Piping