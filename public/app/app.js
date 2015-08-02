angular.module('SimpleRESTWebsite', ['angular-storage', 'ui.router', 'backand'])

.config(function(BackandProvider, $stateProvider, $urlRouterProvider, $httpProvider) {
    BackandProvider.manageDefaultHeaders();
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
        path = 'items/';

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
        ItemsModel.create(item)
            .then(function (result) {
                initCreateForm();
                getItems();
            });
    }

    function updateItem(item) {
        ItemsModel.update(item.Id, item)
            .then(function (result) {
                cancelEditing();
                getItems();
            });
    }

    function deleteItem(itemId) {
        ItemsModel.destroy(itemId)
            .then(function (result) {
                cancelEditing();
                getItems();
            });
    }

    function initCreateForm() {
        dashboard.newItem = { name: '', description: '' };
    }

    function setEditedItem(item) {
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

    initCreateForm();
    getItems();
});
