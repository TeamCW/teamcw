myApp.service('DataService', function ($http, $location, $q) {
    var self = this;
    self.data = {
        data: '',
        inventory: '',
        vacancy: '',
        properties: '',
        allProperties: '',
        states: '',
        markets: '',
        property: ''
    };

    self.comments = {
        messages: ''
    }
    
    function uploadSuccess() {
        swal (
            'Success',
            'Data has been uploaded',
            'success'
        );
    }

    self.userObject = {};
    // posts selected csv file upload to url path
    self.uploaderOptions = {
        property: {
            url: '/data/csv/property/',
            onSuccess: uploadSuccess
        },
        city: {
            url: '/data/csv/city/',
            onSuccess: uploadSuccess
        },
        dataset: {
            url: '/data/csv/dataset/',
            onSuccess: uploadSuccess
        }
    };


    //Retrieve all properties
    self.getAllProperties = function() {
        // get the cache data instead of doing another call to the server
        if (self.data.allProperties) {
            return $q(function (resolve, reject) {
                resolve(self.data.allProperties);
            });
        }
    };

    //Retrieve State Dropdown on Homepage
    self.getStates = function () {
        return $http.get('/data/states').then(function (response) {
            self.data.states = response.data;
        }).catch(function (err) {
            console.log('Error retrieving all states', err);
        });
    };

    //Retrieve Market Dropdown on Homepage
    self.getMarkets = function (value) {
        return $http.get(`/data/markets/${value}`).then(function (response) {
            self.data.markets = response.data;
        }).catch(function (err) {
            console.log('Error retrieving all markets', err);
        });
    };

    //Retrieve data for table and inventory on Market Page
    self.getMarketData = function (value) {
        return $http.get(`/data/all?state=${value.state}&year=${value.year}&quarter=${value.quarter}&market=${value.market}`).then(function (response) {
            self.data.data = response.data;
        }).catch(function (err) {
            console.log('Error retrieving market data', err);
        });
    };

    //Return time-based absorption information for chart
    self.getAbsorptionData = function (value) {
        return $http.get(`/data/absorption?state=${value.state}&market=${value.market}`).then(function (response) {
            self.data.inventory = response.data;
        }).catch(function (err) {
            console.log('Error retrieving absorption', err);
        });
    };

    //Return time-based vacancy information for chart
    self.getVacancyData = function (value) {
        return $http.get(`/data/vacancy?state=${value.state}&market=${value.market}`).then(function (response) {
            self.data.vacancy = response.data;
        }).catch(function (err) {
            console.log('Error retrieving vacancy', err);
        });
    };

    //Return properties for market page map
    self.getMarketPropertyData = function (value) {
        return $http.get(`/data/marketproperties?state=${value.state}&year=${value.year}&quarter=${value.quarter}&market=${value.market}`).then(function (response) {
            self.data.properties = response.data;
        }).catch(function (err) {
            console.log('Error retrieving property data', err);
        });
    };

    //Return properties for market page map
    self.getProperty = function (value) {
        return $http.get(`/data/propertydata?state=${value.state}&year=${value.year}&quarter=${value.quarter}&market=${value.market}&propid=${value.id}`).then(function (response) {
            self.data.property = response.data;
        }).catch(function (err) {
            console.log('Error retrieving property data', err)
        })
    }

    //Post a comment on contact page
    self.postComment = function(value) {
        return $http.post(`/data/contact`, value).then(function (response){
        }).catch(function(err){
            console.log('Error posting comment', err);
        })
    }

    //Retrieve comments on administration page
    self.getComments = function() {
        $http.get(`/data/contact`).then(function(response){
            self.comments.messages = response.data;
        }).catch(function(err){
            console.log('Error retrieving messages', err)
        })
    }

    //Delete a message from the Administration Messages view
    self.deleteMessage = function (message) {
        return $http.delete('/data/contact/' + message.id).then(function(response){
        }).catch(function(err){
            console.log('Error deleting message', err)
        })
    }

});
