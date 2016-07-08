define(['jquery', 'optGrp', 'input', 'request'
	], function ($, OptGrp, Input, Request) {
    var InputGrp = OptGrp.create('InputGrp');
    var input = Input.create('input');
    input.extend({
        checkValid: function (opt) {
            var that = this;
            var action = this.comp.find('input').attr('action');
            //request
            var opt_ = {
                request_url: action,
                request_method: 'GET',
                request_data: {
                    value: opt.input_value
                },
            };
            this.group.call('request', 'connectAsync', opt_)
                .then(function (data) {
                    that.getResult({
                        invalidHints: false
                    });
                })
                .catch(function (err) {
                    if ($.isObject(err)) {
                        err = err.message || err.code || JSON.stringify(err);
                    }
                    that.getResult({
                        invalidHints: err,
                    });
                });
            return true; //skip waiting for remote validation if submit
        },
    });

    var request = Request.create('request');
    InputGrp.join(input, request);
    InputGrp.setCallToMember('input');

    return InputGrp;
});
