// this file is the main file which is used to create the node server. to deploy the geNNex node 
// app, run node app.js from this directory

// add express capabilities to the server
var express = require('express');
// create the app
var app = express();

// we set the application specific variables here so that they can be shared across the routers
console.log('setting global parameters...');
app.set('serverhost', 'http://127.0.0.1');
app.set('serverport', 5984);

app.configure(function() {
    // parse the request body so that request.body can be used
    console.log('adding body parser...');
    app.use(express.bodyParser());

    // use the router. Note that if you don't explicitly use the router, it is implicitly added by 
    // Express at the point you define a route (which is why your routes still worked even though 
    // you commented out app.use(app.router)).
    console.log('adding router...');
    app.use(app.router);
});

// bind the routers to the application here
console.log('binding routers...');
require('./routers')(app);

// listen to port 3000
app.listen(3000);
console.log('node is now listening to port 3000');
