define(['jquery', 'optObj'], function($, OptObj) {
    var FormOption = OptObj.create('FormOption');
    FormOption.extend({
        get: function(opt) {
            throw new TypeError('Must override FormOption.get()!');
        },
        extractForm: function(opt) {},
    });
    return FormOption;
});
