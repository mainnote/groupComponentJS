define(['jquery', 'group', 'form', 'request'
	], function ($, Grp, Form, Request) {
	var FormGrp = Grp.group.create('FormGrp');
	var form = Form.create('form');
	form.extend({
		submit : function (opt) {
			if (!this.submitting) {
				this.submitting = true;
				var that = this;
				this.comp.find('.error').each(function (index) {
					$(this).remove();
				});
				var action = this.comp.attr('action');
				var method = this.comp.attr('method');
				var inputData = this.serializeArray();
				//request
				var opt_ = {
					request_url : action,
					request_method : method,
					request_data : inputData,
					request_done : function (data, textStatus, jqXHR) {
						var opt0 = {
							data : data
						};
						that.done(opt0);
					},
					request_fail : function (jqXHR, textStatus, errorThrown) {
						var opt0 = {
							error : errorThrown
						};
						that.error(opt0);
					},
					request_always : function (data_jqXHR, textStatus, jqXHR_errorThrow) {
                        that.always();
                    },
				};
				this.group.call('request', 'connect', opt_);
			}
		},
		error : function (opt) {
			this.comp.append('<div class="error">' + opt.error + '</div>');
		},

	});

	var request = Request.create('request');

	FormGrp.join(form, request);

	FormGrp.setCallToMember('form');

	return FormGrp;
});
