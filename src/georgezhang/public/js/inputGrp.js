define(['jquery', 'optGrp', 'input', 'request'
	], function ($, OptGrp, Input, Request) {
	var InputGrp = OptGrp.create('InputGrp');
	var input = Input.create('input');
	input.extend({
		checkValid : function (opt) {
			var that = this;
            var action = this.comp.find('input').attr('action');
			//request
			var opt_ = {
				request_url : action,
				request_method : 'GET',
				request_data : {value: opt.input_value},
				request_done : function (data, textStatus, jqXHR) {
					if (data.hasOwnProperty('error')) {
						that.getResult({
							invalidHints : data.error.message || data.error.code,
						});
					} else {
						that.getResult({
							invalidHints : false
						});
					}
				},
				request_fail : function (jqXHR, textStatus, errorThrown) {
					that.getResult({
						invalidHints : errorThrown,
					});
				},
				request_always : function (data_jqXHR, textStatus, jqXHR_errorThrow) {},
			};
			this.group.call('request', 'connect', opt_);
		},
	});

	var request = Request.create('request');
	InputGrp.join(input, request);
	InputGrp.setCallToMember('input');

	return InputGrp;
});
