define(['jquery', 'group', 'input', 'request'
	], function ($, Grp, Input, Request) {
	var InputGrp = Grp.group.create('InputGrp');
	var input = Input.create('input');
	input.extend({
		checkValid : function (opt) {
			var that = this;
			//request
			var opt_ = {
				request_url : '/',
				request_method : 'GET',
				request_data : {value: opt.value},
				request_done : function (data, textStatus, jqXHR) {
                    console.log(data);
					if (data.hasOwnProperty('error')) {
                        console.log('yes');
						that.getResult({
							invalidHints : data.error.message || data.error.code,
						});
					} else {
						this.getResult({
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
