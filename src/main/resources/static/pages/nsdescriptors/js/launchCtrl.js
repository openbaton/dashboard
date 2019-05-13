var app = angular.module('app');

app.controller('LaunchCtrl', function (http, $scope, passedNsd, passedKeys, passedVims, $filter, $uibModalInstance, NgTableParams, $cookieStore) {
  var baseURL = $cookieStore.get('URL') + "/api/v1";
  var monitoringIp = [];
  var url = baseURL + '/ns-descriptors/';
  var urlRecord = baseURL + '/ns-records/';
  var urlVim = baseURL + '/datacenters/';
  var urlVNFD = baseURL + '/vnf-descriptors/';
  var urlForKeys = $cookieStore.get('URL') + "/api/v1/keys/";
  $scope.nsdToSend = passedNsd;
  $scope.tabs = [];
  $scope.keys = passedKeys;
  $scope.vimInstances = passedVims;
  $scope.vimForLaunch = {};
  $scope.selectedVNFD;
  $scope.launchKeys = [];
  $scope.launchObj = { "keys": [], configurations: {} };
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
  $scope.vnfdnames = [];
  $scope.tmpVnfd = [];
  $scope.elementName = "";
  $scope.basicConfiguration = { name: "", config: { name: "", configurationParameters: [] } };
  $scope.LastTabNSDLaunch = '';
  $scope.basicConf = { description: "", confKey: "", value: "" };
  $scope.launchPopVPAs = {};

  initAz();

  $scope.close = function () {
    $uibModalInstance.dismiss();
  };

  //Launch Model components
  function generateProduct(vnfdFiltered) {
    vims = vnfdFiltered.map(vpa => vpa.vim);
    vims = [...new Set(vims)];
    product = [];
    vims.forEach(function (vim) {
      launchP = { name: vim, zones: [] };
      p = vnfdFiltered.filter(vpa => vpa.vim == vim);
      p.map(pa => launchP.zones.push({ name: pa.az }));
      if (launchP.zones.length == 1 && launchP.zones[0].name == "") {
        launchP.zones = [];
      }
      product.push(launchP);
    });
    console.log(product);
    return product;
  };

  function genUniqueVPAs(vpas) {
    paS = [];
    vpas.map(vpa => paS.push({ vim: vpa.vim, az: vpa.az }));
    seenVim = [];
    seenAz = [];
    uniquePas = [];

    paS.forEach(function (pa) {
      if (!(seenVim.includes(pa.vim) && seenAz.includes(pa.az))) {
        uniquePas.push(pa);
        seenAz.push(pa.az);
        seenVim.push(pa.vim);
      }
    });
    return uniquePas;
  };

  function generateLaunchPopsVPA(vnfdname) {
    vnfdFiltered = [];
    if (vnfdname == "General") {
      vnfdFiltered = genUniqueVPAs($scope.vnfdPopAzList);
    } else {
      vnfdFiltered = $scope.vnfdPopAzList.filter(vpa => vpa.vnfd === vnfdname);
    }
    return generateProduct(vnfdFiltered);

  }

  function generateLaunchPopsVPAAssiged(vnfdname) {
    vnfdFiltered = [];
    if (vnfdname === "General") {
      uniqueAssigned = genUniqueVPAs($scope.vnfdPopAzListAssigned);
      uniqueUnAssigned = genUniqueVPAs($scope.vnfdPopAzList);
      console.log(uniqueAssigned);
      console.log(uniqueUnAssigned);
      uniqueAssigned.forEach(function (vpa) {
        if (!(uniqueUnAssigned.some(vpa1 => vpa1.vim == vpa.vim && vpa1.az == vpa.az))) {
          vnfdFiltered.push(vpa);
        }
      });
    } else {
      vnfdFiltered = $scope.vnfdPopAzListAssigned.filter(vpa => vpa.vnfd == vnfdname);
    }
    return vnfdFiltered;
  };

  function generateVPATuples() {
    $scope.vnfdPopAzList = [];
    vnfds = angular.copy($scope.nsdToSend.vnfd);
    console.log(vnfds);
    vims = angular.copy($scope.vimInstances);
    vims.forEach(function (vim) {
      if (angular.isUndefined(vim.zones)) {
        vim.zones = [];
      }
    });
    vnfds.forEach(function (vnfd) {
      vims.forEach(function (vim) {
        if (angular.isUndefined(vim.zones) || vim.zones.length < 1) {
          $scope.vnfdPopAzList.push({ vnfd: vnfd.name, vim: vim.name, az: "" });
        }
        vim.zones.forEach(function (zone) {
          $scope.vnfdPopAzList.push({ vnfd: vnfd.name, vim: vim.name, az: zone.name });
        });
      });
    });
    console.log($scope.vnfdPopAzList);
  };

  function initAz () {

    $scope.vimInstances.forEach(function(vim) {
      $scope.nsdToSend.vnfd.forEach(function(vnfd) {
        if (angular.isUndefined($scope.azVimInstance[vim.name])) {
          $scope.azVimInstance[vim.name] = {};
        }
        $scope.azVimInstance[vim.name][vnfd.name] = 'random';
      });
      $scope.azVimInstance[vim.name]['General'] = 'random';
    });      
    console.log($scope.azVimInstance);
  };


  $scope.addPopToVnfd = function (vnfd, pop) {

    filtered = $scope.vnfdPopAzList.filter(vpa => vpa.vnfd == vnfd.name && vpa.vim == pop.name);
    if (angular.isUndefined($scope.azVimInstance[pop.name]) || $scope.azVimInstance[pop.name][vnfd.name] == "" || $scope.azVimInstance[pop.name][vnfd.name].trim() === "random") {

      $scope.vnfdPopAzListAssigned = $scope.vnfdPopAzListAssigned.concat(filtered);
      $scope.vnfdPopAzList = $scope.vnfdPopAzList.filter(vpa => vpa.vnfd != vnfd.name || vpa.vim != pop.name);
      console.log("here");

    } else {
      filtered = filtered.filter(vpa => vpa.az === $scope.azVimInstance[pop.name][vnfd.name].trim());
      $scope.vnfdPopAzListAssigned = $scope.vnfdPopAzListAssigned.concat(filtered);
      $scope.vnfdPopAzList = $scope.vnfdPopAzList.filter(vpa => vpa.vnfd != vnfd.name || vpa.vim != pop.name || vpa.az != $scope.azVimInstance[pop.name][vnfd.name].trim());

    }
    $scope.tableParamsFilteredLaunchPops.reload();
    $scope.tableParamsFilteredPops.reload();

  }

  $scope.addPopToNsd = function (pop) {

    console.log($scope.azVimInstance);
    $scope.nsdToSend.vnfd.forEach(function (vnfd) {
      if (angular.isUndefined($scope.azVimInstance[pop.name]) || $scope.azVimInstance[pop.name]['General'] == "" || angular.isUndefined($scope.azVimInstance[pop.name]['General']) || $scope.azVimInstance[pop.name]['General'].trim() === "random") {
        $scope.azVimInstance[pop.name][vnfd.name] = "random";
      } else {
        $scope.azVimInstance[pop.name][vnfd.name] = $scope.azVimInstance[pop.name]['General'];
      }
      $scope.addPopToVnfd(vnfd, pop);
    });
    $scope.tableParamsFilteredLaunchPops.reload();
    $scope.tableParamsFilteredPops.reload();
  }



  $scope.removePopToVnfd = function (vnfd, pop) {
    $scope.vnfdPopAzList.push(pop);
    $scope.vnfdPopAzListAssigned = $scope.vnfdPopAzListAssigned.filter(vpa => vpa.vim != pop.vim || vpa.vnfd != pop.vnfd || vpa.az != pop.az);

    $scope.tableParamsFilteredLaunchPops.reload();
    $scope.tableParamsFilteredPops.reload();
  };
  $scope.RemovePoPfromNSD = function (pop) {
    $scope.nsdToSend.vnfd.forEach(vnfd => $scope.vnfdPopAzList.push({ vnfd: vnfd.name, vim: pop.vim, az: pop.az }));
    console.log($scope.vnfdPopAzList);
    $scope.vnfdPopAzListAssigned = $scope.vnfdPopAzListAssigned.filter(vpa => vpa.vim != pop.vim || vpa.az != pop.az);

    $scope.tableParamsFilteredLaunchPops.reload();
    $scope.tableParamsFilteredPops.reload();
    console.log($scope.launchPops);
  };





  var filteredLaunchKeys = [];
  $scope.tableParamsFilteredLaunchKeys = new NgTableParams({
    page: 1,
    count: 5,
    sorting: {
      name: 'asc'     // initial sorting
    },
    filter: { name: "" }
  },
    {
      counts: [],
      total: filteredLaunchKeys.length,
      getData: function (params) {
        filteredLaunchKeys = params.sorting() ? $filter('orderBy')($scope.launchKeys, params.orderBy()) : $scope.launchKeys;
        // filteredLaunchKeys = params.filter() ? $filter('filter')(filteredLaunchKeys, params.filter()) : filteredLaunchKeys;
        $scope.tableParamsFilteredLaunchKeys.total(filteredLaunchKeys.length);
        filteredLaunchKeys = filteredLaunchKeys.slice((params.page() - 1) * params.count(), params.page() * params.count());
        for (i = filteredLaunchKeys.length; i < params.count(); i++) {
          // filteredLaunchKeys.push({'name': ""})
        }
        return filteredLaunchKeys;
      }
    });

  var filteredKeys = []
  $scope.tableParamsFilteredKeys = new NgTableParams({
    page: 1,
    count: 5,
    sorting: {
      name: 'asc'     // initial sorting
    },
    filter: { name: "" },
  },
    {
      counts: [],
      total: filteredKeys.length,
      getData: function (params) {
        // console.log($scope.keys);
        filteredKeys = params.sorting() ? $filter('orderBy')($scope.keys, params.orderBy()) : $scope.keys;
        filteredKeys = params.filter() ? $filter('filter')(filteredKeys, params.filter()) : filteredKeys;
        $scope.tableParamsFilteredKeys.total(filteredKeys.length);
        filteredKeys = filteredKeys.slice((params.page() - 1) * params.count(), params.page() * params.count());
        for (i = filteredKeys.length; i < params.count(); i++) {
          // filteredKeys.push({'name': ""})
        }
        return filteredKeys;
      }
    });


  var filteredPops = [];
  $scope.tableParamsFilteredPops = new NgTableParams({
    page: 1,
    count: 5,
    sorting: {
      name: 'asc'     // initial sorting
    },
    filter: { name: "" }
  },
    {
      counts: [],
      total: filteredPops.length,
      getData: function (params) {
        vpa = generateLaunchPopsVPA($scope.selectedVnfd.name);
        filteredPops = params.sorting() ? $filter('orderBy')(vpa, params.orderBy()) : vpa;
        filteredPops = params.filter() ? $filter('filter')(filteredPops, params.filter()) : filteredPops;
        $scope.tableParamsFilteredPops.total(filteredPops.length);
        filteredPops = filteredPops.slice((params.page() - 1) * params.count(), params.page() * params.count());
        for (i = filteredPops.length; i < params.count(); i++) {
          // filteredPops.push({'name': ""})
        }
        return filteredPops;
      }
    });

  var filteredLaunchPops = [];
  $scope.selectedVnfd = "";
  $scope.tableParamsFilteredLaunchPops = new NgTableParams({
    page: 1,
    count: 5,
    sorting: {
      name: 'asc'     // initial sorting
    },
    filter: { name: "" },
  },
    {
      counts: [],
      total: filteredLaunchPops.length,
      getData: function (params) {
        vpa = generateLaunchPopsVPAAssiged($scope.selectedVnfd.name);
        filteredLaunchPops = params.sorting() ? $filter('orderBy')(vpa, params.orderBy()) : vpa;
        //filteredLaunchPops = params.filter() ? $filter('filter')(filteredLaunchPops, params.filter()) : filteredLaunchPops;
        $scope.tableParamsFilteredLaunchPops.total(filteredLaunchPops.length);
        filteredLaunchPops = filteredLaunchPops.slice((params.page() - 1) * params.count(), params.page() * params.count());
        for (i = filteredLaunchPops.length; i < params.count(); i++) {
          // filteredLaunchPops.push({'name': ""})
        }
        return filteredLaunchPops;
      }

    });
  launchOption();

  $scope.selectVnfd = function (vnfd) {
    if (vnfd === 'General') {
      vnfd = { 'name': 'General' }
    }
    $scope.selectedVnfd = vnfd;
    $scope.tableParamsFilteredLaunchPops.reload();
    $scope.tableParamsFilteredPops.reload();
    //console.log($scope.selectedVnfd);
  };

  //Launch preparation function

  function loadVnfdTabs() {
    $scope.tabs = [];
    var i;
    for (i = 0; i < $scope.nsdToSend.vnfd.length; i++) {
      newVNFD = { "vnfdname": $scope.nsdToSend.vnfd[i].name, "vim": [], "vduLevel": false, "vdu": [] };
      console.log(newVNFD);

      var tab = {};
      tab['id'] = i;
      tab['title'] = $scope.nsdToSend.vnfd[i].name;
      tab['active'] = true;
      tab['disabled'] = false;
      tab['vnfd'] = $scope.nsdToSend.vnfd[i];

      $scope.tabs.push(tab);
      console.log($scope.tabs);
    }
  };
  function launchOption() {
    env();
    $scope.launchConfiguration = null;
    $scope.launchConfiguration = { "configurations": {} };


    $scope.vnfdnames = [];
    generateVPATuples();
    $scope.nsdToSend.vnfd.map(function (vnfd) {
      $scope.vnfdnames.push(vnfd.name);
      if (vnfd.configurations === undefined || vnfd.configurations.length < 1) {
        $scope.launchConfiguration.configurations[vnfd.name] = { name: "", configurationParameters: [] };
      } else {
        $scope.launchConfiguration.configurations[vnfd.name] = angular.copy(vnfd.configurations);
      }
    });
    //console.log($scope.launchConfiguration.configurations);
    console.log($scope.vnfdnames);

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

    loadVnfdTabs();
    console.log($scope.nsdToSend)


  };







  //Dataload functions
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



  //Key wizard functions
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


  $scope.generateKeyInWizard = function (generateKeyName) {
    //console.log($scope.projectObj);
    http.postPlainKeyGeneration(urlForKeys + 'generate', generateKeyName)
      .success(function (response) {
        setTimeout(loadKeys(), 250);
        var key = document.createElement("a");
        key.download = generateKeyName + '.pem';
        key.href = 'data:application/x-pem-file,' + encodeURIComponent(response);
        document.body.appendChild(key);
        key.click()
        document.body.removeChild(key);
        http.get(baseURL + '/keys')
          .success(function (response) {
            var keys = response;
            // console.log(keys);
            var allocatedKey = keys.find(function (obj) {
              return obj.name == generateKeyName;
            });
            $scope.launchKeys.push(allocatedKey);
            remove($scope.keys, allocatedKey);
            $scope.tableParamsFilteredKeys.reload();
            $scope.tableParamsFilteredLaunchKeys.reload();
          });
        delete key;
        $scope.KeyGenerateSuccess = false;
        $scope.KeyGenerateSuccess = $scope.KeyGenerateSuccess ? false : true;
        $scope.generateKeyName = null;
      })
      .error(function (response, status) {
        $scope.KeyGenerateError = false;
        $scope.KeyGenerateError = $scope.KeyGenerateError ? false : true;
        $scope.generateKeyName = null;
      });
  };
  $scope.importKeyInWizard = function (keyName, pubKey) {
    newKey = { name: "", publicKey: "" };
    newKey.name = keyName;
    newKey.publicKey = pubKey;
    console.log(newKey);
    http.postImportKeys(urlForKeys, newKey)
      .success(function (response) {
        // setTimeout(loadTable(), 250);
        keyName = "";
        pubKey = "";
        //location.reload();
        loadKeys();
        $scope.KeyImportSuccess = false;
        $scope.KeyImportSuccess = $scope.KeyImportSuccess ? false : true;
        $scope.keyName = null;
        $scope.pubKey = null;
      })
      .error(function (response, status) {
        $scope.KeyImportError = false;
        $scope.KeyImportError = $scope.KeyImportError ? false : true;
        $scope.keyName = null;
        $scope.pubKey = null;
      });
  };
  $('#modalCreateNSDUploadjson').on('hidden.bs.modal', function () {
    $(this).find("input,textarea,select").val('').end();

  });


  $scope.launch = function () {
    removeEmptyConfs();
    vimForLaunch = prepareVIMs();
    console.log(JSON.stringify($scope.vimForLaunch));
    //console.log($scope.nsdToSend);
    $scope.launchObj.keys = [];
    $scope.launchObj.vduVimInstances = vimForLaunch;
    var monIp = $scope.monitoringIp;
    if (parseInt($scope.monitoringPort) > 0)
      monIp += ":" + $scope.monitoringPort;
    $scope.launchObj.monitoringIp = monIp;
    $scope.launchKeys.forEach(function (key) {
      $scope.launchObj.keys.push(key.name);
    });

    // $scope.launchObj.vduVimInstances = $scope.vimForLaunch;
    //console.log($scope.basicConfiguration.name);
    $scope.launchObj.configurations = {};
    $scope.launchObj.configurations = $scope.launchConfiguration.configurations;
    console.log(JSON.stringify($scope.launchObj));
    ret_object = {};
    ret_object.success = false;
    ret_object.message = "";
    ret_object.data_return = undefined;
    ret_object.status_return = undefined;
    
    http.post(urlRecord + $scope.nsdToSend.id, $scope.launchObj)
      .success(function (response) {
        ret_object.success = true;
        ret_object.message = "Created Network Service Record from Descriptor with id: \<a href=\'\#nsrecords\'>" + $scope.nsdToSend.id + "<\/a>";
        post_clean();
        $('.modal').modal('hide');
        $uibModalInstance.close(ret_object);

      })
      .error(function (data, status) {
        post_clean();
        ret_object.success = false;
        ret_object.data_return = data;
        ret_object.status_return = status
        $('.modal').modal('hide');
        $uibModalInstance.close(ret_object);

      });

  };


function post_clean() {
  $scope.launchKeys = [];
  $scope.launchObj = {};
  $scope.launchPops = {};
  $scope.vnfdToVIM.splice(0);
  $scope.launchConfiguration = { "configurations": {} };
  $scope.vnfdnames = [];
  $scope.monitoringIp = ''
  $scope.vnfdPopAzListAssigned = []
  $scope.vnfdPopAzList = [];
}

  function prepareVIMs() {
    vimForLaunch = {};
    $scope.nsdToSend.vnfd.forEach(function (vnfd) {
      vnfd.vdu.forEach(function (vdu) {
        vnfdFiltered = $scope.vnfdPopAzListAssigned.filter(pop => pop.vnfd === vnfd.name);
        vimForLaunch[vdu.name] = [];
        vnfdFiltered = vnfdFiltered.map(function(pop) {
          if (pop.az === '') {
            pop.az = 'random'
          }
          return pop;
        });
        vnfdFiltered.map(pop => vimForLaunch[vdu.name].push(pop.vim + ":" + pop.az));
      });
    });
    return vimForLaunch;

  }

  //Utils
  function remove(arr, item) {
    for (var i = arr.length; i--;) {
      if (arr[i].name === item.name) {
        arr.splice(i, 1);
      }
    }
  }



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

  $scope.changeIp = function (ip) {
    $scope.monitoringIp = ip;
  };

  $scope.changePort = function (port) {
    $scope.monitoringPort = port;
  };

  //Configuration
  function removeEmptyConfs() {
    for (var property in $scope.launchConfiguration.configurations) {
      if ($scope.launchConfiguration.configurations.hasOwnProperty(property)) {
        if (angular.isUndefined($scope.launchConfiguration.configurations[property].name) || $scope.launchConfiguration.configurations[property].name.length < 1) {
          delete $scope.launchConfiguration.configurations[property];
          continue;
        }
        for (i = $scope.launchConfiguration.configurations[property].configurationParameters.length - 1; i > -1; i--) {
          if (angular.isUndefined($scope.launchConfiguration.configurations[property].configurationParameters[i].confKey) || angular.isUndefined($scope.launchConfiguration.configurations[property].configurationParameters[i].value)
            || $scope.launchConfiguration.configurations[property].configurationParameters[i].confKey.length < 1 || $scope.launchConfiguration.configurations[property].configurationParameters[i].value.length < 1) {
            $scope.launchConfiguration.configurations[property].configurationParameters.splice(i, 1);

          }
        }
      }
    }

  }


  $scope.addConftoLaunchTmp = function (vnfdname, conf) {

    $scope.launchConfiguration.configurations[vnfdname].configurationParameters.push({
      description: conf.description,
      confKey: conf.confKey,
      value: conf.value
    });
    $scope.basicConf = { description: "", confKey: "", value: "" };

  };


  $scope.removeConf = function (index, vnfdname) {
    $scope.launchConfiguration.configurations[vnfdname].configurationParameters.splice(index, 1);
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
  $scope.launchConfiguration = { "configurations": {} };

  $scope.addConftoLaunch = function (vnfdname) {

    $scope.launchConfiguration.configurations[vnfdname].configurationParameters.push({
      description: "",
      confKey: "",
      value: ""
    });


  };

});
