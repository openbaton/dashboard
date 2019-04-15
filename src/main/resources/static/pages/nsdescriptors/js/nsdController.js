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

app.controller('NsdCtrl', function ($scope, $compile, $cookieStore, $routeParams, $filter, http, serviceAPI, $window, $route, $interval, $http, topologiesAPI, AuthService, NgTableParams, http, $uibModal) {
    var baseURL = $cookieStore.get('URL') + "/api/v1";
    var monitoringIp = [];
    var url = baseURL + '/ns-descriptors/';
    var urlRecord = baseURL + '/ns-records/';
    var urlVim = baseURL + '/datacenters/';
    var urlVNFD = baseURL + '/vnf-descriptors/';
    var dropzoneUrl = baseURL + '/csar-nsd/';
    var urlForKeys = $cookieStore.get('URL') + "/api/v1/keys/"
    $scope.selectedVNFD = "";
    $scope.list = {};
    $scope.nsdToSend = {};
    $scope.textTopologyJson = '';
    $scope.file = '';
    $scope.alerts = [];
    $scope.vimInstances = [];
    $scope.keys = [];
    $scope.launchKeys = [];
    $scope.launchObj = {"keys": [], configurations: {}};
    $scope.launchNsdVim = [];
    $scope.launchPops = {};
    $scope.launchPopsAvailable = {};
    $scope.launchPopsGeneralAvailable = [];
    $scope.vnfdLevelVim = false;
    $scope.vnfdToVIM = [];
    $scope.vduLevelVim = [];
    $scope.vduToVIM = [];
    $scope.vduWithName = 0;
    $scope.azVimInstance = {};
    $scope.vnfdPopAzList = [];
    $scope.vnfdPopAzListAssigned = [];
    $scope.tmpVnfd = [];
    $scope.elementName = "";
    $scope.basicConfiguration = {name: "", config: {name: "", configurationParameters: []}};
    $scope.LastTabNSDLaunch = '';
    $scope.basicConf = {description: "", confKey: "", value: ""};
    $scope.launchPopVPAs = {};
    // to avoid the order of tables while it refresh in the background
    $scope.predicate = 'id';
    loadTable();
    loadKeys();
    loadVIMs();

    
    //Front table components

    var paginationNSD = [];
    $scope.tableParamspaginationNSD = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                name: 'asc'     // initial sorting
            },
            filter: {name: ""}
        },
        {
            counts: [],
            total: paginationNSD.length,
            getData: function (params) {
                paginationNSD = params.sorting() ? $filter('orderBy')($scope.nsdescriptors, params.orderBy()) : $scope.nsdescriptors;
                paginationNSD = params.filter() ? $filter('filter')(paginationNSD, params.filter()) : paginationNSD;
                $scope.tableParamspaginationNSD.total(paginationNSD.length);
                paginationNSD = paginationNSD.slice((params.page() - 1) * params.count(), params.page() * params.count());
                for (i = paginationNSD.length; i < params.count(); i++) {
                }
                return paginationNSD;
            }
        });


    
    

    //Data load functions
    function loadKeys() {
        http.get(baseURL + '/keys')
            .success(function (response) {
                $scope.keys = response;
            })
            .error(function (data, status) {
                showError(data, status);
            });

    }

    function loadVIMs() {
        var promise = http.get(urlVim)
            .success(function (response) {
                $scope.vimInstances = response;
                console.log($scope.vimInstances);
            })
            .error(function (data, status) {
                showError(data, status);
            });
        promise.then(console.log($scope.vimInstances));
        console.log($scope.vimInstances);
    }




    $scope.addLaunchKey = function (key) {
        $scope.launchKeys.push(key);
        console.log($scope.launchKeys);
        remove($scope.keys, key);
        $scope.tableParamsFilteredKeys.reload();
        $scope.tableParamsFilteredLaunchKeys.reload();
    };

    $scope.removeLaunchKey = function (key) {
        $scope.keys.push(key);
        remove($scope.launchKeys, key);
        $scope.tableParamsFilteredKeys.reload();
        $scope.tableParamsFilteredLaunchKeys.reload();
    };

    //Utils
    function remove(arr, item) {
        for (var i = arr.length; i--;) {
            if (arr[i].name === item.name) {
                arr.splice(i, 1);
            }
        }
    }

    $scope.selection = [];


    //Network service descriptor creator
    function checkPresence(link, links) {
        console.log(links);
        for (i = 0; i < links.length; i++) {
            console.log(links[i].name + " " + link.name);
            if (links[i].name === link.name) {
                return true;
            }
        }
        return false;

    }

    $scope.addTONSD = function (selectedVNFD) {
        console.log($scope.selectedVNFD);
        $scope.nsdCreateTmp.vnfd.push({id: selectedVNFD.id});
        $scope.tmpVnfd.push(angular.copy(selectedVNFD));


        selectedVNFD.virtual_link.map(function (link) {
            console.log(checkPresence(link, $scope.nsdCreateTmp.vld));
            if (!checkPresence(link, $scope.nsdCreateTmp.vld)) {
                $scope.nsdCreateTmp.vld.push(link);
            }


        });
    };


    $scope.saveDependency = function () {
        $scope.nsdCreateTmp.vnf_dependency.push(angular.copy($scope.dependency));
        $('#modalDependency').modal('hide');
    };
    $scope.deleteVNFDfromNSD = function (index) {
        $scope.tmpVnfd.splice(index, 1);
        $scope.nsdCreateTmp.vnfd.splice(index, 1);
    };
   
    $scope.vnfdList = [];

    $scope.dependency = {};
    $scope.dependency.parameters = [];

    $scope.addParam = function (par) {
        if (angular.isUndefined(par)) {
            return;
        }
        if (par.length > 0) {
            $scope.dependency.parameters.push(par);
        }
    };

    $scope.removeParam = function (index) {
        $scope.dependency.parameters.splice(index, 1);
    };

    $scope.addVld = function (vld) {
        if (vld) {
            $scope.nsdCreateTmp.vld.push({'name': vld});
        }
    };

    $scope.removeVld = function (index) {
        $scope.nsdCreateTmp.vld.splice(index, 1);
    };

    $scope.deleteDependency = function (index) {
        $scope.nsdCreateTmp.vnf_dependency.splice(index, 1);
    };

    $scope.isArray = function (obj) {
        if (angular.isArray(obj) || angular.isObject(obj))
            return false;
        else
            return true;
    };
    $scope.edit = function (obj) {
        $scope.editObj = obj;
    };

    $scope.updateObj = function () {
        http.put(url + $scope.editObj.id, $scope.editObj)
            .success(function (response) {
                showOk('Network Service Descriptor updated!');
                loadTable();
            })
            .error(function (data, status) {
                console.error('STATUS: ' + status + ' DATA: ' + JSON.stringify(data));
                showError(data, status);
            });
    };


    $scope.updateVNFD = function () {
        http.put(url + $routeParams.nsdescriptorId + '/vnfdescriptors/' + $scope.editObj.id, $scope.editObj)
            .success(function (response) {
                showOk('VNF Descriptor updated!');
                loadTable();
            })
            .error(function (data, status) {
                console.error('STATUS: ' + status + ' DATA: ' + JSON.stringify(data));
                showError(data, status);
            });
    };

    

    $scope.addLifecycleEvent = function (vdu) {
        vdu.lifecycle_event.push({'event': "CONFIGURE", 'lifecycle_events': []})
    };


    $scope.loadVNFD = function () {
        $scope.nsdCreateTmp = {};
        $scope.nsdCreateTmp.name = '';
        $scope.nsdCreateTmp.vendor = '';
        $scope.nsdCreateTmp.version = '';
        $scope.nsdCreateTmp.vnfd = [];
        $scope.nsdCreateTmp.vnf_dependency = [];
        $scope.nsdCreateTmp.vld = [];
        $scope.tmpVnfd = [];

        http.get(urlVNFD)
            .success(function (response, status) {
                $scope.vnfdList = response;
                //console.log(response);
                $('#modalCreateNSD').modal('show');
                $scope.selectedVNFD = $scope.vnfdList[0];
            })
            .error(function (data, status) {
                showError(data, status);
            });


    };

    $scope.loadVNFDUploadNSD = function () {
        $scope.nsdCreateTmp = {};
        $scope.nsdCreateTmp.name = '';
        $scope.nsdCreateTmp.vendor = '';
        $scope.nsdCreateTmp.version = '';
        $scope.nsdCreateTmp.vnfd = [];
        $scope.nsdCreateTmp.vnf_dependency = [];
        $scope.nsdCreateTmp.vld = [];
        $scope.tmpVnfd = [];

        http.get(urlVNFD)
            .success(function (response, status) {
                $scope.vnfdList = response;
                //console.log(response);
                $('#modalCreateNSDUploadjson').modal('show');
                $scope.selectedVNFD = $scope.vnfdList[0];
            })
            .error(function (data, status) {
                showError(data, status);
            });


    };

    $scope.toggleSelection = function toggleSelection(image) {
        var idx = $scope.selection.indexOf(image);
        if (idx > -1) {
            $scope.selection.splice(idx, 1);
        }
        else {
            $scope.selection.push(image);
        }
        //console.log($scope.selection);
        $scope.vduCreate.vm_image = $scope.selection;
    };


    $scope.deleteVDU = function (index) {
        $scope.vnfdCreate.vdu.splice(index, 1);
    };

    $scope.deleteVNFDependency = function (vnfd) {
        http.delete(url + $scope.nsdinfo.id + '/vnfdependencies/' + vnfd.id)
            .success(function (response) {
                showOk('Deleted VNF Dependecy with id: ' + vnfd.id);
                loadTable();
            })
            .error(function (data, status) {
                console.error('STATUS: ' + status + ' DATA: ' + data);
                showError(JSON.stringify(data), status);
            });

    };


    $scope.deleteVNFD = function (vnfd) {
        http.delete(url + $scope.nsdinfo.id + '/vnfdescriptors/' + vnfd.id)
            .success(function (response) {
                showOk('Deleted VNF Descriptors with id: ' + vnfd.id);
                loadTable();
            })
            .error(function (data, status) {
                console.error('STATUS: ' + status + ' DATA: ' + data);
                showError(JSON.stringify(data), status);
            });
    };


    if (!angular.isUndefined($routeParams.vnfdescriptorId))
        $scope.vnfdescriptorId = $routeParams.vnfdescriptorId;


    if (!angular.isUndefined($routeParams.vnfdependencyId))
        $scope.vnfdependencyId = $routeParams.vnfdependencyId;

    if (!angular.isUndefined($routeParams.vduId)) {
        $scope.vduId = $routeParams.vduId;
        //console.log($scope.vduId);
    }


    $scope.sendNSDCreate = function (nsdCreate) {
        $('.modal').modal('hide');
        http.post(url, $scope.nsdCreateTmp)
            .success(function (response) {
                showOk('Network Service Descriptor stored!');
                loadTable();
            })
            .error(function (data, status) {
                console.error('STATUS: ' + status + ' DATA: ' + JSON.stringify(data));
                showError(data, status);
            });
    };


    $scope.setFile = function (element) {
        $scope.$apply(function ($scope) {
            var f = element.files[0];
            if (f) {
                var r = new FileReader();
                r.onload = function (element) {
                    var contents = element.target.result;
                    $scope.file = contents;
                };
                r.readAsText(f);
            } else {
                alert("Failed to load file");
            }
        });
    };


    $scope.checkIP = function (str) {
        if (str === '')
            return true;
        else
            return /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$|^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])$|^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/.test(str);

    };

    $scope.showTab = function (value) {
        return (value > 0);
    };

    $scope.sendFile = function (textTopologyJson) {
        $('.modal').modal('hide');
        var postNSD;
        var sendOk = true;
        var type = 'topology';
        if ($scope.file !== '') {
            postNSD = $scope.file;
            if (postNSD.charAt(0) === '<')
                type = 'definitions';
            document.getElementById("formJson").reset();
        }
        else if (textTopologyJson !== '') {
            postNSD = textTopologyJson;
        }

        else {
            alert('Problem with NSD');
            sendOk = false;

        }
        if (sendOk) {
            if (type === 'topology') {
                console.log(postNSD);
                http.post(url, postNSD)
                    .success(function (response) {
                        showOk('Network Service Descriptors stored!');
                        loadTable();
                    })
                    .error(function (data, status) {
                        showError(data, status);
                    });
            }

            else {
                http.postXML('/api/rest/tosca/v2/definitions/', postNSD)
                    .success(function (response) {
                        showOk('Definition created!');
                        loadTable();
                        //                        window.setTimeout($scope.cleanModal(), 3000);
                    })
                    .error(function (data, status) {
                        showError(data, status);
                    });
            }
        }

        $scope.toggle = false;
        scope.textTopologyJson = '';
        $scope.file = '';
      
        $('#modalCreateNSDUploadjson').modal('hide');
    };


    $scope.isEmpty = function (obj) {
        if (angular.equals({}, obj))
            return true;
        else return angular.equals([], obj);
    };

    $scope.deleteNSD = function (data) {
        http.delete(url + data.id)
            .success(function (response) {
                showOk('Deleted Network Service Descriptor with id: ' + data.id);
                loadTable();
            })
            .error(function (data, status) {
                showError(data, status);
            });
    };
    $scope.addPoPtoNSD = function () {
        if (!$scope.vnfdLevelVim) {
            $scope.launchNsdVim.push($scope.vimInstances[0].name);
        }
    };
    $scope.clearPoPs = function () {
        $scope.launchNsdVim.splice(0);
    };
    $scope.addPoPtoVNFD = function (index) {
        if (!$scope.vnfdToVIM[index].vduLevel) {
            $scope.vnfdToVIM[index].vim.push($scope.vimInstances[0].name);
        }
    };

    $scope.clearPoPSVNFD = function (index) {
        $scope.vnfdToVIM[index].vim.splice(0);
    };

    $scope.addPoPtoVDU = function (index, parentindex) {
        $scope.vnfdToVIM[parentindex].vdu[index].vim.push($scope.vimInstances[0].name);
    };
    $scope.deletePoPfromVDU = function (parentparentindex, parentindex, index) {
        $scope.vnfdToVIM[parentparentindex].vdu[parentindex].vim.splice(index, 1);
    };
    $scope.launchConfiguration = {"configurations": {}};
    $scope.vnfdnames = [];
    $scope.addConftoLaunch = function (vnfdname) {

        $scope.launchConfiguration.configurations[vnfdname].configurationParameters.push({
            description: "",
            confKey: "",
            value: ""
        });


    };

   
    /*$scope.launchOption = function (data) {
        env();
        $scope.launchConfiguration = null;
        $scope.launchConfiguration = {"configurations": {}};


        $scope.vnfdnames = [];
        $scope.nsdToSend = data;
        generateVPATuples();
        $scope.nsdToSend.vnfd.map(function (vnfd) {
            $scope.vnfdnames.push(vnfd.name);
            if (vnfd.configurations === undefined || vnfd.configurations.length < 1) {
                $scope.launchConfiguration.configurations[vnfd.name] = {name: "", configurationParameters: []};
            } else {
                $scope.launchConfiguration.configurations[vnfd.name] = angular.copy(vnfd.configurations);
            }
        });
        //console.log($scope.launchConfiguration.configurations);
        console.log($scope.vnfdnames);
        loadKeys();
        $scope.launchPops = {};
        $scope.vnfdPopAzListAssigned = []
        $scope.vnfdToVIM.splice(0);
        $scope.vimForLaunch = {};
        $scope.vduWithName = 0;
        $scope.launchNsdVim.splice(0);
                
        $scope.tableParamsFilteredKeys.reload();
        $scope.tableParamsFilteredLaunchKeys.reload();

        $scope.tableParamsFilteredPops.reload();
        $scope.tableParamsFilteredLaunchPops.reload();

        $scope.loadVnfdTabs();
        console.log($scope.nsdToSend)

       
    };*/
    $scope.noVIMchoicePossible = false;


    env();

    function env() {
        http.get($cookieStore.get('URL') + '/env')
            .success(function (response) {
                monitoringIp = response['applicationConfig: [file:/etc/openbaton/openbaton-nfvo.properties]']['nfvo.monitoring.ip'];
                if (monitoringIp !== undefined && monitoringIp.indexOf(':') > -1) {
                    $scope.monitoringIp = monitoringIp.split(":")[0];
                    $scope.monitoringPort = monitoringIp.split(":")[1];
                } else {
                    $scope.monitoringIp = monitoringIp;
                    $scope.monitoringPort = "";
                }
            })
            .error(function (response, status) {
                showError(response, status);
            });
    }

    $scope.isInt = function (value) {
        return !isNaN(value) && (function(x) { return (x | 0) === x; })(parseFloat(value))
    };

    $scope.isValidPort = function (value) {
      return value === null || value === "" || ($scope.isInt(value) && (parseInt(value) > 0 && parseInt(value) < 65536));
    };

    
    

    $scope.Jsplumb = function () {
        http.get(url + $routeParams.nsdescriptorId)
            .success(function (response, status) {
                topologiesAPI.Jsplumb(response, 'descriptor');
            }).error(function (data, status) {
            showError(data, status);
        });

    };


    $scope.returnUptime = function (longUptime) {
        return serviceAPI.returnStringUptime(longUptime);
    };

    $scope.stringContains = function (k1, k2) {
        return k2.indexOf(k1) > -1;
    };


    $scope.closeAlert = function (index) {
        $scope.alerts.splice(index, 1);
    };

    /* -- multiple delete functions Start -- */

    $scope.multipleDeleteReq = function () {
        var ids = [];
        angular.forEach($scope.selection.ids, function (value, k) {
            if (value) {
                ids.push(k);
            }
        });
        //console.log(ids);
        http.post(url + 'multipledelete', ids)
            .success(function (response) {
                showOk('Items with id: ' + ids.toString() + ' deleted.');
                loadTable();
            })
            .error(function (response, status) {
                showError(response, status);
            });
        //$scope.selection.ids = [];
        $scope.multipleDelete = false;
        $scope.selection.ids = {};
        $scope.selection = {};
    };

    $scope.main = {checkbox: false};
    $scope.$watch('main', function (newValue, oldValue) {
        angular.forEach($scope.selection.ids, function (value, k) {
            $scope.selection.ids[k] = newValue.checkbox;
        });
    }, true);

    $scope.$watch('selection', function (newValue, oldValue) {
        //console.log(newValue);
        var keepGoing = true;
        angular.forEach($scope.selection.ids, function (value, k) {
            if (keepGoing) {
                if ($scope.selection.ids[k]) {
                    $scope.multipleDelete = false;
                    keepGoing = false;
                }
                else {
                    $scope.multipleDelete = true;
                }
            }

        });
        if (keepGoing)
            $scope.mainCheckbox = false;
    }, true);


    $scope.multipleDelete = true;

    $scope.selection = {};
    $scope.selection.ids = {};

    /* -- multiple delete functions END -- */

    function showError(data, status) {
        if (status === 500) {
            if (data.message === undefined || data.message === '')
                mes = 'An error occured and could not be handled properly, please, report to us and we will fix it as soon as possible';
            else
                mes = data.message;
            $scope.alerts.push({
                type: 'danger',
                msg: mes
            });
        }
        if (status === 403) {
            var tmpData = JSON.parse(data);
            console.log(tmpData.code + tmpData.message);
                mes = tmpData.message;
            $scope.alerts.push({
                type: 'danger',
                msg: mes
            });
        }
        else if (status === 400) {
            if (data !== undefined) {
                $scope.alerts.push({
                    type: 'danger',
                    msg: "Bad request: " + data.message
                });
            } else {
                console.log(data);
                $scope.alerts.push({
                    type: 'danger',
                    msg: "Error while uploading NSD, no message available... sorry :("
                });
            }
        }

        else {
            $scope.alerts.push({
                type: 'danger',
                msg: data.message + '. Error code: ' + status
            });
        }
        $('.modal').modal('hide');
        if (status === 401) {
            //console.log(status + ' Status unauthorized')
            AuthService.logout();
        }
    }
    function showOk(msg) {

        $scope.alerts.push({type: 'success', msg: msg});
        // location.reload();
        window.setTimeout(function () {
            for (i = 0; i < $scope.alerts.length; i++) {
                if ($scope.alerts[i].type === 'success') {
                    $scope.alerts.splice(i, 1);

                }
            }

        }, 5000);
        $('.modal').modal('hide');
    }

    function loadTable() {

        if (angular.isUndefined($routeParams.nsdescriptorId))
            http.get(url)
                .success(function (response, status) {
                    $scope.nsdescriptors = response;
                    $scope.tableParamspaginationNSD.reload();
                })
                .error(function (data, status) {
                    showError(data, status);

                });
        else
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

    function getSelectedText(name) {

        var selectedText = $scope.azVimInstance[name];
        if (selectedText === null || selectedText === undefined) {
            return ""
        }
        return ":" + selectedText.trim();
    }

    


    $scope.vnfdJSON = "";
    $scope.vnfdJSONname = "";
    $scope.copyJSON = function (vnfd) {
        $scope.vnfdJSONname = vnfd.name;
        $scope.vnfdJSON = vnfd;
        $scope.jsonrendVNFD()
    };

    function toShowOrNot(vimName) {
      list = Object.values($scope.launchPopsAvailable);
      list.every()

      
    }



    angular.element(document).ready(function () {


        var previewNode = document.querySelector("#template");
        if (previewNode === null) {
            console.log("no template");
            return;
        }
        previewNode.id = "";
        var previewTemplate = previewNode.parentNode.innerHTML;
        previewNode.parentNode.removeChild(previewNode);

        var header = {};

        if ($cookieStore.get('token') !== '')
            header = {'Authorization': 'Bearer ' + $cookieStore.get('token')};

        header['project-id'] = $cookieStore.get('project').id;
        var myDropzone = new Dropzone('#my-dropzone', {
            url: dropzoneUrl, // Set the url
            method: "POST",
            parallelUploads: 20,
            previewTemplate: previewTemplate,
            autoProcessQueue: false, // Make sure the files aren't queued until manually added
            previewsContainer: "#previews", // Define the container to display the previews
            headers: header,
            init: function () {
                var submitButton = document.querySelector("#submit-all");
                myDropzone = this; // closure

                submitButton.addEventListener("click", function () {
                    $scope.$apply(function ($scope) {
                        myDropzone.processQueue();
                        loadTable();
                    });
                });
                this.on("success", function (file, responseText) {
                    $scope.$apply(function ($scope) {
                        showOk("Uploaded the CSAR NSD");
                        loadTable();
                        myDropzone.removeAllFiles(true);
                    });

                });
                this.on("error", function (file, responseText) {
                    if (responseText === "Server responded with 500 code.") {
                        $scope.$apply(function ($scope) {
                            showError({message: "error"}, 500);
                        });
                    } else {
                        console.log(responseText);
                        $scope.$apply(function ($scope) {
                            showError(responseText, responseText.code);
                        });
                    }
                    myDropzone.removeAllFiles(true);
                });
            }
        });


        myDropzone.on("totaluploadprogress", function (progress) {
            $('.progress .bar:first').width = progress + "%";
        });

        myDropzone.on("sending", function (file, xhr, formData) {
            $('.progress .bar:first').opacity = "1";


        });


        myDropzone.on("queuecomplete", function (progress) {
            $('.progress .bar:first').opacity = "0";
            myDropzone.removeAllFiles(true);

        });


        $(".cancel").onclick = function () {
            myDropzone.removeAllFiles(true);
        };

    });
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

    $scope.jsonrendVNFD = function () {
        renderjson.set_icons('+', '-');
        renderjson.set_show_to_level(1);
        var jsonDiv = document.querySelector("#jsonvnfd");
        jsonDiv.append(
            renderjson($scope.vnfdJSON)
        );
    };
    $('#jsonInfoVNFD').on('hidden.bs.modal', function () {
        var jsonDiv = document.querySelector("#jsonvnfd");
        jsonDiv.childNodes[0].remove();

    });
    // to Store current page into local storage
    if (typeof(Storage) !== "undefined") {
        // Store
        localStorage.setItem("LastURL", location.href);
    } else {
        document.getElementById("result").innerHTML = "Sorry, your browser does not support Web Storage...";
    }
    ;
    $('.btnNext').click(function () {
        $('.nav-pills > .active').next('li').find('a').trigger('click');
    });

    $('.btnPrevious').click(function () {
        $('.nav-pills > .active').prev('li').find('a').trigger('click');
    });
    $(document).ready(function () {
        $(".nav-pills a").click(function () {
            $(this).tab('show');
        });
        $('.nav-pills a').on('shown.bs.tab', function (event) {
            $scope.LastTabNSDLaunch = $(event.target).text();         // active tab
            // console.log($scope.LastTabNSDLaunch);
        });
    });
    $('.btnNextCompNSD').click(function () {
        $('.CompsNSD > .active').next('li').find('a').trigger('click');
    });

    $('.btnPreviousCompsNSD').click(function () {
        $('.CompsNSD > .active').prev('li').find('a').trigger('click');
    });
    $(document).ready(function () {
        $(".CompsNSD  a").click(function () {
            $(this).tab('show');
        });
        $('.CompsNSD a').on('shown.bs.tab', function (event) {
            $scope.LastTabCompsNSD = $(event.target).text();         // active tab
            // console.log($scope.LastTabCompsNSD);
        });
    });
    
    $scope.openLaunchModal = function(nsd){
        var modalInstance = $uibModal.open({
          ariaLabelledBy: 'modal-title',
          ariaDescribedBy: 'modal-body',
          templateUrl: 'pages/nsdescriptors/modals/launchModal.html',
          size: "lg",
          controller: 'LaunchCtrl',
          windowClass: 'app-nsdlaunch-modal-window',
          resolve: {
            passedNsd: function() {
                return nsd;
            }, 
            passedVims: function() {
                return $scope.vimInstances;
            }, 
            passedKeys: function() {
                return $scope.keys;
            }
          }
        });
    
        modalInstance.result.then(function (selectedItem) {
          //$ctrl.selected = selectedItem;
        }, function () {
          //$log.info('Modal dismissed at: ' + new Date());
        });
      };
});
