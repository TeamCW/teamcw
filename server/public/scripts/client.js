var myApp = angular.module('myApp', ['ngRoute','angularFileUpload','ngMap']);

/// Routes ///
myApp.config(function ($routeProvider, $locationProvider) {
    $locationProvider.hashPrefix('');
    $routeProvider
        .when('/home', {
            templateUrl: '/views/templates/home.html',
            controller: 'HomeController as vm',
        })
        .when('/market', {
            templateUrl: '/views/templates/market.html',
            controller: 'MarketController as vm',
        })
        .when('/market/:state/:market/:year/:quarter', {
            templateUrl: '/views/templates/market.html',
            controller: 'MarketController as vm',
        })
        .when('/property/:state/:market/:year/:quarter/:id', {
            templateUrl: '/views/templates/property.html',
            controller: 'PropertyController as vm',
        })
        .when('/login', {
            templateUrl: '/views/templates/login.html',
            controller: 'LoginController as lc',
        })
        .when('/register', {
            templateUrl: '/views/templates/register.html',
            controller: 'LoginController as lc',
            resolve: {
                getuser: function (UserService) {
                    return UserService.getadmin();
                }
            }
        })
        .when('/admin', {
            templateUrl: '/views/templates/admin.html',
            controller: 'UserController as uc',
            resolve: {
                getuser: function (UserService) {
                    return UserService.getadmin();
                }
            }
        })
        .when('/data-upload',{
            templateUrl: '/views/templates/data-upload.html',
            controller: 'DataUploadController as vm',
            resolve: {
                getuser: function (UserService) {
                    return UserService.getuser();
                }
            }
        })
        .when('/office', {
            templateUrl: '/views/templates/office.html',
            controller: 'OfficeController as vm',
            resolve: {
                getuser: function (UserService) {
                    return UserService.getowner();
                }
            }
        })
        .when('/office-modify', {
            templateUrl: '/views/templates/office-create-edit.html',
            controller: 'OfficeController as vm',
            resolve: {
                getuser: function (UserService) {
                    return UserService.getowner();
                }
            }
        })
        .when('/email-upload', {
            templateUrl: '/views/templates/email-upload.html',
            controller: 'EmailController as vm',
            resolve: {
                getuser: function (UserService) {
                    return UserService.getuser();
                }
            }
        })
        .when('/email-history', {
            templateUrl: '/views/templates/email-history.html',
            controller: 'EmailController as vm',
            resolve: {
                getuser: function (UserService) {
                    return UserService.getuser();
                }
            }
        })
        .when('/email-list', {
            templateUrl: '/views/templates/email-list.html',
            controller: 'EmailController as vm',
            resolve: {
                getuser: function (UserService) {
                    return UserService.getuser();
                }
            }
        })
        .when('/forgot-password', {
            templateUrl: '/views/templates/forgot-password.html',
            controller: 'UserController as vm'
        })
        // www.domain.com/password-reset/123asdfa3f
        .when('/password-reset/:code', {
            templateUrl: '/views/templates/password-reset.html',
            controller: 'PasswordResetController as vm'
        })
        .otherwise({
            redirectTo: 'login'
        });
});
