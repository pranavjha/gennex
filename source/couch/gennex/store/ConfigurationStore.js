define([
    "dojo/_base/declare", // declare
    /*===== "dojo/store/api/Store", // extends =====*/
    "dojo/Deferred", // new Deferred
    "dojo/request", // request
    "dojo/promise/all", // all
    "dojo/when", // when
    "dojo/_base/lang", // lang.mixin
    "dojo/has", // has('config-isDebug')   
    "../behavioral/messages" // messages.fatal
], function(declare, /*=====Store, =====*/Deferred, request, all, when, lang, has, messages) {
    // for purposes of documentation, the dojo/store/api/Store is also a base class for this store

    // module:
    //		gennex/store/ConfigurationStore
    var ConfigurationStore = declare([
    /*=====Store, =====*/
    ], {
        // summary:
        //		A ConfigurationStore is a dojo Data store class for all the configurations in the 
        //		application. Configurations include screen presentation, User settings and other 
        //		configurations. This store is context sensitive and depends on the user accessing 
        //		the application.

        //	type: [public readonly] String
        //		the name of this class
        type : "../store/ConfigurationStore",

        //	idProperty: [public] String
        //		This indicates the property to use as the identity property. The values of this 
        //		property should be unique.
        idProperty : "_storeId",

        //	dbName: [public] String
        //		The name of the indexedDB database to use
        dbName : 'configuration',

        //	storeName: [public] String
        //		The name of the indexedDB database store to use
        storeName : 'screen',

        //	_ready: dojo/promise/Promise
        //		The promise object that gets resolved when the database is ready for transactions.
        //		All reads and updates must happen when this promise is resolved. We resolve it when
        //		the database open succeeds.
        _ready : null,

        constructor : function(options) {
            //	summary:
            //		In the constructor function, we try to open the current version of the 
            //		indexedDB configuration database. If a database upgrade is needed, the 
            //		_createStore function is called which creates a new store in the database 
            //		deleting the previous one if it exists. Finally, on success, the indexedDB and 
            //      the couchDb databases are synchronized and _ready promise is resolved with the 
            //      database as the resolved value.
            //	options:
            //		{ dbName: String }? { storeName: String }?
            //		An optional configuration object to configure this Store. The option object 
            //		can have some or none of the below options:
            //		- dbName: the optional name of the indexedDB database. If none is specified the 
            //		name 'configuration' is used.
            //		- storeName: the optional name of the indexedDB database store. If none is 
            //		specified the name 'screen' is used.
            // 	tags:
            //		public
            
            // mixin options with this object
            lang.mixin(this, options);
            var _readyDeferred = new Deferred();
            // try opening the database
            var request = indexedDB.open(this.dbName);
            // append error handler
            request.onerror = function(event) {
                messages.fatal(event.target.error, "indexed db open error");
            };
            // append success handler
            request.onsuccess = lang.hitch(this, function(event) {
                console.debug('indexedDB opened successfully... synchronizing now.');
                // synchronize the indexedDB and the couchDB
                when(this.synchronize(event.target.result), function(syncResult) {
                    console.debug('indexedDB synchronized successfully.');
                    // upon successful synchronization, resolve the _ready promise
                    _readyDeferred.resolve(event.target.result);
                }, function(err) {
                    messages.error(err, "Database could not be synchronized. You might be working"
                        + " with an older version.!");
                });
            });
            // upgrade the database
            request.onupgradeneeded = lang.hitch(this, '_createStore');
            // set the this._ready promise
            this._ready = _readyDeferred.promise;
        },

        _createStore : function(event) {
            //	summary:
            //		This function creates the database store. It is attached to the onupgradeneeded 
            //		callback and is called when a database upgrade is needed. Here we do the 
            //		following:
            //		- delete the original store if it exists
            //		- create a new object store with keyPath as the idProperty
            //	event: DOMEvent
            //		The browser event object
            // 	tags:
            //		private callback
            console.debug('version change detected in indexedDB: checking if store exists...');
            var _database = event.target.result;
            // create the configuration store if it does not exists
            if (!_database.objectStoreNames.contains(this.storeName)) {
                // create a new object store with keyPath as the idProperty
                _database.createObjectStore(this.storeName, {
                    "keyPath" : this.idProperty
                });
                console.debug('store created successfully.');
            } else {
                console.debug('skipped store creation as there already is a store...');
            }
        },

        synchronize : function(_database) {
            //  summary:
            //      This function synchronizes the indexedDB store with the couchDB database 
            // _database: IDBDatabase
            //      This parameter is passed to the function when it is called privately to ensure 
            //      that the put calls do not wait for _ready to get resolved. When the database 
            //      is passed, we use it to start a transaction. Usage of this parameter outside 
            //      the class is deprecated.
            //  tags:
            //      public

            var deferred = new Deferred();

            // we make an array of promises. All put requests push their promises here. The promise 
            // returned by the function should resolve only when all these promises are resolved.
            var promises = [];

            request("/gennex/_design/gennex/_view/configuration", {
                data : {},
                method : "GET",
                handleAs : 'json'
            }).then(lang.hitch(this, function(data) {
                console.debug('synchronizing indexedDB with couchDB... seeding data');
                for ( var i = 0; i < data.total_rows; i++) {
                    promises.push(this.put(data.rows[i].value, _database));
                }
                all(promises).then(function(data) {
                    console.debug('data seeded successfully.');
                    deferred.resolve(data);
                }, function(error) {
                    messages.fatal(error, 'database synchronization failed.');
                });
            }));
            return deferred.promise;
        },

        get : function(id) {
            // summary:
            //		This function retrieves an object by its identity
            // id: String
            //		The identity to use to lookup the object
            // returns: dojo/promise/Promise
            //		A promise that will get resolved by the value retrieved from the Store
            var deferred = new Deferred();
            var _storeName = this.storeName;
            when(this._ready, function(database) {
                // send the request for retrieval to indexedDB
                var request = database.transaction(_storeName, "readonly").objectStore(_storeName)
                    .get(id);
                // reject the deferred on error
                request.onerror = function(event) {
                    messages.fatal(event.target.error, 'Unable to read value from indexedDB');
                    deferred.reject(event);
                };
                // resolve the deferred with the result on success
                request.onsuccess = function(event) {
                    deferred.resolve(event.target.result);
                };
            });
            return deferred.promise;
        },

        getIdentity : function(object) {
            // summary:
            //		This function returns an object's identity (objects idProperty)
            // object: Object
            //		The object to get the identity from
            // returns: String
            //		The id of the object that can be used to uniquely identify it. The same ID is 
            //		used to retrieve the object form this Store.
            return object[this.idProperty];
        },

        put : function(object, _database) {
            // summary:
            //		This function stores an object in this Store and overrides any already existing 
            //		object with the same value for idProperty
            // object: Object
            //      The object to store.
            // _database: IDBDatabase
            //      This parameter is passed to the function when it is called privately to ensure 
            //      that it does not wait for _ready to get resolved. When the database is passed, 
            //      we use it to start a transaction. Usage of this parameter outside the class is 
            //      deprecated.
            // returns: dojo/promise/Promise
            //		A promise that will get resolved when the object is put into the Store
            var deferred = new Deferred();
            var _storeName = this.storeName;
            when((_database || this._ready), function(database) {
                // send the request for putting an object into the indexedDB
                var request = database.transaction(_storeName, "readwrite").objectStore(_storeName)
                    .put(object);
                // reject the deferred on error
                request.onerror = function(event) {
                    messages.fatal(event.target.error, 'Unable to put value to indexedDB');
                    deferred.reject(event);
                };
                // resolve the deferred with the result on success
                request.onsuccess = function(event) {
                    deferred.resolve(event.target.result, true);
                    console.debug('value put to indexed db successfully. ID returned is',
                        event.target.result);
                };
            });
            return deferred.promise;
        },

        add : function(object) {
            // summary:
            //		This function stores an object in this Store, but throws an error if there is 
            //		already existing object with the same value for idProperty
            // object: Object
            //		The object to store.
            // returns: dojo/promise/Promise
            //		A promise that will get resolved when the object is added to the Store
            var deferred = new Deferred();
            var _storeName = this.storeName;
            when(this._ready, lang.hitch(this, function(database) {
                // send the request for adding an object into the indexedDB
                var request = database.transaction(_storeName, "readwrite").objectStore(_storeName)
                    .add(object);
                // reject the deferred on error
                request.onerror = function(event) {
                    messages.fatal(event.target.error, 'Unable to add value to indexedDB');
                    deferred.reject(event);
                };
                // resolve the deferred with the result on success
                request.onsuccess = function(event) {
                    console.debug('value added to indexed db successfully. ID returned is',
                        event.target.result);
                    deferred.resolve(event.target.result);
                };
            }));
            return deferred.promise;
        },

        remove : function(id) {
            // summary:
            //		Deletes an object by its identity
            // id: Number
            //		The identity to use to delete the object
            // returns: dojo/promise/Promise
            //		A promise that will get resolved when the object is removed from the Store
            var deferred = new Deferred();
            var _storeName = this.storeName;
            when(this._ready, lang
                .hitch(this,
                    function(database) {
                        // send the request for deleting an object into the indexedDB
                        // delete as function name screws with closure compiler, so using ['delete']
                        var request = database.transaction(_storeName, "readwrite").objectStore(
                            _storeName)['delete'](id);
                        // reject the deferred on error
                        request.onerror = function(event) {
                            messages.fatal(event.target.error,
                                'Unable to remvoe value from indexedDB');
                            deferred.reject(event);
                        };
                        // resolve the deferred with the result on success
                        request.onsuccess = function(event) {
                            console.debug(
                                'value removed from indexed db successfully. ID returned is',
                                event.target.result);
                            deferred.resolve(event.target.result);
                        };
                    }));
            return deferred.promise;
        }
    });
    return ConfigurationStore;
});
