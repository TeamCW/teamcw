myApp.controller('NavController',function(UserService) {
    console.log('NavController created');
    var vm = this;
    vm.user = UserService;

    vm.logout = function() {
      UserService.logout()
    }
  });