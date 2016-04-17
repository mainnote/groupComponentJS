define(['jquery', 'optGrp', 'input', 'validUrl'
	], function ($, OptGrp, Input, ValidUrl) {
    var InputUrlGrp = OptGrp.create('InputUrlGrp');

    var validUrl = ValidUrl.create('validUrl');
    var inputUrl = Input.create('inputUrl');

    inputUrl.extend({
        checkValid: function (opt) {
            console.log('checking');
            var opt_ = {
                url: opt.input_value
            }
            if (!this.group.call('validUrl', 'checkValid', opt_)) {
                this.getResult({
                    invalidHints: 'Invalid URL'
                });
            } else {
                this.getResult({
                    invalidHints : false
                });
            }

        }
    });

    InputUrlGrp.join(inputUrl, validUrl);
    InputUrlGrp.setCallToMember('inputUrl');

    return InputUrlGrp;
});
