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
                identify: function (obj) {
                    return obj._id;
                },
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

            //bind events
            var input_hidden = $('<input type="hidden" name="' + this.inputElem.attr('name') + '_id">');
            if (opt.autocomplete_id) this.input_hidden = opt.autocomplete_id;
            this.comp.append(input_hidden);
            this.inputElem.bind('typeahead:select', function (ev, suggestion) {
                input_hidden.val(suggestion._id);
            });
            this.inputElem.bind('typeahead:change', function (ev) {
                var val = that.inputElem.typeahead('val');
                if (!val || val == '') 
                    input_hidden.val('');
            });
            
            return this.comp;
        },
    });

    return Autocomplete;
});
