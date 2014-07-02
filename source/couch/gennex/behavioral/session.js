define([
    "exports", // exports
    "dojo/request", // request
    "dojo/topic", // topic.publish
    "dojo/cookie" // cookie
], function(exports, request, topic, cookie) {
    // 	module:
    // 		gennex/behavioral/session

    // summary:
    //		This module defines the session APIs for gennex application. This includes apis for 
    //		logging in and out of the application and getting the current session details. 
    //		Internally, the session handling mechanism uses the [mozilla persona] 
    //		{https://developer.mozilla.org/en-US/Persona} api.

    // get the user details from cookie if they exist.
    var _cookie = cookie('_gennex_user_');
    var _email = (!_cookie ? null : JSON.parse(_cookie).email);

    // For Persona to function, you need to tell it what to do when a user logs in or out. This is 
    // done by calling the navigator.id.watch() function and supplying three parameters:
    // - The email address of the user currently logged into your site from this computer, or null 
    // if no one is logged in. For example, you might examine the browser's cookies to determine 
    // who is signed in.
    // - A function to invoke when an onlogin action is triggered. This function is passed a single 
    // parameter, an 'identity assertion', which must be verified.
    // - A function to invoke when an onlogout action is triggered. This function is not passed any 
    // parameters.
    navigator.id.watch({

        //  loggedInUser: String
        //      The email address of the user currently logged in. (received from cookie)
        loggedInUser : _email,

        onlogin : function(assertion) {
            //	summary:
            //		This function will be invoked when an login action is triggered. Here we 
            //      validate the 'identity assertion' sent to this function by posting it to the 
            //      /node/authenticate link. If the assertion is valid, login is assumed to be 
            //      successful and the topic 'gennex/login' is published with the results of the 
            //      validation.
            //  assertion: String
            //      A long encoded string used to validate the login
            request("/node/authenticate", {
                data : {
                    'assertion' : assertion
                },
                method : "POST",
                handleAs : 'json'
            }).then(function(data) {
                // if the validation is successful, log the suer in and set the cookie.
                cookie('_gennex_user_', JSON.stringify(data), {
                    expires : new Date(parseInt(data.expires)).toUTCString()
                });
                topic.publish('gennex/login', data);
            }, function(err) {
                // if the validation failed, call navigator.id.logout
                navigator.id.logout();
            });

        },

        onlogout : function() {
            //  summary:
            //      This function will be invoked when an logout action is triggered. Here we clear 
            //      the cookie and log the user out of the system.
            cookie('_gennex_user_', '');
            topic.publish('gennex/logout');
        }
    });

    exports.create = function() {
        //  summary:
        //      This function will be invoked when a session has to be created. Here, we request 
        //      the navigator to create a session using persona.
        navigator.id.request();
    };

    exports.destroy = function() {
        //  summary:
        //      This function will be invoked when a session has to be destroyed. Here, we request 
        //      the navigator to logout the current logged in user.
        navigator.id.logout();
    };

    exports.getUser = function() {
        //  summary:
        //      This function will return the currently logged in user form the session or null, if 
        //      there is no user currently signed in.
        //  returns: Object
        //      { email : String } { audience : String } { expires : String } { issuer : String }
        //      An object describing the details of the currently logged in user. The object will 
        //      have the below properties:
        //      - email: The address contained in the assertion, for the intended person being 
        //      logged in.
        //      - audience: The audience value contained in the assertion. Expected to be this 
        //      website URL.
        //      - expires: The date the assertion expires, expressed as the primitive value of a 
        //      Date object: that is, the number of milliseconds since midnight 01 January, 1970 
        //      UTC.
        //      - issuer: The hostname of the identity provider that issued the assertion.
        var _cookie = cookie('_gennex_user_');
        return (!_cookie ? null : JSON.parse(_cookie));
    };
});