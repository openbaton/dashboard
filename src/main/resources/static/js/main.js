/*
 * Copyright (c) 2016 Open Baton (http://www.openbaton.org)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

require({
    baseUrl: 'js',
    paths: {
        jquery: 'libs/jquery/jquery.min',
        jquery_ui: 'libs/jquery/jquery-ui.min',
        bootstrapJS: "../bower_components/bootstrap/dist/js/bootstrap.min",
        metisMenu: "../bower_components/metisMenu/dist/metisMenu.min",
        sb_admin_2: "../dist/js/sb-admin-2",
        underscore: "libs/underscore/underscore-min",
        raphael: "libs/raphael",
        morris: "morris/morris-0.4.3.min",
        angular: "libs/angular/angular",
        ngTable: "libs/angular/ng-table",
        jQueryRotate: "libs/jquery/jQueryRotate",
        angular_route: "libs/angular/angular-route.min",
        angular_cookies: "libs/angular/angular-cookies",
        angular_clipboard: "libs/angular/angular-clipboard",
        d3: "libs/d3.min",
        ui_bootstrap: "libs/angular/ui-bootstrap-tpls-0.10.0.min",
        app: "app",
        bootstrapSwitch: "../bower_components/bootstrap/dist/js/bootstrap-switch.min",
        angular_sanitize: "libs/angular/angular-sanitize",
        tables: 'tablesorter/tables',
        tablesorter: 'tablesorter/jquery.tablesorter',
        httpService: "services/httpService",
        authService: "services/authService",
        servicesServices: "services/servicesServices",
        topologyServices: "services/topologyServices",
        packageController: "controllers/packageController",
        eventController: "controllers/eventController",
        projectController: "controllers/projectController",
        userController: "controllers/userController",
        vimInstanceController: "controllers/vimInstanceController",
        nsdController: "controllers/nsdController",
        nsrController: "controllers/nsrController",
        jquery_jsPlumb: "libs/jquery/jquery.jsPlumb-1.5.3-min",
        dropzone: "libs/dropzone",
        indexController: "controllers/indexController",
        vnfcomponentController: "controllers/vnfcomponentController",
        vnfmanagerController: "controllers/vnfmanagerController",
        vnfdController: "controllers/vnfdController",
        keyPairsController: "controllers/keyPairsController",
        marketCtrl:"controllers/marketCtrl",
        driverCtrl:"controllers/driverCtrl"
    },
    shim: {
        jquery: {
            exports: '$'
        },
        sb_admin_2: {
            deps: ['jquery', 'metisMenu']
        },
        metisMenu: {
            deps: ['jquery']
        },
        bootstrapJS: {
            deps: ['jquery']
        },
        angular: {
            exports: 'angular',
            deps: ['jquery', 'bootstrapJS', 'metisMenu', 'sb_admin_2']
        },
        d3: {
            exports: 'd3'
        },
        jQueryRotate: {
            deps: ['jquery']
        },
        boot: {
            deps: ['jquery']
        },
        jquery_ui: {
            deps: ['jquery']
        },
        bootstrapSwitch: {
            deps: ['jquery']
        },
        jquery_jsPlumb: {
            deps: ['jquery', 'jquery_ui', 'underscore']
        },
        bootstrap: {
            deps: ['app']
        },
        underscore: {
            exports: '_',
            deps: ['jquery']
        },
        common: {
            deps: ['morris']
        },
        morris: {
            deps: ['jquery', 'raphael']
        },
        app: {
            deps: ['angular', 'angular_route', 'angular_sanitize', 'ui_bootstrap', 'angular_clipboard', 'ngTable']
        },
        angular_route: {
            deps: ['angular']
        },
        angular_cookies: {
            deps: ['angular']
        },
        angular_sanitize: {
            deps: ['angular']
        },
        ui_bootstrap: {
            deps: ['angular']
        },
        authService: {
            deps: ['app']
        },
        servicesServices: {
            deps: ['app']
        },
        nsdController: {
            deps: ['app', 'servicesServices', 'httpService', 'underscore', 'angular_cookies','topologyServices', 'authService','underscore']
        },
        nsrController: {
            deps: ['app', 'servicesServices', 'httpService', 'underscore', 'topologyServices', 'angular_cookies', 'bootstrapSwitch','authService','underscore']
        },
        vimInstanceController: {
            deps: ['app', 'servicesServices', 'httpService','authService', 'angular_cookies']
        },
        vnfmanagerController: {
            deps: ['app', 'servicesServices', 'httpService','authService', 'angular_cookies']
        },
        vnfcomponentController: {
            deps: ['app', 'servicesServices', 'httpService','authService', 'angular_cookies']
        },
        vnfdController: {
            deps: ['app', 'servicesServices', 'httpService','authService', 'angular_cookies']
        },
        packageController: {
            deps: ['app', 'servicesServices', 'httpService', 'angular_cookies','authService','dropzone']
        },
        eventController: {
            deps: ['app', 'servicesServices', 'httpService', 'angular_cookies','authService']
        },
        projectController: {
            deps: ['app', 'servicesServices', 'httpService', 'angular_cookies','authService']
        },
        userController: {
            deps: ['app', 'servicesServices', 'httpService', 'angular_cookies','authService']
        },
        indexController: {
            deps: ['app', 'httpService', 'servicesServices', 'morris', 'authService', 'angular_cookies']
        },
        topologyServices: {
            deps: ['app', 'httpService', 'd3', 'jquery_jsPlumb', 'underscore','servicesServices']
        },
        httpService: {
            deps: ['app']
        },
        dropzone:{
            deps: ['jquery'],
            exports: 'Dropzone'
        },
        keyPairsController: {
            deps: ['app', 'servicesServices', 'httpService', 'angular_cookies','authService']
        },
        marketCtrl: {
            deps: ['app', 'servicesServices', 'httpService', 'angular_cookies','authService']
        },
        driverCtrl: {
            deps: ['app', 'servicesServices', 'httpService', 'angular_cookies','authService']
        }


    }
}), require([
    'require',
    'bootstrapJS',
    'metisMenu',
    'sb_admin_2',
    'underscore',
    'jquery_jsPlumb',
    'angular',
    'ngTable',
    'angular_route',
    'indexController',
    'nsdController',
    'vnfdController',
    'vnfcomponentController',
    'vnfmanagerController',
    'packageController',
    'eventController',
    'projectController',
    'userController',
    'nsrController',
    'vimInstanceController',
    'keyPairsController',
    'marketCtrl',
    'driverCtrl'
], function (require) {
    return require(['bootstrap']);
});
