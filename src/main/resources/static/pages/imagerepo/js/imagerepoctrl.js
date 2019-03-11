var app = angular.module('app').controller('imagerepoctrl', function ($scope, serviceAPI, $routeParams, $http, $cookieStore, AuthService, $window, $interval, http) {

    var ip = $cookieStore.get('URL');
    var imagesURL = ip + "/api/v1/nfvimage"
    var dropzoneUrl = imagesURL;
    $scope.fileChosen = false;
    $scope.urlAllowed = true;
    $scope.image = [];
    loadImages();
    baseimageDescription = { name: "", url: "", diskFormat: "", containerFormat: "", minCPU: 0, minRam: 0, minDiskSpace: 0, isPublic: false }
    $scope.imageDescription = baseimageDescription;
    $scope.image = {};

    function loadImages() {
        if (angular.isUndefined($routeParams.imageId)) {
            http.get(imagesURL)
                .success(function (response, status) {
                    $scope.images = response;
                })
                .error(function (data, status) {
                    showError(data, status);

                });
        } else {
            http.get(imagesURL + '/' + $routeParams.imageId)
                .success(function (response, status) {
                    $scope.image = response;
                    console.log($scope.image);
                })
                .error(function (data, status) {
                    showError(data, status);

                });
        }
    }


    $scope.deleteImage = function (image) {
        http.delete(imagesURL + '/' + image.id)
            .success(function (response) {
                showOk('Image deleted');
                loadImages();
            })
            .error(function (response, status) {
                showError(response, status);
            });
    };


    function sendImage() {
        http.postWithParams(imagesURL, $scope.imageDescription)
            .success(function (response) {
                showOk('Uploaded image to NFVO');
                loadImages();
                $scope.imageDescription = baseimageDescription;
            })
            .error(function (data, status) {
                console.error('STATUS: ' + status + ' DATA: ' + JSON.stringify(data));
                showError(data, status);
            });
    }


    $scope.allset = function () {

    }



    /*$scope.$watch('imageDescription.name', function (newValue, oldValue) {
        if (angular.isUndefined(myDropzone)) {
            return;
        }
        myDropzone.options.params = $scope.imageDescription;
        console.log(myDropzone.options.params);
    });
    */


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
            header = { 'Authorization': 'Bearer ' + $cookieStore.get('token') };

        header['project-id'] = $cookieStore.get('project').id;
        var myDropzone = new Dropzone('#my-dropzone', {
            url: dropzoneUrl, // Set the url
            params: $scope.imageDescription,
            method: "POST",
            parallelUploads: 1,
            maxFiles: 1,
            previewTemplate: previewTemplate,
            autoProcessQueue: false, // Make sure the files aren't queued until manually added
            previewsContainer: "#previews", // Define the container to display the previews
            headers: header,
            init: function () {
                var submitButton = document.querySelector("#submit-all");
                myDropzone = this; // closure

                submitButton.addEventListener("click", function () {
                    $scope.$apply(function ($scope) {
                        if (myDropzone.options.params.url && myDropzone.options.params.url.length > 0) {
                            myDropzone.removeAllFiles(true);
                            sendImage();
                        } else {
                            delete (myDropzone.options.params.url);
                            myDropzone.processQueue();

                        }
                        loadImages();
                    });
                });
                this.on('maxfilesreached', function () {
                    $scope.fileChosen = true;

                });
                this.on('addedfile', function () {
                    $scope.fileChosen = true;

                });

                this.on('removedfile', function () {
                    $scope.fileChosen = false;

                });

                this.on("success", function (file, responseText) {
                    $scope.$apply(function ($scope) {
                        showOk("Uploaded the Image");
                        loadImages();
                        myDropzone.removeAllFiles(true);
                        $scope.imageDescription = baseimageDescription;
                    });

                });
                this.on("error", function (file, responseText) {
                    if (responseText === "Server responded with 500 code.") {
                        $scope.$apply(function ($scope) {
                            showError({ message: "error" }, 500);
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







    function showOk(msg) {
        $scope.alerts.push({ type: 'success', msg: msg });
        window.setTimeout(function () {
            for (i = 0; i < $scope.alerts.length; i++) {
                if ($scope.alerts[i].type == 'success') {
                    $scope.alerts.splice(i, 1);
                }
            }
        }, 5000);
        $('.modal').modal('hide');
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
            console.log(status + ' Status unauthorized')
            AuthService.logout();
        }
    }
    $('#Addimage').on('hidden.bs.modal', function () {


    });


    // to Store current page into local storage
    if (typeof (Storage) !== "undefined") {
        // Store
        localStorage.setItem("LastURL", location.href);
    } else {
        document.getElementById("result").innerHTML = "Sorry, your browser does not support Web Storage...";
    }

});
