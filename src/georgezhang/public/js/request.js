define(['jquery', 'group'
	], function ($, Grp) {
	var Request = Grp.obj.create('Request');
	Request.extend({
		post : function (opt) {
			opt.request_method = 'POST';
			this.connect(opt);
		},
		get : function (opt) {
			opt.method = 'GET';
			this.connect(opt);
		},
		connect : function (opt) {
			$.ajax({
				url : opt.request_url,
				method : opt.request_method,
				data : opt.request_data,
				dataType : 'json',
				context : this,
			})
			.done(request_done)
			.fail(opt.request_fail)
			.always(opt.request_always);
		},
	});

	return Request;
});
