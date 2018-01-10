myApp.controller('DataUploadController', function ($location, DataService, UserService, UploadService) {
    var vm = this;
    var ds = DataService
    vm.uploader = UploadService.uploader;
    vm.uploaderOptions = ds.uploaderOptions;

    vm.dataUpload = function (options) {
        vm.uploader.uploadAll();
        swal (
            'Success',
            'Data has been uploaded',
            'success'
        );
    };
});