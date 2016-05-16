angular.module('SimpleRESTWebsite', ['angular-storage', 'ui.router', 'backand'])

.config(function(BackandProvider, $stateProvider, $urlRouterProvider, $httpProvider) {
    //BackandProvider.setAnonymousToken('Your Anonymous Token');
    //BackandProvider.setSignUpToken('Your SignUp Token');
    $stateProvider
        .state('login', {
            url: '/login',
            templateUrl: 'app/templates/login.tmpl.html',
            controller: 'LoginCtrl',
            controllerAs: 'login'
        })
        .state('dashboard', {
            url: '/dashboard',
            templateUrl: 'app/templates/dashboard.tmpl.html',
            controller: 'DashboardCtrl',
            controllerAs: 'dashboard'
        });

    $urlRouterProvider.otherwise('/dashboard');

    $httpProvider.interceptors.push('APIInterceptor');
})
.service('APIInterceptor', function($rootScope, $q) {
    var service = this;

    service.responseError = function(response) {
        if (response.status === 401) {
            $rootScope.$broadcast('unauthorized');
        }
        return $q.reject(response);
    };
})

.service('ItemsModel', function ($http, Backand) {
    var service = this,
        tableUrl = '/1/objects/',
        path = 'items/',
        baseActionUrl = tableUrl + 'action/',
        filesActionName = 'otherFiles';

    function getUrl() {
        return Backand.getApiUrl() + tableUrl + path;
    }

    function getUrlForId(itemId) {
        return getUrl(path) + itemId;
    }

    service.all = function () {
        return $http.get(getUrl());
    };

    service.fetch = function (itemId) {
        return $http.get(getUrlForId(itemId));
    };

    service.create = function (item) {
        return $http.post(getUrl(), item);
    };

    service.create2 = function (item) {
            var randomFileName = "bigFileImage"+Math.floor((Math.random() * 10 + 1) + 1 )+ Math.floor((Math.random() * 10 + 1) + 1) + item.bigPictureName;//file.name;
        return $http({
            method: 'POST',
            url : Backand.getApiUrl() + baseActionUrl +  path,
            params:{
                "name": filesActionName
            },
            headers: {
                'Content-Type': 'application/json'
            },
            // you need to provide the file name and the file data
            data: {
                "filename": randomFileName,
                "filedata": item.bigPictureBase.substr(item.bigPictureBase.indexOf(',') + 1, item.bigPictureBase.length), //need to remove the file prefix type
            }
        })
        };

    service.deleteOldFile = function(item, deleteFileName){
               return $http({
                    method: 'DELETE',
                    url : Backand.getApiUrl() + baseActionUrl +  path,
                    params:{
                        "name": filesActionName
                    },
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    // you need to provide the file name 
                    data: {
                        "filename": deleteFileName
                    }
                });
        }

    service.update = function (itemId, item) {
        return $http.put(getUrlForId(itemId), item);
    };

    service.destroy = function (itemId) {
        return $http.delete(getUrlForId(itemId));
    };
})

.controller('LoginCtrl', function($rootScope, $state, Backand){
    var login = this;

    function signin() {
        Backand.setAppName(login.appName);

        Backand.signin(login.email, login.password)
            .then(function() {
                $rootScope.$broadcast('authorized');
                $state.go('dashboard');
            }, function(error) {
                console.log(error);
            });
    }

    login.newUser = false;
    login.signin = signin;
})

.controller('MainCtrl', function ($rootScope, $state, Backand) {
    var main = this;

    function logout() {
        Backand.signout()
            .then(function(){
                $state.go('login');
            })
    }

    $rootScope.$on('unauthorized', function() {
        $state.go('login');
    });

    main.logout = logout;
})

.controller('DashboardCtrl', function(ItemsModel){
    var dashboard = this;
    function getItems() {
        ItemsModel.all()
            .then(function (result) {
                dashboard.items = result.data.data;
            });
    }

    function createItem(item) {
            if(item.bigPictureName == "") {
                ItemsModel.create(item)
                .then(function (result) {
                    initCreateForm();
                    getItems();
                });  
            } else {
                ItemsModel.create2(item)
                .then(function (result) {
             item.bigPictureUrl = result.data.url;
             ItemsModel.create(item)
                    .then(function(result) {
//                        console.log('create success')
                        initCreateForm();
                        getItems();
                    })
                });
            }
// ugly clear
        var a = document.getElementById('showPic');
        a.src="";
        var b = document.getElementById('showPic2');
        b.src = "";
        } 
        
    function updateItem(item) {

        if (!item.bigPictureUrlLast) {
            if(item.bigPictureName) {
            //    console.log('case1 no last imageLoaded');
            ItemsModel.create2(item)
                .then(function(result){
                    item.bigPictureUrl = result.data.url;
                    ItemsModel.update(item.id, item)
                        .then(function (result) {
                        cancelEditing();
                        getItems();
                });
            })        
        }
            else {
              //  console.log('case2 imageLoaded');
            ItemsModel.update(item.id, item)
                .then(function (result) {
                    cancelEditing();
                    getItems();
                });
            }
        } else {
            if(!item.bigPictureName) {
            //console.log('case3 imageLast but not update');
            ItemsModel.update(item.id, item)
                .then(function (result) {
                    cancelEditing();
                    getItems();
                });
            } else{
                var compare = item.bigPictureUrlLast.slice(48);    

                if(item.bigPictureName !== compare) {
                    ItemsModel.deleteOldFile(item, compare).then(function(){
                         console.log('last file deleted');
                        ItemsModel.create2(item)
                        .then(function(result){
                            item.bigPictureUrl = result.data.url;
                        ItemsModel.update(item.id, item)
                            .then(function (result) {
                        cancelEditing();
                        getItems();
                    });
                        })
                    })    
            } else {
                //console.log('case5 imageLoaded same');
            ItemsModel.update(item.id, item)
                .then(function (result) {
                    cancelEditing();
                    getItems();
                });
            }
        }
    }
}

    function deleteItem(item) {

            if(!item.bigPictureUrl) {
                ItemsModel.destroy(item.id)
                .then(function (result) {
                    cancelEditing();
                    getItems();
                });   
            } else {
                var deleteFileName = item.bigPictureUrl.slice(34);
                ItemsModel.deleteOldFile(item, deleteFileName)

                  .then(function(){
                    console.log('file deleted');
                    ItemsModel.destroy(item.id)
                        .then(function (result) {
                    cancelEditing();
                    getItems();
                });
                })
            }
        }

    function initCreateForm() {
        dashboard.newItem = {name: '', description: '', avatarBase:'', bigPictureUrl:'', bigPictureBase:'', bigPictureName:'', bigPictureUrlLast:''};
    }

    function setEditedItem(item) {
        item.bigPictureUrlLast =  item.bigPictureUrl;
        dashboard.editedItem = angular.copy(item);
        dashboard.isEditing = true;
    }

    function isCurrentItem(itemId) {
        return dashboard.editedItem !== null && dashboard.editedItem.Id === itemId;
    }

    function cancelEditing() {
        dashboard.editedItem = null;
        dashboard.isEditing = false;
    }

    function uploadFile() {
        var filesSelected = document.getElementById("myFile").files;
    if (filesSelected.length > 0) {
        var fileToLoad = filesSelected[0];
        if (fileToLoad.type.match("image.*") && fileToLoad.size < 100000 )
        {
            var fileReader = new FileReader();
            fileReader.onload = function(fileLoadedEvent) 
            {
                var imageLoaded = document.getElementById("showPic");
                imageLoaded.src = fileLoadedEvent.target.result;
            if(dashboard.isEditing) {
                dashboard.editedItem.avatarBase = fileLoadedEvent.currentTarget.result;
                console.log('test1');
            } else { 
                dashboard.newItem.avatarBase = fileLoadedEvent.currentTarget.result;
                console.log('test2');
            } 

            };
            fileReader.readAsDataURL(fileToLoad);
        } else {
            alert('file is not an image or exceed 1 Mb');
            }    
        }
    }

function uploadFile2() {
    var filesSelected = document.getElementById("myFile2").files;
    if (filesSelected.length > 0) {
        var fileToLoad = filesSelected[0];
        if (fileToLoad.type.match("image.*"))
        {
            var fileReader = new FileReader();
            fileReader.onload = function(fileLoadedEvent) 
            {
                var imageLoaded = document.getElementById("showPic2");
                imageLoaded.src = fileLoadedEvent.target.result;
                
            if(dashboard.isEditing) {
                dashboard.editedItem.bigPictureName = fileToLoad.name;
                dashboard.editedItem.bigPictureBase = fileLoadedEvent.currentTarget.result;

            } else {
                dashboard.newItem.bigPictureName = fileToLoad.name;
                dashboard.newItem.bigPictureBase = fileLoadedEvent.currentTarget.result;
            } 

            };
            fileReader.readAsDataURL(fileToLoad);
        } else {
            alert('file is not an image');
            }
        }
    }
    
    dashboard.items = [];
    dashboard.editedItem = null;
    dashboard.isEditing = false;
    dashboard.getItems = getItems;
    dashboard.createItem = createItem;
    dashboard.updateItem = updateItem;
    dashboard.deleteItem = deleteItem;
    dashboard.setEditedItem = setEditedItem;
    dashboard.isCurrentItem = isCurrentItem;
    dashboard.cancelEditing = cancelEditing;

    dashboard.uploadFile2 = uploadFile2;
    dashboard.uploadFile = uploadFile;

    initCreateForm();
    getItems();
})

.directive('customOnChange', function() {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var onChangeFunc = scope.$eval(attrs.customOnChange);
      element.bind('change', onChangeFunc);
    }
  };
});
