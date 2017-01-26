define(['jquery', 'optGrp', 'form', 'request', 'error'
	], function ($, OptGrp, Form, Request, Error) {
    var FormGrp = OptGrp.create('FormGrp');
    var form = Form.create('form');
    var form_checkValid = form.checkValid;
    form.extend({
        submit: function (opt) {
            if (!this.submitting && this.checkValid()) {
                this.submitting = true;
                var that = this;
                this.comp.find('.error').each(function (index) {
                    $(this).remove();
                });
                var id;
                if (this.opt && this.opt.doc && this.opt.doc._id) id = this.opt.doc._id;
                var action = (this.opt.form_action || this.comp.attr('action')) + (id || '');
                var method = this.opt.form_method || this.comp.attr('method');
                var inputData = this.serializeArray();
                //request
                var opt_ = {
                    request_url: action,
                    request_method: method,
                    request_data: inputData,
                };
                return this.group.call('request', 'connectAsync', opt_)
                    .then(function (data) {
                        var opt0 = {
                            data: data
                        };

                        return that.done(opt0);
                    })
                    .catch(function (err) {
                        return that.error({
                            error: err,
                        });
                    })
                    .finally(function () {
                        return that.always();
                    });
            }
        },
        checkValid: function (opt) {
            var validFlag = form_checkValid.call(this, opt);
            if (validFlag) {
                return true;
            } else {
                this.error({
                    error: 'Please correct error above.'
                });
            }
        },
        error: function (opt) {
            if ($.isPlainObject(opt.error)) {
                var error = Error.create('error');
                error.render($.extend(opt.error, {
                    container: $('<div class="error"></div>').appendTo(this.comp)
                }));
            } else {
                this.comp.append('<div class="error">' + opt.error + '</div>');
            }
        },

    });

    var request = Request.create('request');
	FormGrp.extend({
		render: function(opt) {
			this.call('form', 'render', opt);
		}
	});
    FormGrp.join(form, request);

    return FormGrp;
});
