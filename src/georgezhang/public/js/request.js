define(['jquery', 'optObj', 'Promise'], function($, OptObj, Promise) {
    var Request = OptObj.create('Request');
    Request.extend({
        init: function(opt) {
            this.xhr = null;
        },
        abort: function(opt) {
            if (this.xhr) this.xhr.abort();
        },
        connect: function(opt) {
            var that = this;
            this.setOpt(opt);
            var params = {
                url: this.opt.request_url,
                method: this.opt.request_method,
                data: this.opt.request_data,
                dataType: 'json',
                contentType: this.opt.request_contentType || 'application/json'
            };
            if (opt.request_params && $.isPlainObject(opt.request_params)) {
                $.extend(params, opt.request_params);
            }

            if (!params.url) throw new TypeError('invalid URL in request');

            return new Promise(function(resolve, reject) {
                that.xhr = $.ajax(params)
                    .done(function(data, textStatus, jqXHR) {
                        return resolve(data);
                    })
                    .fail(function(jqXHR, textStatus, errorThrown) {
                        return reject(jqXHR.responseText || errorThrown);
                    });
            });
        },
        getJSON: function(opt) {
            console.log('getJSON');
            var that = this;
            return new Promise(function(resolve, reject) {
                that.xhr = $.getJSON(opt.url)
                    .done(function(data, textStatus, jqXHR) {
                        return resolve(data);
                    })
                    .fail(function(jqXHR, textStatus, errorThrown) {
                        return reject(jqXHR.responseText || errorThrown);
                    });
            });
        },
    });

    return Request;
});
