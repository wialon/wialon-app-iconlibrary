/**
 * IconLibrary Application module
 *
 * @filename: app.js
 * @version 0.4.6
 *
 * @author Gurtam
 * @copyright 2002-2016 Gurtam
 * @license https://opensource.org/licenses/MIT MIT
 */
( function( root, factory ) {
     'use strict';
     if ( typeof define === 'function' && define.amd ) {
         define([
             'core',
             'underscore',
             'nprogress',
             'jquery',
             'modal',
             'clusterize'
         ], function( IC, _, NProgress, jQuery, a, Clusterize) {
             // Export global even in AMD case in case this script is loaded with
             // others that may still expect a global IC.
             factory( root, IC, _, NProgress, jQuery, Clusterize);
         });
     }else{
         // Finally, as a browser global.
         factory( root, root.IC, root._, root.NProgress, root.jQuery, root.Clusterize );
     }
}( this, function( root, IC, _, NProgress, $, Clusterize ) {
    'use strict';

    // Check dependencies
    if (typeof IC === 'undefined' ||
        typeof _ === 'undefined' ||
        typeof $ === 'undefined' ||
        typeof $.fn.modal === 'undefined' ||
        typeof NProgress === 'undefined') {
            throw new Error('IconLibrary Application module requires absent dependences.');
    }
    var
        /**
         * List of available languages
         *
         * @private
         * @const
         * @type {Array}
         */
        LANG_LIST_ = window.availableLanguages || [ 'en' ],
        ICON_SIZE_LITTLE_ = 24,
        ICON_SIZE_MEDIUM_ = 32,
        ICON_SIZE_BIGGER_ = 256,
        /**
         * List of supported file types
         *
         * @private
         * @const
         * @type {Array}
         */
        FILE_TYPES_ = [ 'jpg', 'jpeg', 'gif', 'png', 'svg' ],
        /**
         * Default table options
         *
         * @private
         * @const
         * @type {Object}
         */
        TABLE_OPTIONS_ = {
            sScrollY: '400px',
            oScroller: {
                rowHeight: 36
            },
            bAutoWidth: false, // don't calculate auto width, we set it in aoColumns
            aaData: [],
            aaSorting: [ [0, 'asc'] ], // initial sort
            aaSortingFixed: [],
            oLanguage: {},
            bSort: true,
            aoColumns: [],
            sDom: 'tS',
            bDeferRender: true
        },
        /**
         * Link to documentation
         *
         * @private
         * @const
         * @type {String}
         */
        DOC_LINK_ = '/docs/%s/iconlibrary.html',
        /**
         * Default throttling interval (milliseconds)
         * for frequent event like window.resize & etc.
         *
         * @private
         * @const
         * @type {Number}
         */
        THROTTLING_INTERVAL_ = 500,
        /**
         * Minimal height of viewport
         *
         * @private
         * @const
         * @type {Number}
         */
        MINIMAL_VIEWPORT_HEIGHT_ = 250;
    /**
     * Store Underscore.JS into object
     *
     * @public
     * @const
     * @type {Object}
     */
    IC._ = _;
    // Set up underscore templates
    IC._.templateSettings = {
        interpolate: /\{\{(.+?)\}\}/g,
        evaluate: /\[\%(.+?)\%\]/g
    };
    /**
     * Store jQuery into object
     *
     * @public
     * @const
     * @type {Object}
     */
    IC.$ = IC.$ || $;
    /**
     * Store NProgress into object
     *
     * @public
     * @const
     * @type {Object}
     */
    IC.Bar = NProgress;
    // Set up NProgress
    IC.Bar.configure({
        showSpinner: 0,
        template: '<div class="bar" role="bar"></div>'
    });
    var
        /**
         * IconLibrary Application constructor
         *
         * @constructor
         */
        App = IC.App = function( attrs ) {
            if ( !this instanceof App ) {
                // Prevent situations when call constructor without "new" word
                return new App( attrs );
            }
            attrs || ( attrs = {} );
            this.name = 'IconLibrary Application';
            // Set private attributes
            this.private = {};
            // Set public attributes
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
     * Initialize application
     *
     * @chainable
     * @public
     * @method
     */
    App.prototype.initialize = function() {
        var
            $el = IC.$( this.el || '#iconlibrary' );
        if ( !$el.length ) {
            IC.throw( 4, 'Provided incorrent DOM element' );
            return this;
        }
        // Show progress bar
        IC.Bar.start();
        // Cache root DOM element
        this.public.$el = $el;
        // Quick finder DOM element into root
        this.public.$ = qx.lang.Function.bind( function( selecter ) {
            return IC.$( selecter, this.public.$el );
        }, this );
        // Cache templates
        this.public.tmpls = {
            _app: document.getElementById('app-tpl').innerHTML,
            _throw: document.getElementById('throw-tpl').innerHTML,
            _assign: document.getElementById('assign-tpl').innerHTML,
            _similar: document.getElementById('similar-tpl').innerHTML
        };
        // Rewrite native core "throw" method
        IC.throw = this.__throw.bind( this );
        // Call all necessary things on initialize
        this.__initialize( qx.lang.Function.bind( function() {
            // Check view files flag
            if ( !this.private.__core.private.__access & IC.w.item.Item.accessFlag.viewFile ) {
                IC.throw(7);
                return this;
            }
            // Render template
            this.public.$el[0].innerHTML = this.__tmpl( this.public.tmpls._app, {
                DOC_LINK_: IC.w.util.String.sprintf( DOC_LINK_, this.private.__lc )
            } );

            if ( APP_CONFIG.alias ) {
                var title = decodeURIComponent(APP_CONFIG.alias || "Icon Library");
                $(".app-name").html(title);
                $(".app-logo").attr( 'alt', title );
                document.title = title;
            }
            // Cache buttons
            this.public.buttons = {
                unit: document.getElementById('source').querySelector('.btn-units'),
                group: document.getElementById('source').querySelector('.btn-groups'),
                poi: document.getElementById('source').querySelector('.btn-pois')
            };
            // Cache mainarea
            this.private.__$el = this.public.$('#mainarea');
            // Store flag delete / update files
            this.private.__canEdit = this.private.__core.private.__access & IC.w.item.Item.accessFlag.editFile;
            if ( !this.private.__canEdit ) {
                this.public.$('.btn-add-file').addClass('disabled');
            }
            // Items storage
            this.private.__target = 'unit';
            // Items storage
            this.private.__items = {};
            this.private.__filtredItems = null;
            // Selected
            this.private.__selected = {};
            // Update library
            this.__updateLibrary( function() {
                // Hide progress bar
                IC.Bar.done();
            } );
            // Bind events listeners
            this.__bindEvents();
        }, this));
        return this;
    };
    /**
     * Make all necessary things on initialize
     *
     * @param {Function} callback function
     * @private
     * @method
     */
    App.prototype.__initialize = function( callback ) {
        // Check location.origin
        if ( !root.location.origin ) {
            root.location.origin = root.location.protocol +'//'+ root.location.hostname + ( root.location.port ? ':'+ root.location.port : '');
        }
        this.private.__host = root.location.origin + root.location.pathname;
        // Load language and then try to login
        this.__loadLang( qx.lang.Function.bind( this.__login, this, callback ) );
        return this;
    };
    /**
     * Render text with necessary data
     *
     * @private
     * @method
     * @return {String} rendered HTML
     */
    App.prototype.__tmpl = function( text, data ) {
        var
            result_ = _.template( text );
        return result_( _.extend( {
            host: this.private.__host,
            __: qx.lang.Function.bind( this.__, this )
        }, data ) ).replace(/\s\s+/g, '');
    };
    /**
     * Get parameter data from URL
     *
     * @param {String} key string
     * @private
     * @method
     * @return {Number|String|Object}
     */
     App.prototype.__getURLParam = function( name, def ) {
         name = name.replace( /[\[]/, '\\\[' ).replace( /[\]]/, '\\\]' );
         var
             regexS_ = '[\\?&]'+ name +'=([^&#]*)',
             regex_ = new RegExp( regexS_ ),
             loc_ = root.location.href,
             results_;
         if ( loc_.slice(-1) === '/' ) {
             loc_ = loc_.slice( 0, loc_.length - 1 );
         }
         results_ = regex_.exec( loc_ );
         if ( results_ === null ) {
             return def || '';
         }
         return results_[1] && decodeURIComponent( results_[1].replace( /\+/g, ' ' ) );
     };
    /**
     * Error handler
     *
     * @param {Number} error code
     * @param {String|Null} error message
     * @chainable
     * @private
     * @method
     */
    App.prototype.__throw = function( code, message ) {
        // Hide progress bar
        IC.Bar.done();
        // Hide previous modal
        if ( this.private.__modal ) {
            this.private.__modal.modal('hide');
        }
        var
            // Generate data
            data_ = {
                code: this.__('Error') +' '+ code,
                message: this.__( message ? message : IC.w.core.Errors.getErrorText( code ) )
            },
            // Render template
            tmpl_ = this.__tmpl( this.public.tmpls._throw, data_ ),
            modal_ = this.private.__modal = IC.$( tmpl_ );

        modal_
            // Show throw modal
            .modal()
            // Remove it on hide
            .on('hidden.bs.modal', function() {
                modal_.remove();
            });
        return this;
    };
    /**
     * Login to Wialon Server
     *
     * @param {Function} callback function
     * @chainable
     * @private
     * @method
     */
    App.prototype.__login = function( callback ) {
        var
            // Login params
            params_ = {},
            // Defaults to initialize Core module
            defaults_ = {
                lang: this.private.__lc
            },
            // Base Wialon URL
            baseURL_ = this.__getURLParam('baseUrl',"https://hst-api.wialon.com") || this.__getURLParam('hostUrl',"http://hosting.wialon.com");
        // Set UpdateDataFlags
        defaults_.WIALON_DATA_FLAGS = [ {
            type: 'type',
            data: 'avl_unit',
            flags: IC.w.item.Item.dataFlag.base | IC.w.item.Item.dataFlag.image,
            mode: 0
        }, {
            type: 'type',
            data: 'avl_unit_group',
            flags: IC.w.item.Item.dataFlag.base | IC.w.item.Item.dataFlag.image,
            mode: 0
        }, {
            type: 'type',
            data: 'avl_resource',
            flags: IC.w.item.Item.dataFlag.base | IC.w.item.Resource.dataFlag.zones,
            mode: 0
        } ];
        // Set Wialon URL
        defaults_.WIALON_BASE_URL = baseURL_;
        // Try to get login parameters from URL
        qx.lang.Function.forEach( [ 'token', 'authHash', 'sid', 'user' ], function( k ) {
            var
                value_ = this.__getURLParam( k );
            if ( value_ ) {
                params_[ k ] = value_;
            }
        }, this );
        var
            Core = qx.lang.Object.isEmpty( defaults_ ) ? IC.Core : IC.Core.extend( { defaults: defaults_ } );
        // Store Core instance
        this.private.__core = new Core();
        this.private.__core.login( params_, callback );
        return this;
    };
    /**
     * Load requested language
     *
     * @param {Function} callback function
     * @chainable
     * @private
     * @method
     */
    App.prototype.__loadLang = function( callback ) {
        callback = IC.w.util.Helper.wrapCallback( callback );
        var
            // Get lang code from URL
            lang_ = this.__getURLParam('lang','en'),
            load_ = function( lang ) {
                IC.$.ajax( {
                    dataType: 'json',
                    url: './i18n/'+ lang +'.json',
                    success: success_,
                    error: error_
                } );
            },
            error_ = function() {
                console.warn('Can\'t load "%s" language', this.private.__lc);
                // Try to load default language
                if ( this.private.__lc !== LANG_LIST_[0] ) {
                    load_(LANG_LIST_[0]);
                }
            },
            success_ = function( T ) {
                this.private.__i18n = T;
                TABLE_OPTIONS_.oLanguage.sEmptyTable = this.__('No data.');
                // Wrap callback
                callback();
            };
        // Save context
        load_ = qx.lang.Function.bind( load_, this );
        success_ = qx.lang.Function.bind( success_, this );
        error_ = qx.lang.Function.bind( error_, this );
        // Save lang code (by default, first language from list)
        this.private.__lc = ( !window.availableLanguages || (lang_ && qx.lang.Object.contains( LANG_LIST_, lang_ )) ) ? lang_ : LANG_LIST_[0];
        // Try to load requested language
        load_( this.private.__lc );
        return this;
    };
    /**
     * Get translated string
     *
     * @param {String} translation key
     * @param {Object} parameters
     * @private
     * @method
     * @return {String}
     */
    App.prototype.__ = function( key, params ) {
        var
            // Get requested string from translations
            text = ( this.private.__i18n[ key ] || key ).toString();
        if ( !params ) {
            return text;
        }
        return text.replace( /(\%\%(\w+)\%\%)/g, function( m, k, v ) {
            return qx.lang.Object.has( params, v ) ? params[ v ] : m;
        } );
    };
    /**
     * Update list of library icons
     *
     * @chainable
     * @private
     * @method
     */
    App.prototype.__updateLibrary = function( callback ) {
        // Wrap callback
        callback = IC.w.util.Helper.wrapCallback( callback );
        // Check, if data is loaded
        if ( qx.lang.Object.has( this.private, '__wait4data' ) ) {
            // Remove all previous query
            delete this.private.__wait4data;
        }
        // Check __icons
        this.private.__icons = this.private.__icons || {
            unit: [],
            group: [],
            poi: []
        };
        var
            // Get list of files
            files_ = this.private.__core.fileList( this.private.__target ) || [];
        // Sort files by name
        files_ = this.private.__core.__sortArrayBy( 'n', files_ );

        var cb = qx.lang.Function.bind(function () {
            // Render list of icons
            this.__renderIcons();
            // Save active state to button
            this.private.__core.removeClass(document.getElementById('source').querySelector('.active'), 'active');
            this.private.__core.addClass(this.public.buttons[this.private.__target], 'active');
            // Call clear method
            this.__clear(true);
            // Call callback
            callback();
            if ( this.array_action_timeouts ) {
                delete this.array_action_timeouts.icons_list;
            }
        }, this);

        if ( !this.private.__icons[this.private.__target].length ) {

            var err = this.__registerArrayActon(files_,
                qx.lang.Function.bind(function (f) {
                    // Check if there are present f.n & it is valid type
                    if (!qx.lang.Object.has(f, 'n') || !this.__validate(f.n)) {
                        return true;
                    }
                    var
                    // Check if it is new file or not
                        present_ = this.private.__icons[this.private.__target].filter(function (i) {
                            return i.props.n === f.n;
                        });
                    if (!present_.length) {
                        // Add new icon in collection
                        this.private.__icons[this.private.__target].push(new Icon(f, this));
                    }
                }, this),
                500, {
                    id: "icons_list",
                    end_array_cb: cb
                });
            if ( typeof err === 'boolean' ) {
                cb();
            }
        } else {
            cb();
        }
        return this;
    };
    /**
     * Bind events listeners
     *
     * @chainable
     * @private
     * @method
     */
    App.prototype.__bindEvents = function() {
        // redraw table if icon have to be changed
        this.private.__core.private.__session.addListener('serverUpdated', qx.lang.Function.bind( function( e ) {
            if (this.private.__needUpdate) {
                if (this.private.__dataTable) {
                    this.__renderItems();
                }
                this.private.__needUpdate = false;
            }
        }, this));
        // Add listener to change flag, when data loaded
        this.private.__core.private.__session.addListener('ICloaded', qx.lang.Function.bind( function( e ) {
            if ( !qx.lang.Object.has( this.private.__core.private.__items, this.private.__target ) ) {
                return false;
            }
            if ( qx.lang.Object.has( this.private, '__wait4data' ) ) {
                // Call necessary function
                this.private.__wait4data();
                // Delete it
                delete this.private.__wait4data;
            }
        }, this ) );
        var self = this;
        IC.$( root )
            // Try to logout on closing / refreshing
            .on('beforeunload', qx.lang.Function.bind( this.private.__core.logout, this.private.__core ) )
            // Update table on window resize
            .on('resize orientationchange', qx.lang.Function.bind( IC._.throttle( this.__resize, THROTTLING_INTERVAL_ ), this ) );
        IC.$( document )
            .on('change', '#upload', qx.lang.Function.bind( function( e ) {
                if ( !IC.Bar.isRendered() ) {
                    // Show progress bar
                    IC.Bar.start();
                }
                var
                    // Get input value
                    filenames_ = [ IC.$( e.currentTarget ).val().split('\\').pop() ],
                    isBreak_ = false;
                // Check support FileAPI
                if ( qx.lang.Object.has( e.currentTarget, 'files' ) ) {
                    // Get filenames
                    var
                        i_ = 0,
                        files_ = e.currentTarget.files,
                        len_ = files_.length;
                    filenames_ = [];
                    for ( ; i_ < len_; i_++ ) {
                        filenames_.push( files_[ i_ ].name );
                    }
                }
                qx.lang.Function.forEach( filenames_, function( f ) {
                    var
                        // Check if it is new file or not
                        present_ = this.private.__icons[ this.private.__target ].filter( function( i ) {
                            return i.props.n === f;
                        } );
                        // Show confirm dialog
                        if ( present_.length && !confirm( IC.w.util.String.sprintf( this.__('Do you really want to replace an earlier added icon %s?'), f ) ) ) {
                            isBreak_ = true;
                            return false;
                        }
                }, this );
                if ( isBreak_ ) {
                    // Hide progress bar
                    IC.Bar.done();
                    return false;
                }
                this.private.__core.fileUpload( this.private.__target, this.__validate, qx.lang.Function.bind( function() {
                    this.private.__icons[this.private.__target] = [];
                    this.__updateLibrary( function() {
                        // Hide progress bar
                        IC.Bar.done();
                    } );
                }, this ), e );
            }, this ) )
            .on('click', '#source .btn', qx.lang.Function.bind( function( e ) {
                var
                    icons_ = document.getElementById('icons');
                this.private.__target = e.currentTarget.getAttribute('data-source') || 'unit';
                // Call clear method
                this.__clear(true);
                if ( !IC.Bar.isRendered() ) {
                    // Show progress bar
                    IC.Bar.start();
                }
                this.__updateLibrary( function() {
                    // Hide progress bar
                    IC.Bar.done();
                } );
            }, this ) )
            .on('change', '#resource', qx.lang.Function.bind( IC._.throttle( this.__filter, THROTTLING_INTERVAL_ ), this ) )
            .on('keyup', '#filter', qx.lang.Function.bind( IC._.throttle( this.__filter, THROTTLING_INTERVAL_ ), this ) )
            .on('click', '#cancel', qx.lang.Function.bind( this.__clear, this ) )
            .on('click', '#check', function( e ) {
                // select all
                var self_ = IC.$( this ),
                    items = self.private.__filtredItems || self.private.__items[ self.private.__target ],
                    checked_;

                self_.toggleClass('checked');
                if (self_.hasClass('checked')) {
                    // all selected
                    for (var i = 0, d; i < items.length; i++) {
                        d = items[i];
                        self.private.__selected[d.props.id + (d.props.rid ? '_'+ d.props.rid : '')] = 1;
                    }
                } else {
                    // none selected
                    self.private.__selected = {};
                }
                self.__renderItems();
            } )
            .on('click', '#submit', qx.lang.Function.bind( function( e ) {
                // Check, if there are checked items
                if ( !Object.keys(self.private.__selected).length ) {
                    return false;
                }
                // Check, if apply to all similar enabled
                this[ document.getElementById('apply').checked ? '__similar' : '__submit' ]( e );
            }, this ) )
            .on('click', '#similar-btn', qx.lang.Function.bind( function( e ) {
                IC.$('.similar input[type="checkbox"]').each( function( k, v ) {
                    IC.$( '#checkbox_'+ v.value +' input').prop( 'checked', v.checked );
                } );
                // Hide modal
                this.private.__modal.modal('hide');
                // Call submit method
                this.__submit();
            }, this ) )
            .on('click', qx.lang.Function.bind( function( e ) {
                if ( !IC.$( e.target ).closest('#mainarea, .modal').length ) {
                    // Call clear method
                    this.__clear(true);
                }
            }, this ) )
            .on('change', '#resource-list', function( e ) {
                // Update
                IC.$('#resource').val( e.target.value | 0 );
                IC.$('#resource').trigger('change');
            } )
            .on('change', '#similarContentArea .icon-check', qx.lang.Function.bind( function( e ) {
                var id = e.target.getAttribute('value');
                if (id in this.private.__selected) {
                    delete this.private.__selected[id];
                } else {
                    this.private.__selected[id] = 1;
                }
                this.__renderSimilar();
            }, this ) );

        // checkbox icon
        $('#target')
            .on('change', '.icon-check', qx.lang.Function.bind( function( e ) {
                var id = e.target.getAttribute('value');
                if (id in this.private.__selected) {
                    delete this.private.__selected[id];
                } else {
                    this.private.__selected[id] = 1;
                }
                this.__renderItems();
            }, this ) );

        return this;
    };
    /**
     * Assign icon to necessary items (geofences, units, unit-groups)
     *
     * @param {Icon} an Icon instance
     * @chainable
     * @private
     * @method
     */
    App.prototype.__assign = function( icon ) {
        if ( !IC.Bar.isRendered() ) {
            // Show progress bar
            IC.Bar.start();
        }
        var
            target_ = document.getElementById('target');
        // Check, if data is loaded
        if ( !qx.lang.Object.has( this.private.__core.private.__items, this.private.__target ) ) {
            // Store in query
            this.private.__wait4data = qx.lang.Function.bind( this.__assign, this, icon );
            target_.innerHTML = '<h5>'+ this.__('Loading, please wait...') +'</h5>';
            return this;
        }
        var
            icons_ = document.getElementById('icons');
        // Store icon
        this.private.__icon = icon;
        // Skip if already rendered
        if ( this.private.__dataTable ) {
            // Hide progress bar
            IC.Bar.done();
            return this;
        }
        // Render template
        target_.innerHTML = this.__tmpl( this.public.tmpls._assign, { resources: ( this.private.__target === 'poi' ? true : null ) } );
        // Check, if already loaded items
        if ( !qx.lang.Object.has( this.private.__items, this.private.__target ) ) {
            return this.__loadItems( qx.lang.Function.bind( this.__renderItems, this ) );
        }
        this.__renderItems();
        return this;
    };
    /**
     * Load all necessary available items
     *
     * @param {Function} callback function
     * @chainable
     * @private
     * @method
     */
    App.prototype.__loadItems = function( callback ) {
        // Wrap callback
        callback = IC.w.util.Helper.wrapCallback( callback );
        var
            data_ = this.private.__core.private.__items[ this.private.__target ],
            items_ = [];
        qx.lang.Function.forEach( data_, function( d ) {
            var
                attrs_ = { raw: d };
            // Geofences
            if ( this.private.__target === 'poi' ) {
                // Check, if we can edit geofences
                if ( !( d.getUserAccess() & IC.w.item.Resource.accessFlag.editZones ) ) {
                    return true;
                }
                attrs_.rid = d.getId();
                qx.lang.Function.forEach( d.getZones() || {}, function( p ) {
                    var
                        a_ = qx.lang.Object.defaults( {}, attrs_ );
                    a_.name = p.n;
                    a_.id = p.id;
                    a_.img = p.t ? d.getZoneImageUrl( p, ICON_SIZE_LITTLE_ ) : '';
                    a_.attrs = p;
                    items_.push( new Item( a_, this ) );
                }, this );
                // bind action to 'changeIcon' event
                d.addListener('updateZone', qx.lang.Function.bind( this.__changeIcon, this, 'poi' ) );
                return true;
            }
            // Check, if we can edit icons on units (units group)
            if ( !( d.getUserAccess() & IC.w.item.Item.accessFlag.editImage ) ) {
                return true;
            }
            // Units or groups
            attrs_.name = d.getName();
            attrs_.id = d.getId();
            attrs_.img = d.getIconUrl( ICON_SIZE_LITTLE_ );
            var
                item_ = new Item( attrs_, this );
            items_.push( item_ );
            // bind action to 'changeIcon' event
            d.addListener('changeIcon', qx.lang.Function.bind( this.__changeIcon, this, item_ ) );
        }, this );
        // Geofences
        if ( this.private.__target === 'poi' ) {
            items_ = items_.sort( function( a, b ) {
                a = a.props.name.toString().toLowerCase();
                b = b.props.name.toString().toLowerCase();
                if ( a > b ) {
                    return 1;
                }
                if ( a < b ) {
                    return -1;
                }
                return 0;
            } );
        }
        this.private.__items[ this.private.__target ] = items_;
        this.private.__filtredItems = null;
        this.private.__selected = {};
        IC.$('#check').removeClass('checked');
        // Call callback
        callback();
        return this;
    };
    /**
     * Render icons
     *
     * @param {?wialon.item.Item||String} unit / unit group or string
     * @param {?event} event original DOM event
     * @chainable
     * @private
     * @method
     */
    App.prototype.__changeIcon = function( item, e ) {
        if ( item === 'poi' ) {
            var
                zone_ = e.getData(),
                res_ = e.getTarget();
            item = qx.lang.Array.findWhere( this.private.__items.poi, { __id: zone_.id +'_'+ res_.getId() } );
            // If we can't find item
            if ( !item ) {
                return this;
            }
            // Update item
            item.props.img = zone_.t ? res_.getZoneImageUrl( zone_, ICON_SIZE_LITTLE_ ) : '';
        } else {
            item.props.img = item.props.raw.getIconUrl( ICON_SIZE_LITTLE_ );
        }
        var
            img_ = IC.$('#checkbox_'+ item.__id +' img');
        img_.attr( 'src', item.props.img );

        // schedule redraw
        this.private.__needUpdate = true;

        return this;
    };
    /**
     * Render icons
     *
     * @chainable
     * @private
     * @method
     */
    App.prototype.__renderIcons = function() {
        var
            icons_ = document.getElementById('icons');

        var temp = function ( i ) {
            icons_.appendChild( i.el );
        };
        // Empty icons container
        while ( icons_.firstChild ) {
            icons_.removeChild( icons_.firstChild );
        }
        // Generate html
        qx.lang.Function.forEach( this.private.__icons[ this.private.__target ], function( i ) {
            setTimeout(qx.lang.Function.bind( temp, this, i), 1000);
        }, this );
        return this;
    };
    /**
     * @param param_array {Array}
     * @param param_callback {Function}
     * @param param_timeout {Integer}
     * @param param_obj {Object} custom additional params
     *
     * @return call function end_array_cb
     */
    App.prototype.__registerArrayActon = function(param_array, param_callback, param_timeout, param_obj) {
        // check params
        if (!param_array || !param_array.length || typeof param_callback !== "function" || arguments.length < 3)
            return false;
        var timeout_id = setTimeout(qx.lang.Function.bind(this.__checkArrayAction, this, param_obj.id), param_timeout);
        if (!this.array_action_timeouts)
            this.array_action_timeouts = new Object;

        this.array_action_timeouts[param_obj.id] = {
            time_id: timeout_id,
            arr: param_array,
            cb: param_callback,
            custom: param_obj,
            _time: param_timeout
        };
        return param_obj.id;
    };
    /**
     * Used by the function above
     */
    App.prototype.__checkArrayAction = function(id) {
        var data = this.array_action_timeouts[id];
        if ( data ) {
            clearTimeout(data.time_id);
            this.__callAction(data.arr, data, id);
        }
    };
    App.prototype.__callAction = function(arr, data, id) {
        var todo = arr.concat();
        setTimeout(qx.lang.Function.bind(this.__callTimmer, this, todo, data, id), 250 );
    };
    App.prototype.__callTimmer = function( todo, data, id ) {
        var start = +new Date();
        do {
            data.cb(todo.shift(), data.custom);
        } while (todo.length > 0 && (+(new Date()) - start < 5));
        if (todo.length > 0) {
            setTimeout(qx.lang.Function.bind(this.__callTimmer, this, todo, data, id), 500 );
        } else {
            if (data.custom && typeof data.custom.end_array_cb === "function") {
                data.custom.end_array_cb();
            }
            if (!this.array_action_timeouts[id])
                return;
            this.array_action_timeouts[id].time_id = setTimeout(qx.lang.Function.bind(this.__checkArrayAction, this, id), data._time);
        }
    };
    /**
     * Generate item cell
     */
    App.prototype.__generateCell = function(d, check_) {
        var
            label_ = '';
        if (d) {
            var
                id_ = d.props.id + (d.props.rid ? '_'+ d.props.rid : '');
            if (typeof check_ == 'undefined') {
                check_ = id_ in this.private.__selected;
            }
            label_ += '<label id="checkbox_'+ id_ +'">';
            label_ += '<input class="icon-check" type="checkbox" value="'+ id_ +'"' + (check_ ? ' checked': '') + '>';
            label_ += '<img src="'+ d.props.img +'" width="'+ ICON_SIZE_LITTLE_ +'" height="'+ ICON_SIZE_LITTLE_ +'"/>';
            label_ += d.props.name +'</label>';
        }
        return '<div class="column">' + label_ + '</div>';
    }
    /**
     * Render items
     *
     * @chainable
     * @private
     * @method
     */
    App.prototype.__renderItems = function() {
        var
            // Generate data
            data_ = [],
            items = this.private.__filtredItems || this.private.__items[ this.private.__target ];

        for (var i = 0, s; i <= items.length - 1; i += 2) {
            data_.push(
                '<div class="items-row ' + (i % 4 ? 'even' : 'odd') + '">' +
                    this.__generateCell(items[i]) +
                    this.__generateCell(items[i + 1]) +
                '</div>'
            );
        }

        if (this.private.__dataTable) {
            this.private.__dataTable.update(data_);
        } else {
            this.private.__dataTable = new Clusterize({
                rows: data_,
                scrollId: 'scrollArea',
                contentId: 'contentArea',
                rows_in_block: 30
            });

            if ( this.private.__target === 'poi' ) {
                var pois = this.private.__core.private.__items.poi;
                var html = '<option value="">' + this.__('All resources') + '</option>';
                for(var j = 0, v; j < pois.length; j++) {
                    v = pois[j];
                    html += '<option value="' + v.getId() + '">' + v.getName() + '</option>';
                }
                $("#resource-list").html(html);
            }
        }

        // Resize event
        this.__resize();
        // Hide progress bar
        IC.Bar.done();
        return this;
    };
    /**
     * Check extension (only images required)
     *
     * @param {DOM|String} DOM element or filename
     * @chainable
     * @private
     * @method
     */
    App.prototype.__validate = function( el ) {
        var
            file_ = ( qx.lang.Type.isString( el ) ? el : el.value ).split('.').pop().toLowerCase(),
            allowed_ = FILE_TYPES_,
            i_;
        for ( i_ in allowed_ ) {
            // Check, if it is one of the allowed file types
            if ( file_ === allowed_[ i_ ] ) {
                return true;
            }
        }
        return false;
    };
    /**
     * Resize handling, throttled to THROTTLING_INTERVAL_
     *
     * @param {?event} event original DOM event
     * @chainable
     * @private
     * @method
     */
    App.prototype.__resize = function( e ) {
        var
            // Calculate new mainarea height
            moHeight = ~~this.private.__$el[0].offsetHeight,
            mnHeight = ~~root.innerHeight - ~~( this.private.__$el[0].getBoundingClientRect().top ) - 20;
        // Check min of calculated & provided height
        if ( mnHeight < MINIMAL_VIEWPORT_HEIGHT_ ) {
            mnHeight = MINIMAL_VIEWPORT_HEIGHT_;
        }
        // Apply new height to el
        if ( moHeight !== mnHeight ) {
            this.private.__$el[0].style.height = mnHeight +'px';
            // Update icons & target height too
            document.getElementById('icons').style.height = mnHeight +'px';
            document.getElementById('target').style.height = mnHeight +'px';
        }
        if ( !this.private.__dataTable ) {
            return this;
        }

        return this;
    };
    /**
     * Filter handling, throttled to THROTTLING_INTERVAL_
     *
     * @param {?event} event original DOM event
     * @chainable
     * @private
     * @method
     */
    App.prototype.__filter = function( e ) {
        var
            string_ = document.getElementById('filter').value;
        string_ = string_.trim().toString().toLowerCase();
        // Show all items if there are empty
        var
            rid_ = document.getElementById('resource') ? ~~document.getElementById('resource').value : null,
            items_ = this.private.__items[ this.private.__target ].filter( function( i ) {
                // Check if it is not null
                if ( !i ) {
                    return false;
                }
                if ( string_.length && i.props.name.toString().toLowerCase().indexOf( string_ ) === -1 ) {
                    return false;
                }
                if ( rid_ && i.props.rid !== rid_ ) {
                    return false;
                }
                return true;
            } );
        this.private.__filtredItems = items_;

        // redraw
        this.__renderItems();

        // Call resize event
        this.__resize();
        return this;
    };
    /**
     * Clear handler
     *
     * @param {?event} event original DOM event
     * @chainable
     * @private
     * @method
     */
    App.prototype.__clear = function( e ) {
        if ( e ) {
            // Check previous table
            if (this.private.__dataTable ) {
                // Destroy previous table
                this.private.__dataTable.destroy(true)
                delete this.private.__dataTable;
                // clear previous select
                this.private.__filtredItems = null;
                this.private.__selected = {};
            }
            IC.$('#check').removeClass('checked');
            document.getElementById('target').innerHTML = '<h5>'+ this.__('Choose an icon and assign it to an object.') +'</h5>';
        }
        IC.$('#icons .icon')
            .removeClass('active disable');
        // Call resize
        this.__resize();
        return this;
    };
    /**
     * Submit handler
     *
     * @param {?event} event original DOM event
     * @chainable
     * @private
     * @method
     */
    App.prototype.__submit = function( e ) {
        var
            self = this;
        if ( !IC.Bar.isRendered() ) {
            // Show progress bar
            IC.Bar.start();
        }
        var item_;
        IC.w.core.Remote.getInstance().startBatch('IC.App.changeIcon');
        for (var id in self.private.__selected) {
            item_ = qx.lang.Array.findWhere( this.private.__items[ this.private.__target ], { __id: id } );
            if ( item_ ) {
                item_.changeIcon( this.private.__icon );
            }
        }
        IC.w.core.Remote.getInstance().finishBatch( function() {
            // uncheck all items
            self.private.__selected = {};
            IC.$('#check').removeClass('checked');
            self.__renderItems();
            // Hide progress bar
            IC.Bar.done();
        }, 'IC.App.changeIcon');
        return this;
    };
    /**
     * Find similar icons method
     *
     * @param {?event} event original DOM event
     * @chainable
     * @private
     * @method
     */
    App.prototype.__similar = function( e ) {
        // Hide previous modal
        if ( this.private.__modal ) {
            this.private.__modal.modal('hide');
        }
        var
            self_ = this,
            // Render template
            tmpl_ = this.__tmpl( this.public.tmpls._similar ),
            modal_ = this.private.__modal = IC.$( tmpl_ ),
            // Resulted array
            items_ = ( this.private.__filtredItems || this.private.__items[ this.private.__target ] ),
            // Image array
            imgs_ = [],
            data_ = [],
            dataTable_, length_, v;
        for (var k in this.private.__selected) {
            var
                // Try to find item
                item_ = qx.lang.Array.findWhere( items_, { __id: k } );

                if ( !item_ ) {
                    return true;
                }

                // Add icon url
                imgs_.push( item_.props.img );
        }

        // try to find items with the same icon
        items_ = items_.filter( function( i ) {
            // Check if it is not null
            if ( !i ) {
                return false;
            }
            var sameImg = imgs_.indexOf( i.props.img ) !== -1;

            if (sameImg) {
                var id = i.props.id + (i.props.rid ? '_'+ i.props.rid : '');
                self_.private.__selected[id] = 1;
            }

            return sameImg;
        } );
        length_ = IC._.size( items_ );
        // Check, if there are items
        if ( !length_ ) {
            // Call submit method
            this.__submit();
            return this;
        }
        modal_
            // Show throw modal
            .modal()
            // Remove it on hide
            .on('hidden.bs.modal', function() {
                if (self_.private.__similarDataTable) {
                    self_.private.__similarDataTable.destroy(true);
                    delete self_.private.__similarDataTable;
                }
                modal_.remove();
            });
        // render similar table
        this.private.__similarItems = items_;
        this.__renderSimilar();

        return this;
    };

    /**
     * Render similar virtual table
     */
    App.prototype.__renderSimilar = function() {
        var items_ = this.private.__similarItems;
        var data_ = [];
        for (var i = 0, id, html; i <= items_.length - 1; i += 2) {
            // left cell
            id = items_[i].props.id + (items_[i].props.rid ? '_'+ items_[i].props.rid : '');
            html = this.__generateCell(items_[i], id in this.private.__selected);
            // right cell
            if (items_[i + 1]) {
                id = items_[i + 1].props.id + (items_[i + 1].props.rid ? '_'+ items_[i + 1].props.rid : '');
                html += this.__generateCell(items_[i + 1], id in this.private.__selected);
            } else {
                html += this.__generateCell(items_[i + 1]);
            }
            data_.push(
                '<div class="items-row ' + (i % 4 ? 'even' : 'odd') + '">' + html + '</div>'
            );
        }
        // create or update
        if (this.private.__similarDataTable) {
            this.private.__similarDataTable.update(data_);
        } else {
            this.private.__similarDataTable = new Clusterize({
                rows: data_,
                scrollId: 'similarScrollArea',
                contentId: 'similarContentArea',
                rows_in_block: 30
            });
        }
    }

    // Set up inheritance for the application.
    App.extend = IC.Core.extend;
    var
        /**
         * Single Icon constructor
         *
         * @constructor
         */
        Icon = IC.Icon = function( attrs, app ) {
            if ( !this instanceof Icon ) {
                // Prevent situations when call constructor without "new" word
                return new Icon( attrs );
            }
            // Add necessary arguments
            this.props = {};
            qx.lang.Function.forEach( attrs, function( v, k ) {
                this.props[ k ] = v;
            }, this );
            this.__path = app.private.__target +'/'+ this.props.n;
            this.__app = app;
            this.initialize();
        };
    Icon.prototype.initialize = function() {
        // Create root element
        this.el = document.createElement('div');
        this.__app.private.__core.addClass( this.el, 'icon' );
        // Create image from file name
        this.__img = new Image();
        this.__img.src = this.__app.private.__core.filePath( this.__path );
        this.__img.width = this.__img.height = ICON_SIZE_MEDIUM_;
        this.__img.id = this.__app.private.__core.__uniqueId('img');
        // Append necessary elements to root element
        this.el.appendChild( this.__img );
        // Bind events
        this.__app.private.__core.addEvent( this.__img, 'click', this.__showActions, this, false );
        // Check, if user can edit / delete files
        if ( this.__app.private.__canEdit ) {
            // Create delete link
            this.__delete = document.createElement('a');
            this.__delete.href = '#';
            this.__delete.appendChild( document.createTextNode( this.__app.__('Delete') ) );
            this.el.appendChild( this.__delete );
            this.__app.private.__core.addEventOnce( this.__delete, 'click', this.destroy, this, false );
        }
        return this;
    };
    Icon.prototype.__showActions = function() {
        IC.$('#icons .icon')
            .removeClass('active')
            .addClass('disable');
        IC.$( this.el )
            .removeClass('disable')
            .addClass('active');
        this.__app.__assign( this );
        return this;
    };
    Icon.prototype.destroy = function( e ) {
        if ( e ) {
            e.preventDefault();
        }
        if ( !this.__app.private.__canEdit ) {
            IC.throw(7);
            return this;
        }
        var
            filename_ = this.props.n,
            items_ = this.__app.private.__items[ this.__app.private.__target ];
        // try to find items with the same icon
        items_ = items_.filter( function( i ) {
            // Check if it is not null
            if ( !i ) {
                return false;
            }
            return i.props.img.indexOf( filename_ ) !== -1;
        } );
        if ( !confirm( ( IC._.size( items_ ) ?
                this.__app.__('This icon assigned to an object.') +'\n' :
                ''
            ) + this.__app.__('Do you really want to delete this icon?') ) ) {
            return this;
        }
        if ( !IC.Bar.isRendered() ) {
            // Show progress bar
            IC.Bar.start();
        }
        // Try to remove file
        this.__app.private.__core.fileRemove( this.__path, qx.lang.Function.bind( function() {
            // Reset deleted icon to default, cant do it in batch
            if ( IC._.size( items_ ) ) {
                qx.lang.Function.forEach( items_, function( item ) {
                    item.resetIcon();
                });
            }
            // Unbind events
            this.__app.private.__core.removeEvents( this.__img );
            this.__app.private.__core.removeEvents( this.__delete );
            // Remove image
            this.el.parentNode.removeChild( this.el );
            var
                // Get index
                index_ = this.__app.private.__icons[ this.__app.private.__target ].indexOf( this );
            if ( index_ !== -1 ) {
                // Remove from list
                this.__app.private.__icons[ this.__app.private.__target ].splice( index_, 1 );
            }
            // Call clear method
            this.__app.__clear(true);
            // Hide progress bar
            IC.Bar.done();
        }, this ) );
        return this;
    };
    var
        /**
         * Single Item constructor
         *
         * @constructor
         */
        Item = IC.Item = function( attrs, app ) {
            if ( !this instanceof Item ) {
                // Prevent situations when call constructor without "new" word
                return new Item( attrs );
            }
            // Add necessary arguments
            this.props = {};
            qx.lang.Function.forEach( attrs, function( v, k ) {
                this.props[ k ] = v;
            }, this );
            this.__app = app;
            this.__id = this.props.id + ( this.props.rid ? '_'+ this.props.rid : '' );
            this.initialize();
        };
    Item.prototype.initialize = function() {
        return this;
    };
    Item.prototype.changeIcon = function( icon ) {
        if ( !icon instanceof Icon ) {
            return this;
        }
        IC.w.core.Remote.getInstance().startBatch('IC.Item.changeIcon');
        var
            libId_ = this.__app.private.__core.private.__account.getId(),
            path_ = this.__app.private.__core.setPath( icon.__path );
        switch ( this.__app.private.__target ) {
            case 'poi':
                // Get geofence data
                this.props.raw.getZonesData( [ this.props.id ], qx.lang.Function.bind( function( code, data ) {
                    if ( code ) {
                        return false;
                    }
                    data = data[0];
                    if ( qx.lang.Object.has( data, 'icon' ) ) {
                        delete data.icon;
                    }
                    // Change libID & path to icon
                    data.libId = libId_;
                    data.path = path_;
                    this.props.raw.updateZone( data );
                }, this ) );
                break;
            default:
                this.props.raw.updateIconLibrary( libId_, path_ );
        }
        IC.w.core.Remote.getInstance().finishBatch( null , 'IC.Item.changeIcon');
        return this;
    };
    // Reset icon to default
    Item.prototype.resetIcon = function() {
        if ( this.__app.private.__target == 'poi' ) {
            this.props.raw.setZoneImage(this.props, '');
        } else {
            this.props.raw.updateIcon('');
        }
    };
} ) );
