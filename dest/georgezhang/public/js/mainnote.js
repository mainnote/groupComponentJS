/*! groupjs 2015-10-13 */
!function(a,b){"function"==typeof define&&define.amd?define('group',[],function(){return a.Grp=b()}):"object"==typeof exports?module.exports=b():a.Grp=b()}(this,function(){Object.create||(Object.create=function(a){function b(){}if(arguments.length>1)throw new Error("Object.create implementation only accepts the first parameter.");return b.prototype=a,new b});var a={create:function(a){var b=Object.create(this);if(this.hasOwnProperty("parentNames")){b.parentNames=[];for(var c=this.parentNames.length,d=0;c>d;d++)b.parentNames.push(this.parentNames[d])}return this.hasOwnProperty("name")&&(b.hasOwnProperty("parentNames")||(b.parentNames=[]),b.parentNames.push(this.name),a||(a=this.name)),b.name=a,b},extend:function(){for(var a=0;a<arguments.length;a++){var b=arguments[a];for(var c in b)this[c]=b[c]}},command:function(){var a=this;return function(b,c){return"function"==typeof a[b]?a[b](c):a[b]}},thisObj:function(){return this}},b=a.create("group");b.extend({create:function(b){var c=a.create.apply(this,arguments);return c._buildMemberList(),c},_buildMemberList:function(){if(this._memberList){if(!this.hasOwnProperty("_memberList")){var a=this._memberList;this._memberList={};for(var b in a){var c=a[b],d=c("create");d.group=this,this._memberList[b]=d.command()}}}else this._memberList={}},join:function(){for(var a=0;a<arguments.length;a++){var b=arguments[a],c=b.create(b.name);c.group=this,this._memberList[b.name]=c.command()}},call:function(a,b,c){var d;if(a in this._memberList)return(d=this._memberList[a])(b,c);var e=this._memberList;for(var f in e){var d=e[f];if("function"==typeof d){var g=e[f]("thisObj");if(g.hasOwnProperty("parentNames"))for(var h=g.parentNames,i=h.length,j=0;i>j;j++)a===h[j]&&d(b,c)}}},setCallToMember:function(a,c){function d(a,b){"function"==typeof b[a]?e[a]=b[a].bind(b):e[a]=b[a]}var e=this,f=this.call(a,"thisObj");if(c)d(c,f);else for(var g in f)g in b||d(g,f)}});var c={obj:a,group:b};return c});
define('component',['jquery', 'group'
	], function ($, Grp) {
	var Component = Grp.obj.create('Component');
	Component.extend({
		defaultOpt : {},
		template : function (opt) {
			return this.tpl ? this.tpl(opt) : '';
		},

		render : function (opt) {
			var opt_ = $.extend({}, this.defaultOpt, opt);
			var comp = $(this.template(opt_));
			comp.appendTo(opt.container);
			this.comp = comp;
			return opt.noSetup ? this.comp : this.setup(opt);
		},

		setup : function (opt) {
			return this.comp;
		},
		remove : function (opt) {
			this.comp.remove();
		},
	});

	return Component;
});

define('text',{});
define('underscore',{});
define('tpl',{load: function(id){throw new Error("Dynamic load not allowed: " + id);}});

define('tpl!templates/count', [],function () { return function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<p></p>';
}
return __p;
}; });

define('count',['jquery', 'component', 'tpl!templates/count'
	], function ($, Component, tpl) {
	var Count = Component.create('Count');
	Count.extend({
        tpl: tpl,
        setup: function(opt) {
            var that = this;
            this.watchComp.on('input', function(e){
                e.preventDefault();
                e.stopPropagation();
                var val = $(this).val();
                var opt_ = {
                    val: val,
                };
                that.count(opt_);
            });
            return this.comp;
        },
        
		render : function (opt) {
			var showTpl = $(this.template());
			opt.comp.after(showTpl);
            this.comp = showTpl;
            this.watchComp = opt.comp;
            this.maxCount = opt.maxCount;
			return this.setup();
		},
        
        count: function(opt) {
            var count = opt.val.length;
            if (this.maxCount) {
                var remaining = this.maxCount - count;
                if (remaining < 0) {
                    this.overMaxCount(opt);
                } else {
                    this.comp.text(remaining + ' characters remaining');
                }
            } else {
                this.comp.text(count + ' characters totally');
            }
        },
        
        overMaxCount: function(opt) {
            this.watchComp.val(opt.val.substring(0, this.maxCount));
        },
	});

	return Count;
});

define('data',['jquery', 'group'
	], function ($, Grp) {
	var Data = Grp.obj.create('Data');
	Data.extend({
        value: null,
        update: function(opt) {
            this.value = opt.value;
            return this.command();
        },
        get: function(opt) {
            return this.value;
        },
	});

	return Data;
});
define('dataCollection',['jquery', 'group'
	], function ($, Grp) {
	var DataCollection = Grp.obj.create('DataCollection');
	DataCollection.extend({
        values: [],
		add : function (opt) {
            var that = this;
			if (opt.values) {
				if ($.isArray(opt.values)) {
                    $.each(opt.values, function(index, value){
                        var dataCmd = that.group.call('Data', 'create', 'dataCmd').command();
                        var opt_ = {
                            value: value,
                        };
                        var v = dataCmd('update', opt_);
                        that.values.push(v);
                    });
                } else {
                    var dataCmd = Data.create('dataCmd');
                    var opt_ = {
                        value: opt.values,
                    };
                    var v = dataCmd('update', opt_);
                    that.values.push(v);
                }
			}
            return this.values;
		},

	});

	return DataCollection;
});

define('dataCollectionGrp',['jquery', 'group', 'dataCollection', 'data'
	], function ($, Grp, DataCollection, Data) {
	var DataCollectionGrp = Grp.group.create('DataCollectionGrp');
    var DataCollection = DataCollection.create('DataCollection');
    var Data = Data.create('Data');
    DataCollectionGrp.join(DataCollection, Data);
    
    DataCollectionGrp.setCallToMember('DataCollection');

	return DataCollectionGrp;
});


define('tpl!templates/form', [],function () { return function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<form onsubmit="return false;">\r\n</form>';
}
return __p;
}; });

define('form',['jquery', 'component', 'tpl!templates/form'
	], function ($, Component, tpl) {
	var Form = Component.create('Form');
	Form.extend({
		tpl : tpl,
		setup : function (opt) {
			var that = this;
			if (opt.form_elements && $.isArray(opt.form_elements)) {
				var len = opt.form_elements.length;
				for (var i = 0; i < len; i++) {
					var comp = opt.form_elements[i];
                    var compOpt = comp.opt;
					if (!comp.hasOwnProperty('parentNames') || comp.parentNames.indexOf('Component') === -1) {
						var Comp = require(comp.elem);
						comp = Comp.create(comp.name);
					}
					this.add({
						compCmd : comp.command(),
                        compOpt: compOpt||{},
					});
				}
			}
			return this.comp;
		},

		add : function (opt) {
			var opt_ = $.extend({
				container : this.comp,
			}, opt.compOpt);
			opt.compCmd('render', opt_);
		},

		serialize : function (opt) {
            return this.comp.serialize();
        },

		serializeArray : function (opt) {
            return this.comp.serializeArray();
        },
	});

	return Form;
});


define('tpl!templates/item', [],function () { return function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<li>'+
((__t=( item_value ))==null?'':__t)+
'</li>';
}
return __p;
}; });

define('item',['jquery', 'component', 'tpl!templates/item'
	], function ($, Component, tpl) {
	var Item = Component.create('Item');
	Item.extend({
        tpl: tpl,
        dataCmd: null,
        list: null,
        render: function(opt) {
            this.dataCmd = opt.item_data;
            this.list = opt.list;
            var opt_ = {
                    container: opt.container,
                    noSetup: opt.noSetup,
                    item_value: this.dataCmd('get'),
                };
            return Component.render.call(this, opt_);
        },
	});
    
    return Item;
});


define('tpl!templates/list', [],function () { return function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<ul></ul>';
}
return __p;
}; });

define('list',['jquery', 'component', 'tpl!templates/list',
	], function ($, Component, tpl) {
	var List = Component.create('List');
	List.extend({
		tpl : tpl,
		items : [],
		setup : function (opt) {
			var that = this;
			if (opt.list_data && $.isArray(opt.list_data)) {
				$.each(opt.list_data, function (index, data) {
					var itemCmd = that.group.call('Item', 'create', 'itemCmd').command(); //member create
					that.items.push(itemCmd);
					var opt_ = {
						noSetup : true,
						list : that,
						container : that.comp,
						item_data : data,
					};
					var itemComp = itemCmd('render', opt_);
					return itemComp;
				});
			}
			this.setupItems();
		},

		setupItems : function (opt) {
			$.each(this.items, function (index, itemCmd) {
				itemCmd('setup', opt);
			});
		},
	});

	return List;
});

define('listItemGrp',['jquery', 'group', 'list', 'item'
	], function ($, Grp, List, Item) {
	var ListItemGrp = Grp.group.create('ListItemGrp');
    var List = List.create('List');
    var Item = Item.create('Item');
    ListItemGrp.join(List, Item);
    
	ListItemGrp.extend({
        render: function(opt) {
            var listComp = this.call('List', 'render', opt);
            return listComp;
        },
	});

	return ListItemGrp;
});


define('tpl!templates/prompt', [],function () { return function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div class="promptTop">\r\n    <div class="promptHead">\r\n        <a class="top-left ios-button back" href="javascript:void(0)">Back</a>\r\n        <div class="promptTitle">'+
((__t=( prompt_title ))==null?'':__t)+
'</div>\r\n        <a class="top-right ios-button done" href="javascript:void(0)">Done</a>\r\n    </div>\r\n</div>';
}
return __p;
}; });

define('prompt',['jquery', 'component', 'tpl!templates/prompt'
	], function ($, Component, tpl) {
	var Prompt = Component.create('Prompt');
	Prompt.extend({
        tpl: tpl,
        setup: function(opt) {
            var that = this;
            if (!window.layerCount) window.layerCount = 10000;
            this.comp.css('z-index', window.layerCount++);
            var btn_done = this.comp.find('.promptHead .done');
            var btn_back = this.comp.find('.promptHead .back');
            btn_done.on('click', function(e) {
                that.donePrompt();
            });
            
            btn_back.on('click', function(e) {
                that.remove();
            });
            return this.comp;
        },
        donePrompt: function(opt) {
            this.remove();
        },
        
	});
    
    return Prompt;
});

define('promptFormGrp',['jquery', 'group', 'prompt', 'form'
	], function ($, Grp, Prompt, Form) {
	var PromptFormGrp = Grp.group.create('PromptFormGrp');
    var prompt = Prompt.create('prompt');
    var form = Form.create('form');
    PromptFormGrp.join(prompt, form);
    
    prompt.extend({
        setup: function(opt) {
            var promptComp = Prompt.setup.call(this, opt);
            opt.container = promptComp;
            var formComp = form.command()('render', opt);
            return promptComp;
        },
        
        donePrompt: function(opt) {
            var formValue = this.group.call('form', 'serialize', opt);
            console.log(formValue);
            Prompt.donePrompt.call(this, opt);
        },
    });
    
	PromptFormGrp.extend({
        render: function(opt) {
            return this.call('prompt', 'render', opt);
        },
	});

	return PromptFormGrp;
});


define('tpl!templates/textarea', [],function () { return function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<textarea name="'+
((__t=( textarea_name ))==null?'':__t)+
'" placeholder="'+
((__t=( textarea_placeholder ))==null?'':__t)+
'">'+
((__t=( textarea_value ))==null?'':__t)+
'</textarea>';
}
return __p;
}; });

define('textarea',['jquery', 'component', 'tpl!templates/textarea', 'autosize'
	], function ($, Component, tpl, autosize) {
	var Textarea = Component.create('Textarea');
	Textarea.extend({
        tpl: tpl,
        defaultOpt: {
            textarea_name: 'defaultTextareaName',
            textarea_value: '',
            textarea_placeholder: '',
        },
        setup: function(opt) {
            autosize(this.comp);
            return this.comp;
        },
	});
    
    return Textarea;
});

define('textareaCountGrp',['jquery', 'group', 'textarea', 'count'
	], function ($, Grp, Textarea, Count) {
	var TextareaCountGrp = Grp.group.create('TextareaCountGrp');
    var Textarea = Textarea.create('Textarea');
    var Count = Count.create('Count');
    TextareaCountGrp.join(Textarea, Count);
    
	TextareaCountGrp.extend({
        render: function(opt) {
            var textareaComp = this.call('Textarea', 'render', opt);
            var opt_ = {
                comp: textareaComp,
                maxCount: opt.textareaCountGrp_maxCount,
            };
            this.call('Count', 'render', opt_);
        },
	});

	return TextareaCountGrp;
});

require([
'component', 
'count', 
'data',
'dataCollection',
'dataCollectionGrp',
'form',
'item',
'list',
'listItemGrp',
'prompt',
'promptFormGrp',
'textarea',
'textareaCountGrp',
], function () {
});

define("../../build/main", function(){});

