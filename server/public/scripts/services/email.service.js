myApp.service('EmailService', function ($http, UploadService) {
    console.log('EmailService created');
    var self = this;

    self.data = {
        contacts: [],
        batches: [],
        viewBatch: 0
    };

    self.uploaderOptions = {
        url: '/email/csv/',
        onSuccess: function(response, status, headers) {
            console.log('hey');
            self.getEmailBatches()
            .then(function(){
                self.data.viewBatch = response.batchId;
            })
            console.log('set viewBatch', self.data.viewBatch);
            self.getContacts(response.batchId);
        }
    };
    
    self.getContacts = function (batchId) {
        var config = {
            params: {
                batchId: batchId
            }
        };
        return $http.get('/email/', config)
            .then(function (response) {
                console.log('Get email list response:', response.data);
                self.data.contacts = response.data;
                return response.data;
            })
            .catch(function (error) {
                console.log('failed to get email list:', error);
            });
    };


    // can probably get rid of this route
    self.getContact = function (email_id,index) {
        var config = {
            params: {
                email_id: email_id,
                index: index
            }
        };
        console.log('single record config',config);
        return $http.get('/email/single/', config)
        .then(function(response){
            console.log('single email refresh',response);
            
            self.data.contacts[response.data.index] = response.data.contact;
        });
    };

    self.clickEmailLink = function(contact,index){
        var config = {
            method: 'PUT',
            url: '/email/',
            params: {
                id: contact.email_id,
                index: index
            }
        };
        return $http(config)
        .then(function(response){
            console.log('click success');
            console.log('batch',response);
            self.data.contacts[response.data.index] = response.data.contact;
        });
    };

    self.toggleInsertLink = function (contact,index) {
        console.log(contact);
        var config = {
            method: 'PUT',
            url: '/email/insertlink/',
            params: {
                id: contact.email_id,
                market_link: contact.market_link,
                index: index
            }
        };
        console.log('toggleInsertLink config', config);
        return $http(config)
        .then(function(response){
            console.log('market_link toggle success', response.data);
            self.data.contacts[response.data.index] = response.data.contact;
        })
        .catch(function(error){
            console.log('error toggling link insert',error);
        });
    };

    self.emailClickthrough = function(eid){
        var config = {
            method: 'PUT',
            url:'/email/track',
            params: {
                eid: eid
            }
        };
        return $http(config)
        .then(function(response){
            //return the market associated with the email
            console.log(response.data);
            return response.data.market;
        })
        .catch(function(error){
            console.log('error in put route',error);
        });
    };

    self.getEmailBatches = function () {
        return $http.get('/email/batches/')
        .then(function(response) {
            self.data.batches = response.data;
            return self.data.batches;
        });
    };

    self.deleteEmailBatch = function(batch) {
        var config = {
            params: {
                batch_id: batch.batch_id
            }
        };
        return $http.delete('/email/batches', config)
        .then(self.getEmailBatches);
    }
});