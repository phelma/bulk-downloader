'use strict';

var fs = require('fs'),
    request = require('request'),
    through = require('through'),
    split = require('split'),
    log = require('loglevel'),

    urlList = 'https://raw.githubusercontent.com/phelma/bulk-downloader/master/head100k.txt',

    totalRequests  = process.argv[2] || 100000,
    requestLimit   = process.argv[3] || 5,
    activeRequests = 0,
    httpTimeout    = 10, // seconds

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
        if (line ++ >= totalRequests) {
                this.push(null);
            } else {
                var item = buf.toString().split('\t');
                item[0] += Math.floor(Math.random() * (16^4)).toString(16);
                this.push(item);
            }
    });

var downloadStream = through(function(item) {          // item is array [ filename , URL ]
    try {
        setTimeout( function(){  // let the thread sleep

            log.info(activeRequests + ' active requests');
            // ++++++++ pause and resume downloadStream
            var pause = function() {
                splitByTab.pause();
                downloadStream.pause();
            }
            var resume = function(){
                if ( activeRequests < requestLimit ) {
                    splitByTab.resume();
                    downloadStream.resume();
                }
            }
            if ( activeRequests++ > requestLimit ) {
                pause();
            }
            // ++++++++ END pause and resume downloadStream

            // ++++++++ Filestream writes to disk
            var file = fs.createWriteStream(__dirname + '/out/' + item[0] + '.jpg');
            // This event fires when there will be no more data to read.
            file.on('end', function() {
                log.info("**** File EOF");
                file.end();
            });
            // Emitted when the underlying resource (for example, the backing file descriptor) has been closed.
            // Not all streams will emit this.
            file.on('close', function() {
                log.info("**** File CLOSE");
                downloads.success++;
                file.end();
            });
            // Emitted if there was an error receiving data.
            file.on('error', function(err) {
                log.info("**** File ERROR:" + err);
                file.end();
            });
            // When the end() method has been called, and all data has been flushed to the underlying system, this event is emitted.
            file.on('finish', function() {
                log.info('**** File Sucess: ' + item[0] + '.jpg' + ' <= ' + item[1]);
                downloads.success++;
                file.end();
            })
            // ++++++++ END Filestream writes to disk

            // ++++++++ REQUEST URL Download Stream
            if (item[1]) {
                downloads.total++;
                log.info('**** URL Requesting ' + item[1]);
                request
                .get({
                    url: item[1],
                    timeout: httpTimeout * 1000,
                    agent: false,
                    connection: "keep-alive"
                })
                .on('error', function(err) {
                    log.warn('**** URL Error ' + err.toString());
                    log.error('****  \\> ' + downloads.error.push(item) + '\t' + item[0] + '\t' + item[1]);
                    activeRequests--;
                    resume();
                })
                .on('response', function(response) {
                    response.pipe(file);
                    activeRequests--;
                    resume();
                });
            }
            // ++++++++ END URL Download Stream

        }.apply(this,item), 300);

    } catch (e){
        console.log(e);
    }
});


// ++++++  StreamSpy for debugging
// https://www.npmjs.com/package/stream_spy

var StreamSpy   = require('stream_spy'),
streamSpy   = new StreamSpy(downloadStream);

// +++++++ END StreamSpy for debugging

// +++++++ Let's do some piping

log.setLevel('info');

request
.get(urlList) // Request the file
.pipe(split()) // Split file into rows
.pipe(splitByTab) // Split each row into a array items
.pipe(downloadStream); // Download each item

// ++++++++ END Piping
