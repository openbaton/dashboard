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

var app = angular.module('app');

app.controller('nsdinfoctrl', function ($scope, $compile, $cookieStore, $routeParams, $filter, http, serviceAPI, $window, $route, $interval, $http, topologiesAPI, AuthService, NgTableParams, http) {
    var baseURL = $cookieStore.get('URL') + "/api/v1";
    var url = baseURL + '/ns-descriptors/';


    function loadNSD() {
        http.get(url + $routeParams.nsdescriptorId)
                .success(function (response, status) {
                    $scope.nsdinfo = response;
                    $scope.nsdJSON = response;
                    console.log("here" + $scope.nsdinfo);
                })
                .error(function (data, status) {
                    showError(data, status);
                });
    }

    $scope.closeAlert = function (index) {
        $scope.alerts.splice(index, 1);
    };


    $scope.jsonrend = function () {
        renderjson.set_icons('+', '-');
        renderjson.set_show_to_level(1);
        var jsonDiv = document.querySelector("#json");
        jsonDiv.append(
            renderjson($scope.nsdJSON)
        );
    }
    $('#jsonInfo').on('hidden.bs.modal', function () {
        var jsonDiv = document.querySelector("#json");
        jsonDiv.childNodes[0].remove();

    });

    if (typeof(Storage) !== "undefined") {
        // Store
        localStorage.setItem("LastURL", location.href);
    } else {
        document.getElementById("result").innerHTML = "Sorry, your browser does not support Web Storage...";
    }
    ;

})