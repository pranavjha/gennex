define([
    "dojo/dom-construct", // domConstruct.create
    "dojo/_base/window", //win.body()
    "dojo/has", // has('config-isDebug')
    "../widgets/Dialog", // Dialog.alert();
    "exports" //exports
], function(domConstruct, win, has, Dialog, exports) {
    //  module:
    //      gennex/behavioral/messages
    exports.fatal = exports.error = function(exception, message) {
        //  summary:
        //      The fatal function is called in case of an un-recoverable error. calling this 
        //      function will freeze the screen and force the user to reload or close the 
        //      application
        //  exception: Object
        //      The exception that caused the error
        //  message: String
        //      The message to be shown to the user
        try {
            if (has('config-isDebug')) {
                // log the error to the console if debug is enabled
                console.error.apply(console, arguments);
            }
            // create the error dialog
            Dialog.fatal({
                dialogHeading : message,
                body : JSON.stringify(exception)
            });
        } catch (e) {
            // this function should not throw any exceptions
        }
    };

});