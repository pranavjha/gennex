var https = require("https"), // https.request
querystring = require("querystring"); // querystring.stringify

module.exports = function(app) {

    return function(request, response) {
        // summary:
        //      We authenticate the assertion sent back from persona here. To do this, we POST the 
        //      assertion to https://verifier.login.persona.org/verify with two parameters:
        //      - assertion: The identity assertion provided by the user.
        //      - audience: The hostname and port of this website. This is a hardcoded value
        //  request:
        //      the http request object
        //  response:
        //      the http response object

        // send assertion
        var vreq = https.request({
            host : "verifier.login.persona.org",
            path : "/verify",
            method : "POST"
        }, function(vres) {
            var body = "";
            vres.on('data', function(chunk) {
                // get the response
                body += chunk;
            }).on('end', function() {
                try {
                    var verifierResp = JSON.parse(body);
                    if (verifierResp && verifierResp.status === "okay") {
                        // only if the response status is 'okay', the login is valid.
                        console.log("assertion verified successfully: ", verifierResp);
                        response.json(verifierResp);
                    } else {
                        // in case of an invalid login, send an error to the server with the reason
                        console.log("failed to verify assertion:", verifierResp.reason);
                        response.send(verifierResp.reason, 403);
                    }
                } catch (e) {
                    // an exception will be thrown when the response is not a JSON object. we throw 
                    // an error here.
                    console.log("non-JSON response from verifier");
                    response.send("bogus response from verifier!", 403);

                }
            });
        });
        // set the request header
        vreq.setHeader('Content-Type', 'application/x-www-form-urlencoded');
        var data = querystring.stringify({
            // the assertion received in the request
            assertion : request.body.assertion,
            // The audience must match what browser's address bar shows, including protocol, 
            // hostname and port
            audience : app.get('serverhost') + ':' + app.get('serverport')
        });
        vreq.setHeader('Content-Length', data.length);
        vreq.write(data);
        vreq.end();
        console.log('trying to validate logged in user...');
    };
};