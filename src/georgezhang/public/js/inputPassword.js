define(['jquery', 'component', 'input'
	], function ($, Component, Input) {
	var InputPassword = Input.create('InputPassword');
	InputPassword.extend({
		checkValid : function (opt) {
            if (opt.input_value.length < 6) {
                this.getResult({
                    invalidHints : 'Error: Password must contain at least six characters!',
                });
            } else if (!/[a-z]/.test(opt.input_value)) {
                this.getResult({
                    invalidHints : 'Error: password must contain at least one lowercase letter (a-z)!',
                });                
            } else if (!/[A-Z]/.test(opt.input_value)) {
                this.getResult({
                    invalidHints : 'Error: password must contain at least one uppercase letter (A-Z)!',
                });                
            } else if (!/[0-9]/.test(opt.input_value)) {
                this.getResult({
                    invalidHints : 'Error: password must contain at least one number (0-9)!',
                });                
            } else {
                this.getResult({
                    invalidHints : false
                });
            }
		}
	});

	return InputPassword;
});
