define(['jquery', 'component', 'fineuploader', 'tpl!templates/upload'
	], function ($, Component, qq, tpl) {
    var Upload = Component.create('Upload');
    Upload.extend({
        tpl: tpl,
        defaultOpt: {
            upload_label_class: 'upload_label_class',
            upload_label_name: '',
            upload_endpoint: '/api/upload',
            upload_waitingPath: '/img/waiting-generic.png',
            upload_notAvailablePath: '/img/not_available-generic.png',
        },
        setup: function (opt) {
            var fineuploader = this.comp.find('.fineuploader');
            var handler = fineuploader.fineUploader($.extend({
                template: fineuploader.find('.qq-template-manual-trigger'),
                request: {
                    endpoint: opt.upload_endpoint,
                    customHeaders: opt.upload_customHeaders || {},
                },
                thumbnails: {
                    placeholders: {
                        waitingPath: opt.upload_waitingPath,
                        notAvailablePath: opt.upload_notAvailablePath,
                    }
                },
                autoUpload: false,
            }, opt.upload_options || {}));

            if (opt.upload_options && opt.upload_options.autoUpload) {
                fineuploader.find('.trigger-upload').remove();
            } else {
                fineuploader.find('.trigger-upload').on('click', function (evt) {
                    handler.fineUploader('uploadStoredFiles');
                });
            }
        }
    });

    return Upload;
});
