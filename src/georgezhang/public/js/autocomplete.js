define(['jquery', 'input', 'typeahead', 'bloodhound'
	], function ($, Input, typeahead, Bloodhound) {
    var Autocomplete = Input.create('Autocomplete');
    Autocomplete.extend({
        defaultOpt: $.extend({}, Autocomplete.defaultOpt, {
            input_class: 'typeahead',
        }),
        bloodhound: Bloodhound,
        setDataSource: function (opt) {
            // constructs the suggestion engine
            var opt_bloodhound = $.extend({}, {
                datumTokenizer: this.bloodhound.tokenizers.whitespace,
                queryTokenizer: this.bloodhound.tokenizers.whitespace,
            }, opt.engine_opt || {});
            var source = new this.bloodhound(opt_bloodhound);

            return $.extend({}, {
                source: source
            }, opt.source_opt || {});
        },
        setup: function (opt) {
            var that = this;
            this.inputElem = this.comp.find('input');

            var opt_typeahead = $.extend({}, {
                hint: true,
                highlight: true,
                minLength: 1
            }, opt.autocomplete_typeahead_opt || {});
            this.inputElem.typeahead(opt_typeahead, this.setDataSource(opt.autocomplete_bloodhound_opt || {}));

            this.comp.find('.typeahead.input-sm').siblings('input.tt-hint').addClass('hint-small');
            this.comp.find('.typeahead.input-lg').siblings('input.tt-hint').addClass('hint-large');

            return this.comp;
        },
    });

    return Autocomplete;
});
