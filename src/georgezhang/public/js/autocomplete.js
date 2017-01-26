define(['jquery', 'input', 'typeahead', 'bloodhound'
	], function ($, Input, typeahead, Bloodhound) {
    var Autocomplete = Input.create('Autocomplete');
    Autocomplete.extend({
        defaultOpt: $.extend({}, Autocomplete.defaultOpt, {
            input_class: 'typeahead',
            forceSelect: true,
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
            this.source = new this.bloodhound(opt_bloodhound);

            return $.extend({}, {
                source: this.source
            }, opt.source_opt || {});
        },
        setup: function (opt) {
            var that = this;
            this.inputElem = this.comp.find('input');

            var opt_typeahead = $.extend({}, {
                hint: true,
                highlight: true,
                minLength: 1,
                autoselect: true,
            }, opt.autocomplete_typeahead_opt || {});
            this.inputElem.typeahead(opt_typeahead, this.setDataSource(opt.autocomplete_bloodhound_opt || {}));

            this.comp.find('.typeahead.input-sm').siblings('input.tt-hint').addClass('hint-small');
            this.comp.find('.typeahead.input-lg').siblings('input.tt-hint').addClass('hint-large');

            //bind events
            this.input_hidden = $('<input type="hidden" name="' + this.inputElem.attr('name') + '_id">');
            if (opt.autocomplete_id) this.input_hidden.val(opt.autocomplete_id);
            this.comp.append(this.input_hidden);

            this.inputElem.bind('typeahead:select', function (ev, suggestion) {
                that.input_hidden.val(suggestion._id);
            });
            this.inputElem.bind('typeahead:change', function (ev) {
                var val = that.inputElem.typeahead('val');
                that.input_hidden.val('');
                if (val && val.length > 0 && that.opt.forceSelect) {
                    that.input_hidden.val('');
                    var skip = false;
                    that.source.search(val, function (datums) {
                        if (datums && datums.length > 0) {
                            skip = true;
                            that.input_hidden.val(datums[0]._id);
                            that.inputElem.typeahead('val', datums[0].name);
                        }
                    }, function (datums) {
                        if (!skip) {
                            if (datums && datums.length > 0) {
                                that.input_hidden.val(datums[0]._id);
                                that.inputElem.typeahead('val', datums[0].name);
                            }
                        }
                    });
                }
            });

            return this.comp;
        },
        checkValid: function (opt) {
            if (this.opt.forceSelect) {
                var input_hidden_id = this.input_hidden.val();
                if (input_hidden_id && input_hidden_id.length > 0) {
                    this.getResult({
                        invalidHints: false
                    });
                    return true;
                } else {
                    this.getResult({
                        invalidHints: 'invalid selection'
                    });
                    return false;

                }
            }
            return true;
        },
    });

    return Autocomplete;
});
