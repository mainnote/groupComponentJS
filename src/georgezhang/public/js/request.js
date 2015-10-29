define(['jquery', 'group'
	], function ($, Grp) {
	var Request = Grp.obj.create('Request');
	Request.extend({
		connect : function (opt) {
			$.ajax({
				url : opt.request_url,
				method : opt.request_method,
				data : opt.request_data,
				dataType : 'json',
				context : this,
			})
			.done(opt.request_done)
			.fail(opt.request_fail)
			.always(opt.request_always);
		},
	});

	return Request;
});
