define(['jquery', 'autocomplete'], function($, Autocomplete) {
    var states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California',
        'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii',
        'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
        'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
        'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
        'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
        'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island',
        'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
        'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
    ];

    var autocomplete_states = Autocomplete.create('autocomplete_states');
    var autocomplete_states_setup = autocomplete_states.setup;
    autocomplete_states.extend({
        setup: function(opt){
            this.comp.before('<p class="section">Autocomplete Demo:</p>');
            return autocomplete_states_setup.call(this, opt);
        }
    });
    autocomplete_states.setOpt({
        input_placeholder: 'States of USA',
        input_id: 'input_state',
        input_name: 'input_state',
        autocomplete_bloodhound_opt: {
            engine_opt: {
                local: states,
                /* sample to for items with key
                    identify: function(obj) {
                        return obj._id;
                    },
                */
            },
            source_opt: {
                name: 'states',
            },
        },
    });
    return autocomplete_states;
});
