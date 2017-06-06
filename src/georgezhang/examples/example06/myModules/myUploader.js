define(['jquery', 'upload'], function($, Upload){
    var upload = Upload.create('upload');
    var upload_setup = upload.setup;
    upload.extend({
        setup: function(opt){
            this.comp.before('<p class="section">Uploader Demo:</p>');
            return upload_setup.call(this, opt);
        }
    });

    upload.setOpt({
        upload_label_name: 'Add photos',
        upload_endpoint: './static/api.json', //to be replaced
        upload_waitingPath: './img/waiting-generic.png', //to be replaced
        upload_notAvailablePath: './img/not_available-generic.png', //to be replaced
    });
    return upload;
});
