/**
 * IconLibrary Core module
 *
 * @filename: core.js
 * @version 0.1.5
 *
 * @author Gurtam
 * @copyright 2002-2015 Gurtam
 * @license https://opensource.org/licenses/MIT MIT
 */
( function( root, factory ) {
    'use strict';

    // Set up IC appropriately for the environment. Start with AMD.
    if ( typeof define === 'function' && define.amd ) {
        define([ 'wialon', 'exports' ], function( wialon, exports ) {
            // Export global even in AMD case in case this script is loaded with
            // others that may still expect a global IC.
            root.IC = factory( root, exports, wialon );
        });
        // Next for Node.js or CommonJS.
    } else if ( typeof exports !== 'undefined' ) {
        var
            wialon = require('wialon');
        factory( root, exports, wialon );
    // Finally, as a browser global.
    } else {
        root.IC = factory( root, {}, root.wialon );
    }
}( this, function( root, IC, wialon ) {
    'use strict';

    // Check dependencies
    if ( typeof wialon === 'undefined' ) {
        throw new Error('IconLibrary Core module requires absent dependences.');
    }
    // Extend qooxdoo to some more methods
    // Returns true if object is an Arguments object.
    if ( !qx.lang.Type.isArguments ) {
        qx.lang.Type.isArguments = function( obj ) {
            return Object.prototype.toString.call( obj ) === '[object Arguments]';
        };
    }
    // Does the object contain the given key?
    // Identical to object.hasOwnProperty(key),
    // but uses a safe reference to the hasOwnProperty function
    if ( !qx.lang.Object.has ) {
        qx.lang.Object.has = function( obj, key ) {
            return !!(obj != null && Object.prototype.hasOwnProperty.call( obj, key ));
        };
    }
    // Fill in undefined properties in object
    // with the first value present in the following list of defaults objects.
    if ( !qx.lang.Object.defaults ) {
        qx.lang.Object.defaults = function( obj ) {
            if ( !qx.lang.Type.isObject( obj ) ) {
                return obj;
            }
            var
                i = 1,
                length = arguments.length;
            for ( ; i < length; i++ ) {
                var
                    source = arguments[ i ];
                for ( var prop in source ) {
                    if ( obj[ prop ] === void 0) {
                        obj[ prop ] = source[ prop ];
                    }
                }
            }
            return obj;
        };
    }
    // Flattens a nested array (the nesting can be to any depth).
    // If you pass shallow, the array will only be flattened a single level.
    if ( !qx.lang.Array.flatten ) {
        var
            // Internal implementation of a recursive flatten function,
            // forked from underscore.js
            flatten = function( input, shallow, strict, output ) {
                if ( shallow && input.every( qx.lang.Type.isArray ) ) {
                    return input.concat( output );
                }
                var
                    i = 0,
                    length = input.length;
                for ( ; i < length; i++ ) {
                    var
                        v = input[i];
                    if ( !qx.lang.Type.isArray( v ) && !qx.lang.Type.isArguments( v ) ) {
                        if ( !strict ) {
                            output.push( v );
                        }
                    } else if ( shallow ) {
                        output.push( v );
                    } else {
                        flatten( v, shallow, strict, output );
                    }
                }
                return output;
            };
        qx.lang.Array.flatten = function( obj, shallow ) {
            return flatten( obj, shallow, 0, [] );
        };
    }
    // Looks through the list and returns the first value
    // that matches all of the key-value pairs listed in properties.
    // If no match is found, or if list is empty, undefined will be returned.
    if ( !qx.lang.Array.findWhere ) {
        qx.lang.Array.findWhere = function( obj, values ) {
            if ( !qx.lang.Type.isArray( obj ) ) {
                return undefined;
            }
            var
                keys = Object.keys( values ),
                match = undefined;
            qx.lang.Function.forEach( obj, function( v ) {
                if ( !qx.lang.Type.isObject( v ) ) {
                    return true;
                }
                var
                    m = true;
                qx.lang.Function.forEach( keys, function( k ) {
                    if ( !qx.lang.Object.has( v, k ) || v[ k ] !== values[ k ] ) {
                        m = false;
                        return false;
                    }
                } );
                if ( m ) {
                    match = v;
                    return false;
                }
            } );
            return match;
        };
    }
    // If the value of the named property is a function
    // then invoke it with the object as context; otherwise, return it.
    if ( !qx.lang.Function.result ) {
        qx.lang.Function.result = function( obj, property ) {
            if ( obj == null ) {
                return void 0;
            }
            var
                value = obj[ property ];
            return qx.lang.Type.isFunction( value ) ? value() : value;
        };
    }
    [ 'forEach', 'map' ].forEach( function( v ) {
        if ( qx.lang.Function[ v ] ) {
            return true;
        }
        qx.lang.Function[ v ] = function( obj, callback, ctx ) {
            // Check if callback function is defined
            if ( !callback ||
                 !qx.lang.Type.isFunction( callback ) ||
                 !( qx.lang.Type.isObject( obj ) || qx.lang.Type.isArray( obj ) ) ) {
                    return false;
            }
            // Bind context if necessary
            if ( qx.lang.Type.isObject( ctx ) ) {
                callback = qx.lang.Function.bind( callback, ctx );
            }
            var
                isObject_ = qx.lang.Type.isObject( obj ),
                arr_ = ( qx.lang.Type.isObject( obj ) ) ? Object.keys( obj ) : obj;
            arr_[ v ]( function( v, k ) {
                if ( isObject_ ) {
                    k = v;
                }
                callback( obj[ k ], k, obj );
            });
        };
    } );
    var
        /**
         * Previous value of the "IC" variable, so that it can be
         * restored later on, if "noConflict" is used.
         *
         * @private
         * @const
         * @type {Object}
         */
        previousIC = root.IC,
        /**
         * Necessary to create unique ID's
         *
         * @private
         * @type {Number}
         */
        idCounter = 0,
        /**
         * Main wialon host Url
         *
         * @private
         * @const
         * @type {String}
         */
        WIALON_BASE_URL_ = 'https://hst-api.wialon.com',
        /**
         * Initial dataFlags for session
         *
         * @private
         * @const
         * @type {Number}
         */
        WIALON_SESSION_INIT_FLAGS_ = null,
        /**
         * Wialon storage mode
         * (1 - public, 2 - protected)
         *
         * @public
         * @const
         * @type {Number}
         */
        WIALON_STORAGE_MODE_ = 1,
        /**
         * Wialon storage path to icons
         * (0 - rewrite, 1 - append, 2 - don't write if exists)
         *
         * @public
         * @const
         * @type {String}
         */
        WIALON_STORAGE_TYPE_ = 0,
        /**
         * Wialon storage path to icons
         *
         * @public
         * @const
         * @type {String}
         */
        WIALON_STORAGE_PATH_ = 'library/',
        /**
         * File upload timeout (in secs)
         *
         * @public
         * @const
         * @type {Number}
         */
        WIALON_STORAGE_TIMEOUT_ = 300,
        WIALON_APP_DNS_ = 'gapp_icon_library',
        /**
         * Information about the module, printed to the console
         *
         * @private
         * @const
         * @type {String}
         */
        INFO_ = ''+
        '**************************************************************************'+
        '\n\n'+
        'Welcome to IconLibrary Core module'+
        '\n\n'+
        'Usage:'+
        '\n'+
        '  IconLibrary = IC.noConflict();'+
        '\n'+
        '  Core = IconLibrary.Core.extend({'+
        '\n'+
        '    defaults: {'+
        '\n'+
        '      [KEY]: [VALUE],'+
        '\n'+
        '      ..............,'+
        '\n'+
        '      [KEY]: [VALUE]'+
        '\n'+
        '    },'+
        '\n'+
        '    initialize: function()'+
        '\n'+
        '      [YOUR LOGIC HERE]'+
        '\n'+
        '    },'+
        '\n'+
        '    [ANOTHER METHODS HERE]'+
        '\n'+
        '  });'+
        '\n'+
        '  core = new Core();'+
        '\n\n'+
        'Methods:'+
        '\n'+
        '  initialize   - Initialize module'+
        '\n'+
        '  getId        - ID of current instance'+
        '\n'+
        '  login        - Login to wialon server'+
        '\n'+
        '  logout       - Logout from wialon server'+
        '\n\n'+
        '--------------------------------------------------------------------------'+
        '\n\n'+
        'Apps - WEB applications, developed on the basis of SDK for Wialon Hosting.'+
        '\n\n'+
        'http://apps.wialon.com'+
        '\n\n'+
        'Copyright:'+
        '\n'+
        '  2002-2015 Gurtam, http://gurtam.com'+
        '\n\n'+
        'License:'+
        '\n'+
        '  MIT: https://opensource.org/licenses/MIT'+
        '\n\n'+
        'Authors:'+
        '\n'+
        '  * Gurtam'+
        '\n\n'+
        '**************************************************************************';
    console.info( INFO_ );
    /**
     * Current version of the library
     *
     * @public
     * @const
     * @type {String}
     */
    IC.VERSION = '1.0.0';
    /**
     * Store Wialon.JS into object
     *
     * @public
     * @const
     * @type {Object}
     */
    IC.w = wialon;
    /**
     * Waiting time limit (in secs)
     *
     * @public
     * @const
     * @type {Number}
     */
    IC.WAIT_LIMIT_ = 20000;
    /**
     * Event handlers
     *
     * @public
     * @type {Object}
     */
    IC.HANDLERS = {};
    /**
     * Returning the "IC" variable to its previous owner
     *
     * @public
     * @method
     * @return {Object} a reference to this "IC" object
     */
    IC.noConflict = function() {
        root.IC = previousIC;
        return this;
    };
    /**
     * Throw an error with the provided message
     * (or with the Wialon error text for the provided code)
     *
     * @public
     * @method
     */
    IC.throw = function( code, message ) {
        throw new Error( IC.w.util.String.sprintf( '[IconLibrary] %s(%d)', (
            message ?
            message :
            IC.w.core.Errors.getErrorText( code )
        ), code) );
    };
    var
        /**
         * Helper function to correctly set up the prototype chain, for subclasses.
         *
         * Similar to `goog.inherits`, but uses a hash of prototype properties and
         * class properties to be extended.
         * @private
         * @type {Function}
         */
        extend_ = function extend_( protoProps, staticProps ) {
            var
                parent = this,
                IconLibrary;

            // The constructor function for the new subclass is either defined by you
            // (the "constructor" property in your `extend` definition), or defaulted
            // by us to simply call the parent's constructor.
            if ( protoProps && qx.lang.Object.has( protoProps, 'constructor' ) ) {
                IconLibrary = protoProps.constructor;
            } else {
                IconLibrary = function() {
                    return parent.apply( this, arguments );
                };
            }
            // Add static properties to the constructor function, if supplied.
            qx.lang.Object.mergeWith( IconLibrary, parent );
            qx.lang.Object.mergeWith( IconLibrary, staticProps );
            var
                // Set the prototype chain to inherit from `parent`, without calling
                // `parent`'s constructor function.
                Surrogate = function() {
                    this.constructor = IconLibrary;
                };
            Surrogate.prototype = parent.prototype;
            IconLibrary.prototype = new Surrogate;
            // Add prototype properties (instance properties) to the subclass,
            // if supplied.
            if ( protoProps ) {
                qx.lang.Object.mergeWith( IconLibrary.prototype, protoProps );
            }
            // Set a convenience property in case the parent's prototype is needed
            // later.
            IconLibrary.__super__ = parent.prototype;
            return IconLibrary;
        },
        /**
         * IconLibrary Core constructor
         *
         * @constructor
         */
        Core = IC.Core = function( attrs ) {
            if ( !(this instanceof Core) ) {
                // Prevent situations when call constructor without "new" keyword
                console.warn('IconLibrary warning: IconLibrary Core module must be initialised with the "new" keyword.');
                return new Core(attrs);
            }
            attrs || ( attrs = {} );
            this.name = 'IconLibrary Core';
            // Set private attributes
            this.private = {
                // Generate unique id
                __id: this.__uniqueId(),
                // Save session for future manipulations
                __session: IC.w.core.Session.getInstance()
            };
            this.public = {};
            // Set defaults
            attrs = qx.lang.Object.defaults( {}, attrs, qx.lang.Function.result( this, 'defaults' ) );
            qx.lang.Function.forEach( attrs, function( v, k ) {
                this.public[ k ] = v;
            }, this );
            // Call initialize method (need to override)
            this.initialize.apply( this, arguments );
        };
    /**
     * Initialize core
     *
     * @chainable
     * @public
     * @method
     */
    Core.prototype.initialize = function() {
        return this;
    };
    /**
     * ID of current instance
     *
     * @public
     * @method
     * @return {String}
     */
    Core.prototype.getId = function() {
        return this.private.__id;
    };
    /**
     * Login to wialon server
     *
     * @chainable
     * @public
     * @method
     */
    Core.prototype.login = function( params, callback ) {
        // Initialize session
        this.__initSession();
        // Check if params is absent
        if ( qx.lang.Type.isFunction( params ) ) {
            callback = params;
            params = null;
        }
        callback = IC.w.util.Helper.wrapCallback( callback );
        var
            // Wialon user name
            user_ = qx.lang.Object.has( params, 'user' ) ? params.user : '',
            // Wialon password
            password_ = qx.lang.Object.has( params, 'password' ) ? params.password : '',
            // Wialon session id
            sid_ = qx.lang.Object.has( params, 'sid' ) ? params.sid : null,
            // Wialon auth_token
            token_ = qx.lang.Object.has( params, 'token' ) ? params.token : null,
            // Wialon session auth_hash
            authHash_ = qx.lang.Object.has( params, 'authHash' ) ? params.authHash : null,
            // Operate as current user
            operateAs_ = user_,
            // Continue current session
            continueSession_ = true,
            // Login callback
            loginCallback_ = qx.lang.Function.bind( this.__afterLogin, this, callback, params.lang || 'en' );
        // Check, if user already logging
        if ( this.private.__session.getCurrUser() ) {
            loginCallback_();
        // Try to logging
        } else if ( token_ ) {
            // Login using token
            this.private.__session.loginToken( token_, loginCallback_ );
        } else if ( authHash_ ) {
            // Login using authHash
            this.private.__session.loginAuthHash( authHash_, loginCallback_ );
        } else if ( sid_ ) {
            // Continue current session
            this.private.__session.duplicate( sid_, operateAs_, continueSession_, loginCallback_ );
        } else {
            // Create new session
            this.private.__session.login( user_, password_, operateAs_, loginCallback_ );
        }
        return this;
    };
    /**
     * Logout from wialon server
     *
     * @public
     * @method
     * @return text
     */
    Core.prototype.logout = function() {
        this.private.__session.logout();
    };
    /**
     * Create unique ID
     *
     * @chainable
     * @private
     * @method
     */
    Core.prototype.__uniqueId = function( prefix ) {
        var
            // Unique ID
            id = ++idCounter +'';
        return ( prefix ? prefix+'_' : 'IC_' ) + id;
    };
    /**
     * Init wialon session
     *
     * @chainable
     * @private
     * @method
     */
    Core.prototype.__initSession = function() {
        // Check, if session is initialized
        if ( this.private.__session.isInitialized() ) {
            return this;
        }
        var
            baseURL_ = this.public.WIALON_BASE_URL || WIALON_BASE_URL_,
            SESSION_INIT_FLAGS_ = this.public.WIALON_SESSION_INIT_FLAGS || WIALON_SESSION_INIT_FLAGS_;
        // Initialize session
        this.private.__session.initSession( baseURL_, WIALON_APP_DNS_, SESSION_INIT_FLAGS_ );
        return this;
    };
    /**
     * Login callback function
     *
     * @param {Function} callback function
     * @param {Number} code error code (0 - success)
     * @chainable
     * @private
     * @method
     */
    Core.prototype.__afterLogin = function( callback, lang, code ) {
        if ( code ) {
            IC.throw( code );
            return false;
        }
        qx.Class.include( IC.w.core.Session, IC.w.util.MDataFlagsHelper );
        var
            // Get account ID
            aID_ = this.private.__session.getCurrUser().getAccountId();
        IC.w.core.Remote.getInstance().startBatch('IC.Core.__afterLogin');
        // Add account resource into session
        this.private.__session.updateDataFlags( [ {
            type: 'id',
            data: aID_,
            flags: IC.w.item.Item.dataFlag.base,
            mode: 0
        } ] );
        // Check top service
        IC.w.util.Apps.remoteCheckTopService();
        IC.w.core.Remote.getInstance().finishBatch( qx.lang.Function.bind( function() {
            var
                code = arguments[1].error;
            if ( code ) {
                IC.throw( code, 'This app only works with top accounts.' );
                return false;
            }
            // Store account
            this.private.__account = this.private.__session.getItem( aID_ );
            if ( !this.private.__account ) {
                // Fall back to the current user if the account is not available
                this.private.__account = this.private.__session.getCurrUser();
            }
            // Store user access
            this.private.__access = this.private.__account.getUserAccess();
            // Call callback function
            this.__getFiles( callback );
            // Load necessary libraries
            this.private.__session.loadLibrary('itemIcon');
            this.private.__session.loadLibrary('resourceZones');
            // Get items
            this.private.__items = {};
            qx.lang.Function.forEach( this.public.WIALON_DATA_FLAGS, function( s ) {
                // Update session
                this.private.__session.updateDataFlags( [ s ], qx.lang.Function.bind( function( type, code ) {
                    var
                        type_ = 'poi';
                    switch ( type ) {
                        case 'avl_unit':
                            type_ = 'unit';
                            break;
                        case 'avl_unit_group':
                            type_ = 'group';
                            break;
                    }
                    // Update items store
                    this.private.__items[ type_ ] = code ? [] : this.private.__session.getItems( type ).sort( function( a, b ) {
                        a = a.getName().toString().toLowerCase();
                        b = b.getName().toString().toLowerCase();
                        if ( a > b ) {
                            return 1;
                        }
                        if ( a < b ) {
                            return -1;
                        }
                        return 0;
                    } );
                    // Fire event
                    this.private.__session.fireEvent('ICloaded');
                }, this, s.data ) );
            }, this );
        }, this ), 'IC.Core.__afterLogin' );
        return this;
    };
    /**
     * Add event listener to necessary el
     * (can be fired once or discont.)
     *
     * @param {DOM} DOM element
     * @param {String} event
     * @param {Function} handler function
     * @param {Boolean} capture
     * @chainable
     * @public
     * @method
     */
    qx.lang.Function.forEach( [ 'addEvent', 'addEventOnce' ], function( v ) {
        Core.prototype[ v ] = function( el, event, handler, ctx, capture ) {
            if ( !qx.dom.Node.isElement( el ) ) {
                IC.throw(4);
                return false;
            }
            // Check current el in HANDLERS
            if ( !( el in IC.HANDLERS ) ) {
                // Stores references to el
                IC.HANDLERS[ el ] = {};
            }
            // Check events
            if ( !( event in IC.HANDLERS[ el ] ) ) {
                // Store each events type
                IC.HANDLERS[ el ][ event ] = [];
            }
            // Check method name
            var
                handler_ = ( v === 'addEvent' ) ? qx.lang.Function.bind( handler, ctx ) : qx.lang.Function.bind( function( e ) {
                    // Remove event listener
                    this.removeEvents( el, event, handler, capture );
                    // Call original handler
                    return qx.lang.Function.bind( handler, ctx)( e );
                }, this );
            // Capture reference
            IC.HANDLERS[ el ][ event ].push( [ handler_, capture ] );
            // Add event listener
            el.addEventListener( event, handler_, capture );
            return this;
        };
    } );
    /**
     * Remove event listener from necessary el
     *
     * @param {DOM} DOM element
     * @param {?String} event
     * @chainable
     * @public
     * @method
     */
    Core.prototype.removeEvents = function( el, event, handler, capture ) {
        if ( !qx.dom.Node.isElement( el ) ) {
            IC.throw(4);
            return false;
        }
        if ( el in IC.HANDLERS ) {
            var
                // Get all events for this el
                handlers_ = IC.HANDLERS[ el ];
            // Check if will need to remove events from only special event
            if ( event ) {
                handlers_ = new Array( ( event in handlers_ ) ? handlers_[ event ] : null );
            }
            if ( handler ) {
                if ( qx.lang.Object.has( handlers_, handler ) ) {
                    handlers_ = handlers_[ handler ];
                } else {
                    // handler wasn't found
                    handlers_ = [];
                }
            }
            // Unbind all events
            qx.lang.Function.forEach( handlers_, function( e, n ) {
                for ( var i_ = e.length; i_--; ) {
                    var
                        handler_ = e[ i_ ];
                    el.removeEventListener( n, handler_[0], handler_[1] );
                }
                // Remove this event from HANDLERS
                delete IC.HANDLERS[ el ][ n ];
            } );
            // Check if there are some events
            if ( !IC.HANDLERS[ el ].length ) {
                // Delete this el from HANDLERS
                delete IC.HANDLERS[ el ];
            }
        }
        return this;
    };
    // Class helper functions from bonzo https://github.com/ded/bonzo
    // classList support for class management
    var
        hasClass, addClass, removeClass;
    if ( 'classList' in document.documentElement ) {
        hasClass = function( el, c ) {
            return el.classList.contains( c );
        };
        addClass = function( el, c ) {
            el.classList.add( c );
        };
        removeClass = function( el, c ) {
            el.classList.remove( c );
        };
    } else {
        var classReg = function( className ) {
            return new RegExp('(^|\\s+)'+ className +'(\\s+|$)');
        };
        hasClass = function( el, c ) {
            return classReg(c).test( el.className );
        };
        addClass = function( el, c ) {
            if ( !hasClass( el, c ) ) {
                el.className = el.className +' '+ c;
            }
        };
        removeClass = function( el, c ) {
            el.className = el.className.replace( classReg( c ), ' ' );
        };
    }
    Core.prototype.hasClass = hasClass;
    Core.prototype.addClass = function( el, c ) {
        if ( qx.dom.Node.isElement( el ) ) {
            addClass( el, c );
        }
    };
    Core.prototype.removeClass = function( el, c ) {
        if ( qx.dom.Node.isElement( el ) ) {
            removeClass( el, c );
        }
    };
    Core.prototype.toggleClass = function( el, c ) {
        if ( qx.dom.Node.isElement( el ) ) {
            var
                fn = this.hasClass( el, c ) ? this.removeClass : this.addClass;
            fn( el, c );
        }
    };
    /**
     * Set full path to icon
     *
     * @param {String} file name
     * @param {Function} callback function
     * @public
     * @method
     * @return {String}
     */
    Core.prototype.setPath = function( partially ) {
        // Check if provided partially path
        if ( !partially ) {
            IC.throw(4);
            return false;
        }
        var
            // Create result path
            path_ = WIALON_STORAGE_PATH_ + partially;
        // Return path
        return path_;
    };
    /**
     * Get full path to file
     *
     * @param {String} file name
     * @param {Function} callback function
     * @public
     * @method
     * @return {String}
     */
    Core.prototype.filePath = function( partially ) {
        // Check if provided partially path
        if ( !partially ) {
            IC.throw(4);
            return false;
        }
        var
            // Create result path
            path_ = WIALON_STORAGE_PATH_ + partially;
        path_ = this.private.__account.fileGet( WIALON_STORAGE_MODE_, path_ );
        // Return path
        return path_;
    };
    /**
     * Upload file to resource
     *
     * @param {DOM} DOM element
     * @param {Function} callback function
     * @chainable
     * @public
     * @method
     */
    Core.prototype.fileUpload = function( target, comparator, callback, e ) {
        // Wrap callback
        callback = IC.w.util.Helper.wrapCallback( callback );
        var
            el_ = e.currentTarget;
        // Check if provided el is a DOM element & there are files
        if ( !qx.dom.Node.isElement( el_ ) || !el_.files.length ) {
            return callback();
        }
        // Check, if target is defined
        if ( !qx.lang.Type.isString( target ) ) {
            IC.throw(4);
            return false;
        }
        var
            // match filter function
            filter_ = function() {
                return true;
            };
        // Check, if comparator is defined
        if ( qx.lang.Type.isFunction( comparator ) ) {
            // Get files regarding comparator function
            filter_ = comparator;
        }
        // Check if el is satisfied conditions
        if ( !filter_( el_ ) ) {
            IC.throw(4);
            return false;
        }
        var
            // Create result path
            path_ = [ WIALON_STORAGE_PATH_, target, '/' ].join('');

        // replace invalid characters in filename to use in url later
        var replaceInvalidUrlChars = function (str) {
            var regexp = /['/?:*"+=%><|&%#{}\\]+/gi;
            return str.replace(regexp, '_');
        };

        if(el_.files && el_.files.length) {
            var list = new DataTransfer();

            for(var i = 0; i < el_.files.length; i++) {
                var file = el_.files[i];

                if(file) {
                    var blob = file.slice(0, file.size, 'image/png');

                    var str = file.name.replace('C:\\fakepath\\', '');
                    var newPath = replaceInvalidUrlChars(str);

                    var newFile = new File([blob], newPath, {type: 'image/png'});

                    list.items.add(newFile);
                }
            }
            el_.files = list.files;
        }

        // Get files
        this.private.__account.filePut(
            WIALON_STORAGE_MODE_,
            path_,
            el_,
            WIALON_STORAGE_TYPE_,
            WIALON_STORAGE_TIMEOUT_,
            qx.lang.Function.bind( function( code, data ) {
                // Check if there are error
                if ( code ) {
                    IC.throw( code );
                    return false;
                }
                // Call callback after loading list of files
                this.__getFiles( callback );
            }, this )
        );
        return this;
    };
    /**
     * Remove file from server
     *
     * @param {String} file name
     * @param {Function} callback function
     * @public
     * @method
     * @return {String}
     */
    Core.prototype.fileRemove = function( partially, callback ) {
        // Check if provided partially path
        if ( !partially ) {
            IC.throw(4);
            return false;
        }
        var
            // Create result path
            path_ = WIALON_STORAGE_PATH_ + partially;
        // Wrap callback
        callback = IC.w.util.Helper.wrapCallback( callback );
        // Get files
        this.private.__account.fileRm(
            WIALON_STORAGE_MODE_,
            path_,
            qx.lang.Function.bind( function( code, data ) {
                // Check if there are error
                if ( code ) {
                    IC.throw( code );
                    return false;
                }
                // Call callback after loading list of files
                this.__getFiles( callback );
            }, this )
        );
        // Return path
        return path_;
    };
    /**
     * Get requested files list
     *
     * @param {String} Driver code
     * @param {Array} timestamp interval
     * @param {Function} comparator function,
     * if not defined, try to use timestamp interval
     * @public
     * @method
     * @return {Array}
     */
    Core.prototype.fileList = function( target, comparator ) {
        if ( !this.public.files ) {
            IC.throw(7);
            return false;
        }
        // Check if target is absent
        if ( !target || qx.lang.Type.isFunction( target ) ) {
            comparator = target;
            target = [ 'unit', 'group', 'poi' ];
        } else {
            target = qx.lang.Array.flatten( [ target ] );
        }
        var
            // match filter function
            filter_ = function( f ) {
                return f;
            },
            result_ = {};
        qx.lang.Function.forEach( target, function( i ) {
            var
                // list of files
                list_ = qx.lang.Object.clone( this.public.files[ i ], true );
            if ( typeof list_.error !== 'undefined' ) {
                return;
            }

            list_.reduce( function( a, b ) {
                return a.concat( b );
            }, [] );
            list_ = qx.lang.Array.unique( qx.lang.Array.flatten( list_ ) );
            if ( qx.lang.Type.isFunction( comparator ) ) {
                // Get files regarding comparator function
                filter_ = comparator;
            }
            list_ = list_.filter( filter_ );
            result_[ i ] = list_;
        }, this );
        // Check, if we want to get only a single target
        if ( target.length === 1 ) {
            return result_[ target[0] ];
        }
        return result_;
    };
    Core.prototype.__sortArrayBy = function( property, items ) {
        return items.slice(0).sort(function(a,b) {
            var a = a[property].toLowerCase(),
                b = b[property].toLowerCase();
            return (a > b) ? 1 : (a < b) ? -1 : 0;
        } );
    };
    /**
     * Get all available files
     *
     * @param {Function} callback function
     * @chainable
     * @private
     * @method
     */
    Core.prototype.__getFiles = function( callback ) {
        // Empty previous file list
        this.public.files = {
            unit: [],
            group: [],
            poi: []
        };
        // Wrap callback
        callback = IC.w.util.Helper.wrapCallback( callback );
        // Get files
        IC.w.core.Remote.getInstance().startBatch('IC.Core.__getFiles');
        qx.lang.Function.forEach( [ 'unit', 'group', 'poi' ], function( i ) {
            var
                // Create result path
                path_ = [ WIALON_STORAGE_PATH_, i, '/' ].join('');
            this.private.__account.fileList(
                WIALON_STORAGE_MODE_,
                path_,
                '*', 0, 0,
                qx.lang.Function.bind( function( code, data ) {
                    // Check if data is present
                    if ( !qx.lang.Object.isEmpty( data ) ) {
                        this.public.files[ i ] = data;
                    }
                }, this )
            );
        }, this );
        IC.w.core.Remote.getInstance().finishBatch( qx.lang.Function.bind( function() {
            // Call callback
            callback( this.public.files );
        }, this ) , 'IC.Core.__getFiles');
        return this;
    };
    // Set up inheritance for the core.
    Core.extend = extend_;
    // Return "IC" object
    return IC;
} ) );
