myApp.controller('EmailController', function (UserService, $location, UploadService, EmailService) {
    console.log('EmailController created');
    var self = this;
    self.userService = UserService;
    var es = EmailService;
    self.data = es.data;
    self.uploader = UploadService.uploader;
    self.uploaderOptions = es.uploaderOptions;

    self.emailUpload = function () {
        console.log('uploader options', self.uploaderOptions);
        console.log('uploader',self.uploader);
        self.uploader.uploadItem(0);
        $location.path('/email-list');
    };

    self.getBatchEmails = function (batch_id) {
        self.data.viewBatch = batch_id;
        es.getContacts(batch_id)
    }

    self.emailTemplate = function (contact) {
        var link = '';
        if (contact.market_link) {
            link = ' Here is a link to the ' + contact.market + ' market. http://localhost:5000/#/market/MN/' + encodeURI(encodeURI(contact.market)) + '/2017/3?eid='+ contact.email_id;
        }
        return 'mailto:' + contact.email + '?subject=Leasing%20Report&body=Good afternoon '+ contact.first +',%0D%0A I will be delivering our 2017 Facilities Leasing Report to corporate office users residing in the Minneapolis area within the next few weeks and am searching for the appropriate person in your office to deliver it to. I have attached a Market Snapshot from our 2016 edition for your review. ' + link  + ' %0D%0A %0D%0A What is the report: %0D%0A Following recent activity and new best practices in corporate real estate management, we have assembled a report that is useful for corporate users looking to evaluate their space needs in the upcoming 12-24 months, in addition to firms that would simply like to stay current with the national and local market. %0D%0A %0D%0A The report cites:%0D%0A   1. Average local asking rents from landlords %0D%0A   2. Average local operating costs and taxes %0D%0A   3. Average local tenant build-out allowances %0D%0A   4. Federal Accounting Standard Boards (FASB) changes and impacts to portfolio real estate %0D%0A   5. Recent Twin Cities major lease transactions %0D%0A   6. A market analysis for portfolio companies %0D%0A %0D%0AIt would be a big help if you can refer me an appropriate time to deliver the report or the appropriate person I should contact.    ';
    };

    self.toggleInsertLink = function (contact, index) {
        es.toggleInsertLink(contact,index);
    }

    self.clickEmailLink = function(contact,index) {
        es.clickEmailLink(contact,index);
    };

    self.getEmailBatches = function() {
        es.getEmailBatches()
        .then(function(batches) {
            console.log('batches',batches);
        });
    };

    self.deleteEmailBatch = function(batch) {
        console.log('Deleting batch',batch);
        self.data.contacts.length = 0;
        es.deleteEmailBatch(batch)
        .then(self.getEmailBatches);
    };

    self.getEmailBatches();
});
