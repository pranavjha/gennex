// the routers main file is the default module for routers. Here, we add HTTP listeners to the 
// application and redirect the logic to specific modules for request and response handling
module.exports = function(app) {
    // enable authentication service
    console.log('binding POST to /authenticate...');
    app.post('/authenticate', require('./authenticate')(app));
    // enable data seeding service
    console.log('binding POST to /seed...');
    app.get('/seed', require('./seed')(app));
};