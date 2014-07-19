define([
    "dojo/_base/declare", // declare
    "dijit/_WidgetBase", // extends
    "dijit/_TemplatedMixin", // extends
    "dojo/text!./templates/Header.html", // template
    "dojo/topic", // topic.subscribe
    "dojo/_base/lang", // lang.hitch
    "dojo/query", // query
    "dojo/dom-class", // domClass.add, domClass.remove
    "../behavioral/session", // session.create, session.destroy, session.getUser
    "dojo/i18n!./nls/Header" // Header internationalization
], function(declare, _WidgetBase, _TemplatedMixin, template, topic, lang, query,
    domClass, session, i18n) {
    // 	module:
    // 		gennex/common/Header
    var Header = declare([
        _WidgetBase,
        _TemplatedMixin
    ], {
        //	summary:
        //		The header class describes the common screen header

        //	type: [public readonly] String
        //		the name of this class
        type : "../common/Header",

        //	templateString: [private] String
        //		the header template placed at templates/Header.html
        templateString : template,

        //	baseClass: [private] String
        //		the Header base class, this is used by _CssStateMixin 
        //		to create hover and active classes
        baseClass : "gennexHeader",

        //	messages: [private] Object
        //		the i18n localization messages
        messages : i18n,

        postCreate : function() {
            //  summary:
            //      In the postcreate method of the header we subscribe to the gennex/login and 
            //      gennex/logout topics to change the state of the login and the logout buttons. 
            //      We also subscribe to the hashchange event to setup the active link. The current 
            //      session details are shown on the header depending on if there is a logged 
            //      in user present.
            //  tags:
            //      public extension
            this._showSessionDetails(session.getUser());
            this._activateLink(location.hash.replace(/^#/, ''));
            topic.subscribe("/dojo/hashchange", lang.hitch(this, this._activateLink));
            topic.subscribe('gennex/login', lang.hitch(this, '_showSessionDetails'));
            topic.subscribe('gennex/logout', lang.hitch(this, '_showSessionDetails'));
        },

        _activateLink : function(linkId) {
            //	summary:
            //		private function to activate a particular link. Here, we change the background 
            //      of the currently active page and change the window title.
            //	tags:
            //		private callback
            query('li', this.navigation).forEach(function(node, index, nodelist) {
                if (query('a[href="#' + linkId + '"]', node).length) {
                    domClass.add(node, "active");
                } else {
                    domClass.remove(node, "active");
                }
            });
            document.title = this.messages.screen_title + query('a[href="#' + linkId + '"]', this.navigation)[0].innerHTML;
        },

        _showSessionDetails : function(user) {
            //  summary:
            //      This method toggles visibility of login and logout buttons and displays the 
            //      current user details on the screen. It is called whenever the session status 
            //      changes and also on page load.
            //  user: Object
            //      { email : String } ...
            //      The user object is a set of attribute value pairs describing the user. The 
            //      email attribute is used here to show on the screen.
            //  tags:
            //      private callback
            if (user && user.email) {
                this.userDetails.innerHTML = user.email;
                domClass.add(this.loginButton, 'hidden');
                domClass.remove(this.userDetails, 'hidden');
                domClass.remove(this.logoutButton, 'hidden');
            } else {
                this.userDetails.innerHTML = '';
                domClass.remove(this.loginButton, 'hidden');
                domClass.add(this.userDetails, 'hidden');
                domClass.add(this.logoutButton, 'hidden');
            }
        },

        _login : function(event) {
            //  summary:
            //      This method is called when the user clicks the login button on the header 
            //      widget. Here we make a request to persona for logging in the user by calling 
            //      session.create.
            //  event : Event
            //      The DOM event object.
            //  tags:
            //      private callback
            session.create();
            event.preventDefault();
            event.stopPropagation();
        },

        _logout : function(event) {
            //  summary:
            //      This method is called when the user clicks the logout button on the header 
            //      widget. Here we make a request to persona for logging out the user by calling 
            //      session.destroy.
            //  event : Event
            //      The DOM event object.
            //  tags:
            //      private callback
            session.destroy();
            event.preventDefault();
            event.stopPropagation();
        }
    });
    return Header;
});