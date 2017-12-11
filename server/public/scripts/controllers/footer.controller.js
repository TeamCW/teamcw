myApp.controller('FooterController',function(UserService) {
    console.log('FooterController created');
    var vm = this;
    vm.user = UserService;

    vm.logout = function (user){
        UserService.logout(user)
    }
  });