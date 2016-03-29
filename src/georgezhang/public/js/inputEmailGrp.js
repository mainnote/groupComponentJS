define(['jquery', 'inputGrp'
	], function ($, InputGrp) {
	var InputEmailGrp = InputGrp.create('InputEmailGrp');
    var input = InputEmailGrp.call('input', 'thisObj');
	var inputEmail = InputEmailGrp.call('input', 'create');
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

	inputEmail.extend({
		checkValid : function (opt) {
            if (re.test(opt.input_value)) {
                input.checkValid.call(this, opt);
            }
		},
	});
    
	InputEmailGrp.override(inputEmail);

	return InputEmailGrp;
});
