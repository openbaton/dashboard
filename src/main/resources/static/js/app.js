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

angular.module('app', ['ngTable', 'ngRoute', 'ngSanitize', 'ui.bootstrap', 'ngCookies', 'angular-clipboard'])
    .config(function ($routeProvider, $locationProvider) {


        $routeProvider.when('/login', {
            templateUrl: 'login.html',
            controller: 'LoginController'
        }).when('/main', {
            templateUrl: 'pages/contents.html',
            controller: 'IndexCtrl'
        }).when('/projects', {
            templateUrl: 'pages/projects/projects.html',
            controller: 'ProjectCtrl'
        }).when('/users', {
            templateUrl: 'pages/users/users.html',
            controller: 'UserCtrl'
        }).when('/users/:userId', {
            templateUrl: 'pages/users/userinfo.html',
            controller: 'UserCtrl'
        }).when('/packages', {
            templateUrl: 'pages/packages/packages.html',
            controller: 'PackageCtrl'
        }).when('/packages/:packageid', {
            templateUrl: 'pages/packages/packageinfo.html',
            controller: 'PackageCtrl'
        }).when('/events/:eventId', {
            templateUrl: 'pages/events/eventinfo.html',
            controller: 'EventCtrl'
        }).when('/events', {
            templateUrl: 'pages/events/events.html',
            controller: 'EventCtrl'
        // }).when('/services/:serviceId', {
        //     templateUrl: 'pages/services/serviceinfo.html',
        //     controller: 'ServiceCtrl'
        }).when('/services', {
            templateUrl: 'pages/services/services.html',
            controller: 'ServiceCtrl'
        }).when('/nsdescriptors', {
            templateUrl: 'pages/nsdescriptors/nsdescriptors.html',
            controller: 'NsdCtrl'
        }).when('/nsdescriptors/:nsdescriptorId', {
            templateUrl: 'pages/nsdescriptors/nsdescriptorinfo.html',
            controller: 'NsdCtrl'
        }).when('/vnfdescriptors/', {
            templateUrl: 'pages/nsdescriptors/vnfdescriptors/vnfdescriptors.html',
            controller: 'VnfdCtrl'
        }).when('/vnfdescriptors/:vnfdescriptorId', {
            templateUrl: 'pages/nsdescriptors/vnfdescriptors/vnfdescriptor.html',
            controller: 'VnfdCtrl'
        }).when('/vnfdescriptors/:vnfdescriptorId/vdus/:vduId', {
            templateUrl: 'pages/nsdescriptors/vnfdescriptors/vdu.html',
            controller: 'VnfdCtrl'
        }).when('/vnfdescriptors/:vnfdescriptorId/vdus/:vduId', {
            templateUrl: 'pages/nsdescriptors/vnfdescriptors/vdu.html',
            controller: 'VnfdCtrl'
        }).when('/nsdescriptors/:nsdescriptorId/vnfdescriptors/', {
            templateUrl: 'pages/nsdescriptors/vnfdescriptors.html',
            controller: 'NsdCtrl'
        }).when('/nsdescriptors/:nsdescriptorId/vnfdescriptors/:vnfdescriptorId', {
            templateUrl: 'pages/nsdescriptors/vnfdescriptor.html',
            controller: 'NsdCtrl'
        }).when('/nsdescriptors/:nsdescriptorId/vnfdescriptors/:vnfdescriptorId/vdus/:vduId', {
            templateUrl: 'pages/nsdescriptors/vdu.html',
            controller: 'NsdCtrl'
        }).when('/nsrecords/:nsrecordId/vnfrecords/:vnfrecordId/vdus/:vduId', {
            templateUrl: 'pages/nsrecords/vdu.html',
            controller: 'NsrCtrl'
        }).when('/nsrecords/:nsrecordId/vnfrecords/:vnfrecordId/vdus/:vduId/vnfci/:vnfciId', {
            templateUrl: 'pages/nsrecords/vnfci.html',
            controller: 'NsrCtrl'
        }).when('/nsdescriptors/:nsdescriptorId/vnfdependencies/:vnfdependencyId', {
            templateUrl: 'pages/nsdescriptors/vnfdependency.html',
            controller: 'NsdCtrl'
        }).when('/nsdescriptors/:nsdescriptorId/graph', {
            templateUrl: 'pages/nsdescriptors/graph.html',
            controller: 'NsdCtrl'
        }).when('/nsrecords', {
            templateUrl: 'pages/nsrecords/nsrecords.html',
            controller: 'NsrCtrl'
        }).when('/nsrecords/:nsrecordId', {
            templateUrl: 'pages/nsrecords/nsrecordinfo.html',
            controller: 'NsrCtrl'
        }).when('/vnfmanagers', {
            templateUrl: 'pages/vnfmanagers/vnfmanagers.html',
            controller: 'VnfManagerCtrl'
        }).when('/vnfmanagers/:vnfmanagerId', {
            templateUrl: 'pages/vnfmanagers/vnfmanagerinfo.html',
            controller: 'VnfManagerCtrl'
        }).when('/nsrecords/:nsrecordId/graph', {
            templateUrl: 'pages/nsrecords/graph.html',
            controller: 'NsrCtrl'
        }).when('/nsrecords/:nsrecordId/vnfrecords/:vnfrecordId', {
            templateUrl: 'pages/nsrecords/vnfrecord.html',
            controller: 'NsrCtrl'
        }).when('/nsrecords/:nsrecordId/vnfrecords/', {
            templateUrl: 'pages/nsrecords/vnfrecords.html',
            controller: 'NsrCtrl'
        }).when('/nsrecords/:nsrecordId/vnfdependencies/', {
            templateUrl: 'pages/nsrecords/vnfdependencies.html',
            controller: 'NsrCtrl'
        }).when('/nsrecords/:nsrecordId/vnfdependencies/:vnfdependencyId', {
            templateUrl: 'pages/nsrecords/vnfdependency.html',
            controller: 'NsrCtrl'
        }).when('/vim-instances', {
            templateUrl: 'pages/vim-instances/vim-instances.html',
            controller: 'vimInstanceCtrl'
        }).when('/vim-instances/:vimInstanceId', {
            templateUrl: 'pages/vim-instances/vim-instanceinfo.html',
            controller: 'vimInstanceCtrl'
        }).when('/copyright', {
            templateUrl: 'pages/copyright.html',
            controller: ''
        }).when('/keypairs', {
            templateUrl: 'pages/keypairs/keypairs.html',
            controller: 'keyPairsCtrl'
        }).when('/marketplace', {
            templateUrl: 'pages/marketplace/marketplace.html',
            controller: 'marketCtrl'
        }).when('/vimdrivers', {
            templateUrl: 'pages/vimdrivers/vimdrivers.html',
            controller: 'driverCtrl'
        }).when('/history', {
            templateUrl: 'pages/history/history.html',
            controller: 'historyCtrl'
        }).when('/imagerepo', {
            templateUrl: 'pages/imagerepo/imagerepo.html',
            controller: 'imagerepoctrl',
        }).when('/imagerepo/:imageId', {
            templateUrl: 'pages/imagerepo/imageinfo.html',
            controller: 'imagerepoctrl'
        }).otherwise({
            redirectTo: '/main'
        });
        $locationProvider.html5Mode(false);
    });

/**
 *
 * Redirects an user not logged in
 *
 */

angular.module('app').run(function ($rootScope, $location, $cookieStore, $route) {
    //$route.reload();
    $rootScope.$on('$routeChangeStart', function (event, next) {

//        console.log($cookieStore.get('logged'));
        if ($cookieStore.get('logged') === false || angular.isUndefined($cookieStore.get('logged'))) {
            // no logged user, we should be going to #login
            if (next.templateUrl === "login.html") {
                // already going to #login, no redirect needed
            } else {
                // not going to #login, we should redirect now
                $location.path("/login");

            }
        }

    });
});

/*
 * MenuCtrl
 *
 * shows the modal for changing the Settings
 */

angular.module('app').controller('MenuCtrl', function ($scope, http) {


});
