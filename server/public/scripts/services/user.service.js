myApp.service('UserService', function ($http, $location) {
    console.log('UserService Loaded');
    var self = this;
    self.userObject = {};
    self.users = {data: []};
    self.editingUser = false;

    self.getuser = function () {
        $http.get('/user').then(function (response) {
            if (response.data.username) {
                // user has a curret session on the server
                self.userObject.userName = response.data.username;
            } else {
                console.log('UserService -- getuser -- failure');
                // user has no session, bounce them back to the login page
                $location.path("/home");
            }
        }, function (response) {
            console.log('UserService -- getuser -- failure: ', response);
            $location.path("/home");
        });
    },

    self.logout = function () {
        console.log('UserService -- logout');
        $http.get('/user/logout').then(function (response) {
            console.log('UserService -- logout -- logged out');
            self.userObject = {};
            $location.path("/home");
        });
    }

    self.refreshUsers = function () {
        $http.get('/user/refreshUser').then(function (response) {
            self.users.data = response.data;
        })
    }

    self.deleteUser = function (e_id) {
        $http.delete('/user/'+ e_id).then(function(response) {
            console.log('Deleted User');
            self.refreshUsers();
        }).catch(function(err) {
            console.log('Failed to delete user.');
        })
    }

    self.userToEdit = {
        e_id: '',
        firstname: '',
        lastname: '',
        office: '',
        role: '',
        username: '',
        employeeId: ''
    }
//how to create superuser without register
    self.editUser = function (user) {
        self.userToEdit = {
            e_id: user.e_id,
            firstname: user.firstname,
            lastname: user.lastname,
            office: user.office,
            role: user.role,
            username: user.username,
            employeeId: user.e_id
        }
        console.log(self.userToEdit);
        self.editingUser = true;
        $location.path('/register');
    }

    self.saveUserEdit = function () {
        console.log(self.userToEdit);
        $http.put('/user/' + self.userToEdit.employeeId, self.userToEdit).then(function(response) {
            console.log('User Edited');
            self.refreshUsers();
            $location.path('/admin');
        })
    }
});
