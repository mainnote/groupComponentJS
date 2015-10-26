define(['jquery', 'group', 'form', 'message', 'validation', 'request'
	], function ($, Grp, Form, Message, Validation, Request) {
	var FormGrp = Grp.group.create('FormGrp');
    var form = Form.create('form');
    form.extend({
        submit: function(opt){
            var that = this;
            var inputData = this.serializeArray();
            var url = opt.url;
            //request
            var opt_ = {
                request_url: url,
                request_data: inputData,
                request_done: function(data, textStatus, jqXHR){
                    var opt0 = {data: data};
                    that.done(opt0);
                },
                request_fail: function(jqXHR, textStatus, errorThrown){
                    var opt0 = {error: errorThrown};
                    that.error(opt0);
                },
                request_always: function(data_jqXHR, textStatus, jqXHR_errorThrow){
                    that.error();
                },
            };
            this.group.call('request', 'post', opt_);
        },
        done: function(opt){},
        error: function(opt){},
        always: function(opt){},
        
    });
    
    var request = Request.create('request');
    
    FormGrp.join(form, request);
    
    FormGrp.setCallToMember('form');
    
	return FormGrp;
});
