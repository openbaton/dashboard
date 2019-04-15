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

var app = angular.module('app').controller('driverCtrl', function ($scope, $uibModal, serviceAPI, $routeParams, $http, $cookieStore, AuthService, $window, $interval, http) {
    var url = $cookieStore.get('URL');
    //var defaultUrl = "lore:8082"
    var defaultUrl = "marketplace.openbaton.org:8080";
    $scope.drivers = [];
    $scope.driversInstalled;
    $scope.installed = [];
    $scope.alerts = [];
    // to avoid the order of tables while it refresh in the background
    $scope.predicate = 'id';
    loadTable();
    loadInstalled();
    function loadTable() {
        //console.log($routeParams.userId);
        $http.get("http://" + defaultUrl + "/api/v1/vim-drivers")
            .success(function (response) {
                $scope.drivers = response;

            })
            .error(function (data, status) {
                showError(data, status);
            });


    }

    function loadInstalled() {
        http.get(url + "/api/v1/plugins").success(function (response) {
            $scope.driversinstalled = response;
            response.map(function (pl) {
                l1 = pl.split(".");
                $scope.installed.push({name: l1[2], type: l1[1]});

            })
            console.log(response[0].split("."));


        })
            .error(function (data, status) {
                showError(data, status);
            });

    }

    $scope.install = function (data) {
        http.get(url + "/api/v1/plugins/" + data.type + "/" + data.name + "/" + data.version).success(function (response) {
            showOk("Plugin " + data.name + " will be installed");

        })
            .error(function (data, status) {
                showError(data, status);

            });

    };

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
            console.log(status + ' Status unauthorized')
            AuthService.logout();
        }
    }

    function showOk(msg) {
        $scope.alerts.push({type: 'success', msg: msg});

        loadTable();
        $('.modal').modal('hide');
    }

    $scope.closeAlert = function (index) {
        $scope.alerts.splice(index, 1);
    };
// to Store current page into local storage
    if (typeof(Storage) !== "undefined") {
        // Store
        localStorage.setItem("LastURL", location.href);
    } else {
        document.getElementById("result").innerHTML = "Sorry, your browser does not support Web Storage...";
    }

    $scope.OpenModal = function(){
        var modalInstance = $uibModal.open({
          ariaLabelledBy: 'modal-title',
          ariaDescribedBy: 'modal-body',
          templateUrl: 'pages/vimdrivers/myModalContent.html',
          size: "lg",
          controller: 'TestCtrl'
        });
    
        modalInstance.result.then(function (selectedItem) {
          //$ctrl.selected = selectedItem;
        }, function () {
          //$log.info('Modal dismissed at: ' + new Date());
        });
      };


});
