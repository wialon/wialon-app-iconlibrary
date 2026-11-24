    function get_html_var (name, def){
      name = name.replace(/[\[]/, '\\\[').replace(/[\]]/, '\\\]');
      var
          regexS_ = '[\\?&]'+ name +'=([^&#]*)',
          regex_ = new RegExp( regexS_ ),
          loc_ = window.location.href,
          results_;
      if ( loc_.slice(-1) === '/' ) {
          loc_ = loc_.slice( 0, loc_.length - 1 );
      }
      results_ = regex_.exec( loc_ );
      if ( results_ === null ) {
          return def || '';
      }
      return results_[1] && decodeURIComponent( results_[1].replace(/\+/g, ' ') );
    }

    // RequireJS main config
    require.config({
        paths: {
            app:'app',
            jquery: '../bower_components/jquery/dist/jquery.min',
            modal: '../bower_components/apps_bootstrap/bootstrap/js/modal',
            nprogress: '../bower_components/nprogress/nprogress',
            underscore: '../bower_components/underscore/underscore-min',
            clusterize: '../bower_components/clusterize/clusterize',
            wialon: [ get_html_var('baseUrl','https://hst-api.wialon.com') + '/wsdk/script/wialon']
        },
        shim: {
            wialon: {
                exports: 'wialon'
            },
            app: {
                deps:[
                    'core'
                ]
            },
            core: {
                deps:[
                    'wialon'
                ]
            },
            nprogress: {
                exports: 'NProgress'
            },
            modal: {
                deps: ['jquery']
            }
        },
        waitSeconds: 0
    });
    // Load core & application
    define(['core', 'app'], function( IC ) {
        'use strict';
            var
                IconLibrary = IC.noConflict(),
                App = IconLibrary.App.extend({el: '#iconlibrary'}),
                app = new App();
    });
