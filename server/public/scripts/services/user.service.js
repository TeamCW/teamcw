myApp.service('UserService', function ($http, $location) {
    console.log('UserService Loaded');
    var self = this;
    self.userObject = {};
    self.users = {data: []};
    self.editingUser = false;

    self.getuser = function () {
        $http.get('/user').then(function (response) {
            if (response.data.username) {
                // user has a current session on the server
                console.log(response.data);
                self.userObject.userName = response.data.username;
                self.userObject.role = response.data.role;
            } else {
                console.log('UserService -- getuser -- failure');
                // user has no session, bounce them back to the login page
                $location.path("/home");
            }
        }, function (response) {
            console.log('UserService -- getuser -- failure: ', response);
            $location.path("/home");
        });
    };

    self.getadmin = function () {
        $http.get('/user/admin').then(function (response) {
            if (response.data.username) {
                // user has a current session on the server
                console.log(response.data);
                self.userObject.userName = response.data.username;
                self.userObject.role = response.data.role;
            } else {
                console.log('UserService -- getuser -- failure');
                // user has no session, bounce them back to the login page
                $location.path("/home");
            }
        }, function (response) {
            console.log('UserService -- getuser -- failure: ', response);
            $location.path("/home");
        });
    };

    self.getowner = function () {
        $http.get('/user/owner').then(function (response) {
            if (response.data.username) {
                // user has a current session on the server
                console.log(response.data);
                self.userObject.userName = response.data.username;
                self.userObject.role = response.data.role;
            } else {
                console.log('UserService -- getuser -- failure');
                // user has no session, bounce them back to the login page
                $location.path("/home");
            }
        }, function (response) {
            console.log('UserService -- getuser -- failure: ', response);
            $location.path("/home");
        });
    };

    self.logout = function () {
        console.log('UserService -- logout');
        $http.get('/user/logout').then(function (response) {
            console.log('UserService -- logout -- logged out');
            self.userObject = {};
            $location.path("/home");
        });
    };

    self.refreshUsers = function () {
        $http.get('/user/refreshUser').then(function (response) {
            self.users.data = response.data;
        });
    };

    self.deleteUser = function (e_id) {
        $http.delete('/user/'+ e_id).then(function(response) {
            console.log('Deleted User');
            self.refreshUsers();
        }).catch(function(err) {
            console.log('Failed to delete user.');
        });
    };

    self.userToEdit = {
        e_id: '',
        firstname: '',
        lastname: '',
        o_id: null,
        role: '',
        username: '',
        employeeId: '',
        email: ''
    };
//how to create superuser without register
    self.editUser = function (user) {
        console.log('editing this user',user);
        self.userToEdit = {
            e_id: user.e_id,
            firstname: user.firstname,
            lastname: user.lastname,
            o_id: user.o_id,
            role: user.role,
            username: user.username,
            employeeId: user.e_id,
            email: user.email
        };
        console.log(self.userToEdit);
        self.editingUser = true;
        $location.path('/register');
    };

    self.saveUserEdit = function () {
        console.log(self.userToEdit);
        $http.put('/user/' + self.userToEdit.employeeId, self.userToEdit).then(function(response) {
            console.log('User Edited');
            self.refreshUsers();
            $location.path('/admin');
        });
    };

    self.requestPasswordChange = function (email) {
        return $http.post('/user/password-reset', {email: email});
    };

    self.resetPassword = function (code, password) {
        return $http.put('/user/password-reset', {code: code, password: password});
    };
});
