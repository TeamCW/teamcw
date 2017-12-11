myApp.controller('UserController', function (UserService, $location, $route) {
    console.log('UserController created');
    var vm = this;
    vm.userService = UserService;
    vm.userObject = UserService.userObject;
    vm.users = UserService.users;

    UserService.refreshUsers();

    vm.editUser = function (user) {
        UserService.editUser(user);
    }

    vm.deleteUser = function (user) {
        UserService.deleteUser(user.e_id);
    }

    vm.newUser = function (user){
        $location.path('/register')
    }
});