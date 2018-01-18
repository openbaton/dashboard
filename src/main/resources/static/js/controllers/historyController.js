/*
 * Copyright (c) 2017 Open Baton (http://www.openbaton.org)
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
var app = angular.module('app').controller('historyCtrl', function ($scope, serviceAPI, $routeParams, http, $cookieStore, AuthService, $interval, NgTableParams, $filter) {
    var url = $cookieStore.get('URL') + "/api/v1/history/";
    $scope.alerts = [];
    $scope.closeAlert = function (index) {
        $scope.alerts.splice(index, 1);
    };
    loadTable();
    function loadTable() {
        http.get(url)
            .success(function (response) {
                $scope.history = response;
                historyTable();
                // console.log($scope.history);
            })
            .error(function (data, status) {
                showError(data, status);
            });
    }
    $scope.tableParamspaginationHistory = "";
    function historyTable() {
        $scope.tableParamspaginationHistory = new NgTableParams({
                page: 1,
                count: 20,
                sorting: {
                    timestamp: "desc"
                },
                // initial filters
                filter: { username: "" },
                filter: { method: "" },
                filter: { path: "" },
                filter: { result: "" },
                filter: { timestamp: "" },
            },
            {
                counts: [],
                dataset: $scope.history
            });
    }
    function showError(data, status) {
        if (status === 500) {
            $scope.alerts.push({
                type: 'danger',
                msg: 'An error occured and could not be handled properly, please, report to us and we will fix it as soon as possible'
            });
        } else {
            console.log('Status: ' + status + ' Data: ' + JSON.stringify(data));
            $scope.alerts.push({
                type: 'danger',
                msg: data.message + " Code: " + status
            });
        }

        $('.modal').modal('hide');

        if (status === 401) {
            console.log(status + ' Status unauthorized');
            AuthService.logout();
        }
    }

    function showOk(msg) {
        $scope.alerts.push({type: 'success', msg: msg});
        window.setTimeout(function () {
            for (i = 0; i < $scope.alerts.length; i++) {
                if ($scope.alerts[i].type == 'success') {
                    $scope.alerts.splice(i, 1);
                }
            }
        }, 5000);
        $('.modal').modal('hide');
    }

    if (typeof(Storage) !== "undefined") {
        // Store
        localStorage.setItem("LastURL", location.href);
    } else {
        document.getElementById("result").innerHTML = "Sorry, your browser does not support Web Storage...";
    }
});
