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

/**
 *
 * Manages the login page
 *
 */

app.controller('LoginController', function ($scope, AuthService, Session, $rootScope, $location, $cookieStore, $http, http) {
    $scope.currentUser = null;
    //$scope.URL = 'http://localhost:8080';
    $scope.URL = '';
    $scope.alerts = [];
    $scope.NFVOVersion = "";
    // to avoid the order of tables while it refresh in the background
    $scope.predicate = 'id';
    $scope.oldUrl = localStorage.LastURL;
    $scope.credential = {
        "username": '',
        "password": '',
        "grant_type": "password"
    };

    if (angular.isUndefined($cookieStore.get('logged'))) {
        $scope.logged = false;
        $rootScope.logged = false;
    }

    else if ($cookieStore.get('logged')) {
        if ($scope.oldUrl === undefined || $scope.oldUrl === null) {
            $scope.logged = $cookieStore.get('logged');
            $rootScope.logged = $cookieStore.get('logged')
        }
        else {
            http.syncGet($cookieStore.get('URL') + '/api/v1/projects/')
                .then(function (response) {
                    if (response === 401) {
                        console.log(status + ' Status unauthorized');
                        AuthService.logout();
                    }
                });
            // console.log(localStorage.LastProject);
            // console.log($cookieStore.get('project'));
            $scope.logged = $cookieStore.get('logged');
            $rootScope.logged = $cookieStore.get('logged');
            // console.log("redirecting to " + $scope.oldUrl);
            //  window.location.href = $scope.oldUrl;
            $scope.redirectionVar = $cookieStore.get('redirection');
            if ($scope.redirectionVar === true) {
                window.location.href = $scope.oldUrl;
                $cookieStore.put('redirection', false);
            }
        }
    }
    // $location.replace();
    // console.log($scope.logged);
    $scope.loggedF = function () {
        return $scope.logged;
    };
    $scope.checkSecurity = function () {
        //console.log($scope.URL + "/api/v1/security");
        AuthService.removeSession();
        $http.get($scope.URL + "/api/v1/security")
            .success(function (data) {
                //console.log(data);
                if (data === "false") {
                    window.location.assign('/login');
                    window.location.reload();
                }
            })
            .error(function (data, status) {
                if (status === 404 || status === 400) {
                    return;
                }
                console.info(('status != 404'));
                console.error('Response error', status, data);
            });

    };

    /**
     * Calls the AuthService Service for retrieving the token access
     *
     * @param {type} credential
     * @returns {undefined}
     */
    $scope.login = function (credential) {
        var loginRes = AuthService.login(credential, $scope.URL).loginRes();
        loginRes.then(function (result) {
            if (!result) {
                setTimeout(showLoginError, 10);
            }
        });
    };


    $scope.register = function (newUser) {
        delete newUser.password2;
        //console.log(newUser);
        $http.post($scope.URL + '/register', newUser)
            .success(function (data, status) {
                $window.location.reload();
            })
            .error(function (status, data) {
            });
    };

    function showLoginError() {
        $scope.$apply(function () {
            $scope.loginError = angular.isUndefined($cookieStore.get('logged'));
            //console.log($scope.loginError);
        });
    }

});


app.controller('IndexCtrl', function ($document, $scope, $compile, $routeParams, serviceAPI, $interval, $cookieStore, $location, AuthService, http, $rootScope, $window, $route) {
    $('#side-menu').metisMenu();
    $scope.adminRole = "ADMIN";
    $scope.superProject = "*";
    $scope.numberNSR = 0;
    $scope.numberNSD = 0;
    $scope.numberVNF = 0;
    $scope.numberUnits = 0;
    $scope.numberKeys = 0;
    $scope.quota = null;
    var chartsHere = false;
    var url = $cookieStore.get('URL') + "/api/v1";

    $interval(waitCharts, 1000);
    $scope.config = {};
    $scope.userLogged;
    $location.replace();


    //this is here for mozilla browser to redirect user to main overview after login, mozilla does not do it automatically
    if ($cookieStore.get('logged') && (window.location.href.substring(window.location.href.length - 'login'.length) === 'login')) {
        window.location.href = window.location.href.substring(0, window.location.href.length - 'login'.length) + 'main';

    }
    var LoadProjects = function () {
        http.syncGet(url + '/projects/')
            .then(function (response) {
                var projects = response;
                // console.log(projects);
                var LastProject =  angular.fromJson(localStorage.getItem('LastProject'));
                // console.log(LastProject.id);
                $scope.AvailableProject = projects.find(function (obj){
                    return obj.id === LastProject.id;
                });
                // console.log($scope.AvailableProject);
                if (angular.isDefined($scope.AvailableProject)){
                    $cookieStore.put('project', $scope.AvailableProject);
                    // console.log( $cookieStore.get('project'));
                }
                else {
                    $rootScope.projectSelected = response[0];
                    $cookieStore.put('project', response[0]);
                    localStorage.setItem("LastProject", JSON.stringify(response[0]));
                    window.location.reload();
                }
            });
    }
    LoadProjects();
    function sortList() {
        var list, i, switching, b, shouldSwitch;
        list = document.getElementById("id01");
        switching = true;
        /*Make a loop that will continue until
         no switching has been done:*/
        while (switching) {
            //start by saying: no switching is done:
            switching = false;
            b = list.getElementsByTagName("LI");
            //Loop through all list items:
            for (i = 0; i < (b.length - 1); i++) {
                //start by saying there should be no switching:
                shouldSwitch = false;
                /*check if the next item should
                 switch place with the current item:*/
                if (b[i].innerHTML.toLowerCase() > b[i + 1].innerHTML.toLowerCase()) {
                    /*if next item is alphabetically lower than current item,
                     mark as a switch and break the loop:*/
                    shouldSwitch = true;
                    break;
                }
            }
            if (shouldSwitch) {
                /*If a switch has been marked, make the switch
                 and mark the switch as done:*/
                b[i].parentNode.insertBefore(b[i + 1], b[i]);
                switching = true;
            }
        }
    }

    function getVersion() {
        http.get(url + '/main/version/')
            .success(function (response) {
                console.log("version is " + response);
                $scope.NFVOversion = response
            })
            .error(function (response, status) {
                showError(response, status);
            });
    }


    function loadCurrentUser() {
        http.get(url + '/users/current')
            .success(function (response) {
                //console.log(response);
                $scope.userLogged = response
            })
            .error(function (response, status) {
                showError(response, status);
            });
    }

    function getConfig() {

        http.get(url + '/configurations/')
            .success(function (data, status) {
                //console.log(data);
                $.each(data, function (i, conf) {
                    if (conf.name === "system") {
                        $scope.config = conf;
                    }
                });
            });
    }

    $scope.loadSettings = function () {
        getConfig();
        $("#modalSetting").modal('show');

    };

    $scope.logged = $cookieStore.get('logged');

    //console.log($scope.logged);


    function stop() {
        $interval.cancel(promise);
    }

    function loadNumbers() {
        http.syncGet(url + '/ns-descriptors/').then(function (data) {
            $scope.numberNSD = data.length;
            var vnf = 0;
            $.each(data, function (i, nsd) {
                //console.log(nsd.vnfd.length);
                if (!angular.isUndefined(nsd.vnfd.length))
                    vnf = vnf + nsd.vnfd.length;
            });
            $scope.numberVNF = vnf;
        });
        http.syncGet(url + '/ns-records/').then(function (data) {
            $scope.numberNSR = data.length;
            var units = 0;
            $.each(data, function (i, nsr) {
                $.each(nsr.vnfr, function (i, vnfr) {
                    $.each(vnfr.vdu, function (i, vdu) {
                        if (!angular.isUndefined(vdu.vnfc_instance.length))
                            units = units + vdu.vnfc_instance.length;
                    });
                });
            });
            $scope.numberUnits = units;
        });

        http.syncGet(url + '/keys/').then(function (data) {
            $scope.numberKeys = data.length;
        });
        http.syncGet(url + '/datacenters/').then(function (data) {
            $scope.VIMs = data.length;
             // console.log($scope.VIMs);
        });

    }
    $scope.$watch('projectSelected', function (newValue, oldValue) {
        console.log(newValue);
        if (!angular.isUndefined(newValue) && !angular.isUndefined(oldValue)) {
            $cookieStore.put('project', newValue);
            localStorage.setItem("LastProject", JSON.stringify(newValue));
            loadNumbers();
            if (window.location.href.indexOf('main') > -1) {
                if (!$cookieStore.get('QUOTA')) {
                    console.log("No quota information stored");
                    loadQuota();
                } else {
                    console.log("Quota information available");
                    $scope.quota = $cookieStore.get('QUOTA');
                }
            }
            getConfig();
            loadCurrentUser();
            getVersion();


        }
        else if (!angular.isUndefined(newValue) && angular.isUndefined(oldValue)) {
            $cookieStore.put('project', newValue);
            localStorage.setItem("LastProject", JSON.stringify(newValue));
            loadNumbers();
            if (window.location.href.indexOf('main') > -1) {
                if (!$cookieStore.get('QUOTA')) {
                    console.log("No quota information stored");
                    loadQuota();
                } else {
                    console.log("Quota information available");
                    $scope.quota = $cookieStore.get('QUOTA');
                }
            }
            getConfig();
            loadCurrentUser();
            getVersion();
        }


    });


    console.log($rootScope.projects);
    console.log($rootScope.projectSelected);

    $scope.changeProject = function (project) {

        var lastProject = angular.fromJson(localStorage.getItem('LastProject'));
        if (lastProject && !angular.isUndefined(lastProject.id)) {
            $rootScope.projectSelected = lastProject;
            $cookieStore.put('project', lastProject);

        }
        if (arguments.length === 0) {
            http.syncGet(url + '/projects/')
                .then(function (response) {
                    if (response === 401) {
                        console.log(status + ' Status unauthorized');
                        AuthService.logout();
                    }
                    if (!lastProject || response.filter(function (f) {
                            return f.id === lastProject.id
                        }).length <= 0) {
                        $rootScope.projectSelected = response[0];
                        $cookieStore.put('project', response[0]);
                        localStorage.setItem("LastProject", JSON.stringify(response[0]));
                        if (lastProject) {
                            window.location.reload();
                        }
                    }
                    else if (angular.isUndefined($cookieStore.get('project')) || $cookieStore.get('project').id === '') {
                        $rootScope.projectSelected = response[0];
                        $cookieStore.put('project', response[0]);
                        localStorage.setItem("LastProject", JSON.stringify(response[0]));
                    } else {
                        $rootScope.projectSelected = $cookieStore.get('project');
                    }
                    $rootScope.projects = response;
                })

        }
        else {
            $rootScope.projectSelected = project;
            console.log(project);
            $cookieStore.put('project', project);
            localStorage.setItem("LastProject", JSON.stringify(project));
            $window.location.reload();
        }


    };


    $scope.saveSetting = function (config) {
        //console.log(config);
        $('.modal').modal('hide');
        $('#modalSend').modal('show');

        http.put(url + '/configurations/' + config.id, config)
            .success(function (response) {
                $('.modal').modal('hide');
                alert('Configurations Updated! ');

            })
            .error(function (response, status) {
                $('.modal').modal('hide');
                alert('ERROR: <strong>HTTP</strong> status:' + status + ' response <strong>response:</strong>' + response);
            });
    };

    /**
     * Checks if the user is logged
     * @returns {unresolved}
     */
    $scope.loggedF = function () {
        return $scope.logged;
    };

    if ($scope.logged)
    //console.log('Ok Logged');
        $location.replace();
    $scope.username = $cookieStore.get('userName');

    //console.log($scope.username);


    /**
     * Delete the session of the user
     * @returns {undefined}
     */
    $scope.logout = function () {
        AuthService.logout();
    };
    //Functions for changing the password
    $scope.oldPassword = '';
    $scope.newPassword = '';
    $scope.newPassword1 = '';

    $scope.changePassword = function () {
        $scope.oldPassword = '';
        $scope.newPassword = '';
        $scope.newPassword1 = '';

        $('#modalChangePassword').modal('show');
    };

    $scope.$watchGroup(["newPassword", "newPassword1"], function (newValue, oldValue) {
        if ($scope.newPassword.length < 8 || !(/[a-z]/.test($scope.newPassword)) || !(/[A-Z]/.test($scope.newPassword)) || !(/[0-9]/.test($scope.newPassword))) {
            $scope.newPasswordStyle = {'background-color': 'pink'};
            $scope.newPasswordStrong = false;
        } else {
            $scope.newPasswordStyle = {'background-color': 'white'};
            $scope.newPasswordStrong = true;
        }

        if ($scope.newPassword !== $scope.newPassword1) {
            $scope.newPasswordRepeat = {'background-color': 'pink'};
            $scope.newPasswordSame = false;
        } else {
            $scope.newPasswordRepeat = {'background-color': 'white'};
            $scope.newPasswordSame = true;
        }
    }, true);


    $scope.postNew = function () {
        if ($scope.newPassword.localeCompare($scope.newPassword1) == 0) {
            $scope.passwordData = {};
            $scope.passwordData.old_pwd = $scope.oldPassword;
            $scope.passwordData.new_pwd = $scope.newPassword;
            http.put(url + '/users/changepwd', JSON.stringify($scope.passwordData))
                .success(function (response) {
                    alert("The password has been successfully changed")
                    AuthService.logout()
                })
                .error(function (data, status) {
                    console.error('STATUS: ' + status + ' DATA: ' + JSON.stringify(data));
                    alert('STATUS: ' + status + ' DATA: ' + JSON.stringify(data))
                        ? "" : location.reload();
                });
        } else {
            alert("The new passwords are not the same");
        }

    };
    $scope.test = 34;
    $scope.admin = function () {
        //console.log($scope.userLogged);
        if (typeof $scope.userLogged != 'undefined') {
            if ($scope.userLogged.roles[0].project === $scope.superProject && $scope.userLogged.roles[0].role === $scope.adminRole) {
                return true;
            } else {
                return false;
            }
        }
        return false;
    };


    $(document).ready(function () {
    });
    $scope.refreshQuota = function () {
        $scope.quota = null;
        chartsHere = false;
        loadQuota();

    };
    function loadQuota() {
        http.get(url + '/quotas')
            .success(function (response) {
                console.log(response);
                $cookieStore.put('QUOTA', response);
                $scope.quota = response;

                //console.log($scope.quota.left.ram)
            })
            .error(function (response, status) {
                //chartsHere = true;
                $scope.quota = $scope.failedquota;
                $cookieStore.put('QUOTA', $scope.failedquota);
                showError({message: "Was not possible to retrieve the quota"}, "ERROR");
            });
    }

    $scope.closeAlert = function (index) {
        $scope.alerts.splice(index, 1);
    };
    $scope.rcdownload = function () {
        http.getRC(url + '/main/openbaton-rc/')
            .success(function (response) {
                console.log(response);
                var rc = document.createElement("a");
                rc.download = "openbaton" + '.rc';
                rc.href = 'data:application/x-shellscript,' + encodeURIComponent(response);
                document.body.appendChild(rc);
                rc.click()
                document.body.removeChild(rc);
                delete key;


            })
            .error(function (response, status) {
                showError(response, status);
            });
    }

    function waitCharts() {
        if (!chartsHere) {
            if ($scope.quota !== null) {
                chartsHere = true;
                createCharts();
            }
        }
    }

    var urlProjects = $cookieStore.get('URL') + "/api/v1/projects/";
    $scope.projectObj = {
        'name': '',
        'description': ''
    };
    $scope.createProject = function () {
        $('#createProject').modal('show');
    };
    $scope.save = function () {
        //console.log($scope.projectObj);
        http.post(urlProjects, $scope.projectObj)
            .success(function (response) {
                showOk('Project: ' + $scope.projectObj.name + ' saved.');
                // loadTable();
                $scope.projectObj = {
                    'name': '',
                    'description': ''
                };
                //location.reload();
            })
            .error(function (response, status) {
                showError(response, status);
            });
    };

    function showError(data, status) {
        if (status === 401) {
            console.log(status + ' Status unauthorized')
            AuthService.logout();
        }
        if (status === 500) {
            $scope.alerts.push({
                type: 'danger',
                msg: 'An error occured and could not be handled properly, please, report to us and we will fix it as soon as possible'
            });
            if ($scope.alerts.length > 1) {
                $scope.alerts.splice(0, 1);
            }
        } else {
            console.log('Status: ' + status + ' Data: ' + JSON.stringify(data));
            $scope.alerts.push({
                type: 'danger',
                msg: data.message
            });
        }

        $('.modal').modal('hide');

    }

    $scope.failedquota = {
        "total": {
            "version": 1,
            "cores": 1,
            "floatingIps": 1,
            "instances": 1,
            "keyPairs": 1,
            "ram": 1
        },
        "left": {
            "version": 0,
            "cores": 0,
            "floatingIps": 0,
            "instances": 0,
            "keyPairs": 0,
            "ram": 0
        }
    };

    function showOk(msg) {
        $scope.alerts.push({type: 'success', msg: msg});
        window.setTimeout(function () {
            for (i = 0; i < $scope.alerts.length; i++) {
                if ($scope.alerts[i].type == 'success') {
                    $scope.alerts.splice(i, 1);
                }
            }
        }, 5000);
        $scope.changeProject();
        $('.modal').modal('hide');
    }

    $scope.chartsLoaded = function () {
        return chartsHere;
    };

    function createCharts() {
        console.log("Creating charts");

        $.getScript('asset/js/plugins/chart.min.js', function () {
            var ramData = [{
                value: $scope.quota.left.ram,
                color: "#4ED18F",
                highlight: "#15BA67",
                label: "Availaible"
            },
                {
                    value: $scope.quota.total.ram - $scope.quota.left.ram,
                    color: "#B22222",
                    highlight: "#15BA67",
                    label: "Used"
                }

            ]
            if ($scope.quota.total.ram === 0) {
                var ramData = [{
                    value: 1,
                    color: "#4ED18F",
                    highlight: "#15BA67",
                    label: "No resources available"
                }]
            }

            var instData = [{
                value: $scope.quota.left.instances,
                color: "#4ED18F",
                highlight: "#15BA67",
                label: "Availaible"
            },
                {
                    value: $scope.quota.total.instances - $scope.quota.left.instances,
                    color: "#B22222",
                    highlight: "#15BA67",
                    label: "Used"
                }

            ]

            if ($scope.quota.total.instances === 0) {
                var instData = [{
                    value: 1,
                    color: "#4ED18F",
                    highlight: "#15BA67",
                    label: "No resources available"
                }]
            }

            var cpuData = [{
                value: $scope.quota.left.cores,
                color: "#4ED18F",
                highlight: "#15BA67",
                label: "Availaible"
            },
                {
                    value: $scope.quota.total.cores - $scope.quota.left.cores,
                    color: "#B22222",
                    highlight: "#15BA67",
                    label: "Used"
                }

            ]

            if ($scope.quota.total.cores === 0) {
                var cpuData = [{
                    value: 1,
                    color: "#4ED18F",
                    highlight: "#15BA67",
                    label: "No resources available"
                }]
            }

            var ipData = [{
                value: $scope.quota.left.floatingIps,
                color: "#4ED18F",
                highlight: "#15BA67",
                label: "Availaible"
            },
                {
                    value: $scope.quota.total.floatingIps - $scope.quota.left.floatingIps,
                    color: "#B22222",
                    highlight: "#15BA67",
                    label: "Used"
                }

            ]

            if ($scope.quota.total.floatingIps === 0) {
                var ipData = [{
                    value: 1,
                    color: "#4ED18F",
                    highlight: "#15BA67",
                    label: "No resources available"
                }]
            }

            var options = {
                responsive: true,
                showTooltips: true
            };

            //Get the context of the canvas element we want to select
            var c = $('#cpuChart');
            if (c.size() > 0) {
                var cp = c.get(0).getContext('2d');
                cpuChart = new Chart(cp).Doughnut(cpuData, options);
            }

            var r = $('#ramChart');
            if (r.size() > 0) {
                var ra = r.get(0).getContext('2d');
                ramChart = new Chart(ra).Doughnut(ramData, options);
            }

            var i = $('#ipChart');
            if (i.size() > 0) {
                var ip = i.get(0).getContext('2d');
                ipChart = new Chart(ip).Doughnut(ipData, options);
            }
            var h = $('#instChart');
            if (h.size() > 0) {
                var hd = h.get(0).getContext('2d');
                hddChart = new Chart(hd).Doughnut(instData, options);
            }
        })

    };

    $("input[type=password]").keyup(function () {
        var ucase = new RegExp("[A-Z]+");
        var lcase = new RegExp("[a-z]+");
        var num = new RegExp("[0-9]+");

        if ($("#newPassword").val().length >= 8) {
            $("#8char").removeClass("glyphicon-remove");
            $("#8char").addClass("glyphicon-ok");
            $("#8char").css("color", "#00A41E");
        } else {
            $("#8char").removeClass("glyphicon-ok");
            $("#8char").addClass("glyphicon-remove");
            $("#8char").css("color", "#FF0004");
        }

        if (ucase.test($("#newPassword").val())) {
            $("#ucase").removeClass("glyphicon-remove");
            $("#ucase").addClass("glyphicon-ok");
            $("#ucase").css("color", "#00A41E");
        } else {
            $("#ucase").removeClass("glyphicon-ok");
            $("#ucase").addClass("glyphicon-remove");
            $("#ucase").css("color", "#FF0004");
        }

        if (lcase.test($("#newPassword").val())) {
            $("#lcase").removeClass("glyphicon-remove");
            $("#lcase").addClass("glyphicon-ok");
            $("#lcase").css("color", "#00A41E");
        } else {
            $("#lcase").removeClass("glyphicon-ok");
            $("#lcase").addClass("glyphicon-remove");
            $("#lcase").css("color", "#FF0004");
        }

        if (num.test($("#newPassword").val())) {
            $("#num").removeClass("glyphicon-remove");
            $("#num").addClass("glyphicon-ok");
            $("#num").css("color", "#00A41E");
        } else {
            $("#num").removeClass("glyphicon-ok");
            $("#num").addClass("glyphicon-remove");
            $("#num").css("color", "#FF0004");
        }

        if (($("#newPassword").val() == $("#newPassword1").val() ) && $("#newPassword").val() != '' && $("#newPassword1").val() != '') {
            $("#pwmatch").removeClass("glyphicon-remove");
            $("#pwmatch").addClass("glyphicon-ok");
            $("#pwmatch").css("color", "#00A41E");
        } else {
            $("#pwmatch").removeClass("glyphicon-ok");
            $("#pwmatch").addClass("glyphicon-remove");
            $("#pwmatch").css("color", "#FF0004");
        }
    });
    // to Store current page into local storage
    if (typeof(Storage) !== "undefined") {
        // Store
        localStorage.setItem("LastURL", location.href);
    } else {
        document.getElementById("result").innerHTML = "Sorry, your browser does not support Web Storage...";
    }
    $("#NoVIMs").fadeTo(10000, 1000).slideUp(500, function(){
        $("#NoVIMs").slideUp(500);
    });
});
