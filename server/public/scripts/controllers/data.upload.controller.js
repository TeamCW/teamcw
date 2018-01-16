myApp.controller('DataUploadController', function ($location, DataService, UserService, UploadService) {
    var vm = this;
    var ds = DataService
    vm.uploader = UploadService.uploader;
    vm.uploaderOptions = ds.uploaderOptions;

    // uploader from angular-fileupload
    // uploader options are in data.service.js
    vm.dataUpload = function () {
        vm.uploader.uploadAll();
    };
});