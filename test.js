var request = require('request');
var fs      = require('fs');

request
	.get('http://www.cnfish.com/sUploadFile/AdminPic/20071213203420855.jpg')
	.on('error', function(err) {
		console.log('\nError: ' + err.message + '\n' + item[1]);
	})
	.pipe(fs
		.createWriteStream(__dirname + '/test.jpg')
		.on('finish', function() {
			this.end()
		}));