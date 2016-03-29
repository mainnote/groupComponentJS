define(['jquery', 'optObj'
	], function ($, OptObj) {
    var Request = OptObj.create('Request');
    Request.extend({
        defaultOpt: {},
        opt: {},
        connect: function (opt) {
            this.setOpt(opt);
            
            $.ajax({
                    url: this.opt.request_url,
                    method: this.opt.request_method,
                    data: this.opt.request_data,
                    dataType: 'json'
                })
                .done(this.opt.request_done)
                .fail(this.opt.request_fail)
                .always(this.opt.request_always);
        },
        setOpt: function (opt) {
            this.opt = $.extend({}, this.opt, opt);
        },
    });

    return Request;
});
