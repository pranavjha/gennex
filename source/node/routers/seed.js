var http = require("http"), // https.request
fs = require('fs'), // fs.createReadStream
querystring = require("querystring"); // querystring.stringify

module.exports = function(app) {

    return function(request, response) {
        // summary:
        //      The seed module, seeds the default data documents into the couchDB database. Here, 
        //      we loop through all the JSON files in the seed folder and add them into couchDB 
        //      as documents.
        //  request:
        //      the http request object
        //  response:
        //      the http response object

        //  filesPending : Number
        //      The number of files that are yet to be seeded. We send response to the server when 
        //      all files have been seeded to couch successfully or when this value is 0.
        var filesPending = 0;

        //  _respJSON : Object
        //      The couchDB response to all the document requests sent. This is returned as a 
        //      server response from node.
        var _respJSON = {};

        // make the file list by reading the seed directory .json files
        fs.readdir('./seed/', function(err, files) {
            if (err) {
                // file read error
                throw err;
            }
            files.forEach(function(file) {
                // only if the file is a .json file, seed it into couchDB.
                if (/\.json$/.test(file)) {
                    // increase the pending files count
                    filesPending++;
                    console.log('seeding : ', file, '...');
                    // send a PUT request to couchDB
                    var vreq = http.request({
                        port : app.get('serverport'),
                        path : ('/gennex/' + file.match(/^.*?([^\/]*)\.json$/)[1]),
                        method : 'PUT'
                    }, function(vres) {
                        var body = "";
                        vres.on('data', function(chunk) {
                            // get the response
                            body += chunk;
                        }).on('end', function() {
                            // add the response to the _respJSON object
                            try {
                                console.log(file, 'seeding complete...');
                                var verifierResp = JSON.parse(body);
                            } catch (e) {
                                console.log(file, 'seeding error...');
                                verifierResp = body;
                            }
                            _respJSON[file] = verifierResp;
                            filesPending--;
                            if (filesPending === 0) {
                                // once no file is left to upload, call the callback function
                                console.log('all files seeded.');
                                response.json(_respJSON);
                            }
                        });
                    });
                    // send the file to seed
                    fs.createReadStream('./seed/' + file).pipe(vreq);
                }
            });
        });
    };
};