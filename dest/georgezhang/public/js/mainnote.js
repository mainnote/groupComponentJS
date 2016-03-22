(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module unless amdModuleId is set
    define('group',[], function () {
      return (root['Grp'] = factory());
    });
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    root['Grp'] = factory();
  }
}(this, function () {

//for stupid old IE
var TAG = 'groupjs';
if (!Object.create) {
    Object.create = function (o) {
        if (arguments.length > 1) {
            throw new Error('Object.create implementation only accepts the first parameter.');
        }

        function F() {}
        F.prototype = o;
        return new F();
    };
}
if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
        if (typeof this !== 'function') {
            // closest thing possible to the ECMAScript 5
            // internal IsCallable function
            throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
        }

        var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP = function () {},
            fBound = function () {
                return fToBind.apply(this instanceof fNOP && oThis ? this : oThis,
                    aArgs.concat(Array.prototype.slice.call(arguments)));
            };

        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();

        return fBound;
    };
}
if (typeof Array.isArray === 'undefined') {
    Array.isArray = function (obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    }
};
//----------------------------
function reservedAttr(attribute) {
    if ((attribute in obj) || (attribute in group) || attribute === 'parentNames' || attribute === 'group' || attribute === '_memberList' || attribute === 'name' || attribute === '_callToMembers') {
        return true;
    } else {
        return false;
    }
};


function _resetCallToMember(thisGrp) {
    if ('_callToMembers' in thisGrp) { //reset setCallToMembers and level up
        //clone first since it will reset later
        var tmp_callToMembers = [];
        for (var i = 0, l = thisGrp._callToMembers.length; i < l; i++) {
          tmp_callToMembers[i] = thisGrp._callToMembers[i];
        }
        //apply
        for (var i = 0, l = tmp_callToMembers.length; i < l; i++) {
            var toMem = tmp_callToMembers[i];
            thisGrp.setCallToMember(toMem.memberName, toMem.methodName);
        }
        return true;
    }
    return false;
}

var obj = {
    create: function (name) {
        var newObj = Object.create(this);
        if (this.hasOwnProperty('parentNames')) {
            newObj.parentNames = [];
            var len = this.parentNames.length;
            for (var i = 0; i < len; i++) {
                newObj.parentNames.push(this.parentNames[i]);
            }
        }

        if (this.hasOwnProperty('name')) {
            if (!newObj.hasOwnProperty('parentNames'))
                newObj.parentNames = [];
            newObj.parentNames.push(this.name);

            if (!name) {
                name = this.name; //name from originate during instance
            }
        }

        newObj.name = name;

        return newObj;
    },
    extend: function () {
        for (var i = 0; i < arguments.length; i++) {
            var extObj = arguments[i];
            for (var key in extObj)
                this[key] = extObj[key];
        }
        return this;
    },
    command: function () {
        var self = this;
        return function (cmd, opt) {
            if (typeof self[cmd] === 'function') {
                if (window.LOG) {
                    var result = self[cmd](opt);
                    if (!(reservedAttr(cmd))) {
                        LOG(TAG, ' Method ' + self.name + '.' + cmd + ' ', opt, result);
                    }
                    return result;
                } else {
                    return self[cmd](opt);
                }
            } else {
                if (window.LOG) {
                    var result = self[cmd];
                    if (!(reservedAttr(cmd))) {
                        LOG(TAG, ' Attribute ' + self.name + '.' + cmd + ' ', '', result);
                    }
                    return result;
                } else {
                    return self[cmd]; //value
                }
            }
        };
    },
    thisObj: function () {
        return this;
    },
};

var group = obj.create('group');
group.extend({
    create: function (name) {
        var newObj = obj.create.apply(this, arguments);
        //all members should recreated within new group
        newObj._buildMemberList();

        //reset callToMember after group instantial
        _resetCallToMember(newObj);

        return newObj;
    },
    _buildMemberList: function () {
        if (!this._memberList) { //base group
            this._memberList = {};
        } else if (!this.hasOwnProperty('_memberList')) { //inherited group
            var prototypeMemberList = this._memberList;
            this._memberList = {}; //in object level memberList
            for (var key in prototypeMemberList) {
                var memberCmd = prototypeMemberList[key];
                var newMember = memberCmd('create');
                newMember.group = this; //member

                this._memberList[key] = newMember.command();
            }
        }
    },
    join: function () {
        for (var i = 0; i < arguments.length; i++) {
            var member = arguments[i];
            //add new member in command interface
            var newMember = member.create(member.name);
            newMember.group = this;
            this._memberList[member.name] = newMember.command();
        }
        return this;
    },
    call: function (memberName, methodName, opt) {
        //call member in this group
        if (memberName in this._memberList) {
            var memberCmd = this._memberList[memberName];
            if (window.LOG) {
                var result = memberCmd(methodName, opt);
                LOG(TAG, ' Group ' + this.name + ' [ ' + memberName + '.' + methodName + ' ] ', opt, result);
                return result;
            } else {
                return memberCmd(methodName, opt);
            }
            //deep call sub group's member
        } else {
            var prototypeMemberList = this._memberList;
            for (var key in prototypeMemberList) {
                var memberCmd = prototypeMemberList[key];
                if (typeof memberCmd === 'function') {
                    var member = prototypeMemberList[key]('thisObj');
                    if (member.hasOwnProperty('parentNames')) {
                        var parentNames = member.parentNames;
                        var p_len = parentNames.length;
                        for (var j = 0; j < p_len; j++) {
                            if (memberName === parentNames[j]) {
                                if (window.LOG) {
                                    var result = memberCmd(methodName, opt);
                                    LOG(TAG, ' SubGroup ' + this.name + ' [ ' + memberName + '.' + methodName + ' ] ', opt, result);
                                } else {
                                    memberCmd(methodName, opt); //no return till all members checked
                                }
                            }
                        }
                    }
                }
            }
        }
        //if not found, should we leave error?
    },

    /* call through to specific member whom play as a major role*/
    setCallToMember: function (memberName, methodName) {
        var that = this;
        var member = this.call(memberName, 'thisObj');
        if (member) {
            //newly create group object
            if (!this.hasOwnProperty('_callToMembers'))
                this._callToMembers = [];

            function arraySearch(arr, memberName, methodName) {
                for (var i = 0; i < arr.length; i++)
                    if (arr[i].memberName == memberName && arr[i].methodName == methodName)
                        return true;
                return false;
            }
            
            //ensure no duplicate
            if (!arraySearch(this._callToMembers, memberName, methodName)) {
                this._callToMembers.push({
                    memberName: memberName,
                    methodName: methodName
                });
            }

            if (methodName) {
                _setMethod(methodName, member); //override specific attribute. Even the one might exist.
            } else {
                for (var key in member) {
                    _setMethod(key, member);
                }
            }

            function _setMethod(attribute, memberObj) {
                if (!reservedAttr(attribute)) { //skip those attributes exist in group!!!
                    if (typeof memberObj[attribute] === 'function' && !memberObj[attribute].binded) {
                        that[attribute] = memberObj[attribute].bind(memberObj);
                        that[attribute].binded = true;
                    } else {
                        that[attribute] = memberObj[attribute];
                    }
                }
            }
        }

        return this;
    },

    members: function () {
        function _getMember(thisGroup) {
            var memberList = thisGroup._memberList;
            var ms = [];
            for (var key in memberList) {
                var member = {
                    name: key,
                };
                var memberObj = memberList[key]('thisObj');
                if (memberObj.hasOwnProperty('_memberList')) {
                    member['members'] = _getMember(memberObj);
                }
                ms.push(member);
            }
            return ms;
        }
        return _getMember(this);
    },

    getMember: function (memberName, memberMap) {
        if (memberMap && Array.isArray(memberMap)) {
            //find the first one in map
            return _findMemberInMap(memberMap, this);

            function _findMemberInMap(map, thisGroup) {
                if (Array.isArray(map) && thisGroup && thisGroup.hasOwnProperty('_memberList')) {
                    var len = map.length;
                    for (var i = 0; i < len; i++) {
                        //if level down
                        if (map[i].hasOwnProperty('members')) {
                            var member = _findMemberInMap(map[i].members, thisGroup.call(map[i].name, 'thisObj'));
                            if (member)
                                return member;
                        } else {
                            return _getMember(thisGroup);
                        }
                    }
                }
                return null;
            }
        } else {
            //get the first matched member if memberMap not specified
            return _getMember(this);
        }

        function _getMember(thisGroup) {
            var memberList = thisGroup._memberList;
            if (memberName in memberList) {
                return memberList[memberName]('thisObj');
            } else {
                for (var key in memberList) {
                    var memberObj = memberList[key]('thisObj');
                    if (memberObj.hasOwnProperty('_memberList')) {
                        return _getMember(memberObj);
                    }
                }
            }
            return null;
        }
    },

    override: function (newMember, memberMap) {
        if (newMember) {
            if (memberMap && Array.isArray(memberMap)) {
                //only override the ones in map
                _overrideMemberInMap(memberMap, this);

                function _overrideMemberInMap(map, thisGroup) {
                    if (Array.isArray(map) && thisGroup && thisGroup.hasOwnProperty('_memberList')) {
                        var len = map.length;
                        for (var i = 0; i < len; i++) {
                            //if level down
                            if (map[i].hasOwnProperty('members')) {
                                _overrideMemberInMap(map[i].members, thisGroup.call(map[i].name, 'thisObj'));
                            } else {
                                _overrideMember(thisGroup);
                            }
                        }
                    }
                }

            } else {
                //override all member with the same name
                _overrideMember(this);
            }

            function _overrideMember(thisGroup) {
                var reset = false;
                if (thisGroup.hasOwnProperty('_memberList')) {
                    for (var key in thisGroup._memberList) {
                        var memberObj = thisGroup._memberList[key]('thisObj');
                        if (memberObj.name === newMember.name) {
                            thisGroup.join(newMember);
                            reset = _resetCallToMember(thisGroup);
                        } else if (memberObj.hasOwnProperty('_memberList')) {
                            if (_overrideMember(memberObj)) {
                                reset = _resetCallToMember(thisGroup);
                            }
                        }
                    }

                }

                return reset;
            }
        }

        return this;
    },
});

var Grp = {
    obj: obj,
    group: group
};

return Grp;

}));

define('component',['jquery', 'group'
	], function ($, Grp) {
    var Component = Grp.obj.create('Component');
    Component.extend({
        defaultOpt: {},
        opt: {},
        template: function (opt) {
            return this.tpl ? this.tpl(opt) : '';
        },
        beforeRender: function (opt) {},
        render: function (opt) {
            if (!opt)
                opt = {};
            this.opt = $.extend({}, this.defaultOpt, this.opt, opt);
            this.beforeRender(this.opt);

            var opt_ = this.opt;

            if (!this.comp) {
                var comp = $(this.template(opt_));
                if (opt_.prepend) {
                    comp.prependTo(opt.container);
                } else {
                    comp.appendTo(opt.container);
                }
                this.comp = comp;
            }
            return opt.noSetup ? this.comp : this.setup(opt_);
        },

        setup: function (opt) {
            return this.comp;
        },
        remove: function (opt) {
            this.comp.remove();
        },
        setOpt: function (opt) {
            this.opt = $.extend({}, this.opt, opt);
        },
    });

    return Component;
});

/**
 * @license RequireJS text 2.0.14 Copyright (c) 2010-2014, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/requirejs/text for details
 */
/*jslint regexp: true */
/*global require, XMLHttpRequest, ActiveXObject,
  define, window, process, Packages,
  java, location, Components, FileUtils */

define('text',['module'], function (module) {
    'use strict';

    var text, fs, Cc, Ci, xpcIsWindows,
        progIds = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'],
        xmlRegExp = /^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im,
        bodyRegExp = /<body[^>]*>\s*([\s\S]+)\s*<\/body>/im,
        hasLocation = typeof location !== 'undefined' && location.href,
        defaultProtocol = hasLocation && location.protocol && location.protocol.replace(/\:/, ''),
        defaultHostName = hasLocation && location.hostname,
        defaultPort = hasLocation && (location.port || undefined),
        buildMap = {},
        masterConfig = (module.config && module.config()) || {};

    text = {
        version: '2.0.14',

        strip: function (content) {
            //Strips <?xml ...?> declarations so that external SVG and XML
            //documents can be added to a document without worry. Also, if the string
            //is an HTML document, only the part inside the body tag is returned.
            if (content) {
                content = content.replace(xmlRegExp, "");
                var matches = content.match(bodyRegExp);
                if (matches) {
                    content = matches[1];
                }
            } else {
                content = "";
            }
            return content;
        },

        jsEscape: function (content) {
            return content.replace(/(['\\])/g, '\\$1')
                .replace(/[\f]/g, "\\f")
                .replace(/[\b]/g, "\\b")
                .replace(/[\n]/g, "\\n")
                .replace(/[\t]/g, "\\t")
                .replace(/[\r]/g, "\\r")
                .replace(/[\u2028]/g, "\\u2028")
                .replace(/[\u2029]/g, "\\u2029");
        },

        createXhr: masterConfig.createXhr || function () {
            //Would love to dump the ActiveX crap in here. Need IE 6 to die first.
            var xhr, i, progId;
            if (typeof XMLHttpRequest !== "undefined") {
                return new XMLHttpRequest();
            } else if (typeof ActiveXObject !== "undefined") {
                for (i = 0; i < 3; i += 1) {
                    progId = progIds[i];
                    try {
                        xhr = new ActiveXObject(progId);
                    } catch (e) {}

                    if (xhr) {
                        progIds = [progId];  // so faster next time
                        break;
                    }
                }
            }

            return xhr;
        },

        /**
         * Parses a resource name into its component parts. Resource names
         * look like: module/name.ext!strip, where the !strip part is
         * optional.
         * @param {String} name the resource name
         * @returns {Object} with properties "moduleName", "ext" and "strip"
         * where strip is a boolean.
         */
        parseName: function (name) {
            var modName, ext, temp,
                strip = false,
                index = name.lastIndexOf("."),
                isRelative = name.indexOf('./') === 0 ||
                             name.indexOf('../') === 0;

            if (index !== -1 && (!isRelative || index > 1)) {
                modName = name.substring(0, index);
                ext = name.substring(index + 1);
            } else {
                modName = name;
            }

            temp = ext || modName;
            index = temp.indexOf("!");
            if (index !== -1) {
                //Pull off the strip arg.
                strip = temp.substring(index + 1) === "strip";
                temp = temp.substring(0, index);
                if (ext) {
                    ext = temp;
                } else {
                    modName = temp;
                }
            }

            return {
                moduleName: modName,
                ext: ext,
                strip: strip
            };
        },

        xdRegExp: /^((\w+)\:)?\/\/([^\/\\]+)/,

        /**
         * Is an URL on another domain. Only works for browser use, returns
         * false in non-browser environments. Only used to know if an
         * optimized .js version of a text resource should be loaded
         * instead.
         * @param {String} url
         * @returns Boolean
         */
        useXhr: function (url, protocol, hostname, port) {
            var uProtocol, uHostName, uPort,
                match = text.xdRegExp.exec(url);
            if (!match) {
                return true;
            }
            uProtocol = match[2];
            uHostName = match[3];

            uHostName = uHostName.split(':');
            uPort = uHostName[1];
            uHostName = uHostName[0];

            return (!uProtocol || uProtocol === protocol) &&
                   (!uHostName || uHostName.toLowerCase() === hostname.toLowerCase()) &&
                   ((!uPort && !uHostName) || uPort === port);
        },

        finishLoad: function (name, strip, content, onLoad) {
            content = strip ? text.strip(content) : content;
            if (masterConfig.isBuild) {
                buildMap[name] = content;
            }
            onLoad(content);
        },

        load: function (name, req, onLoad, config) {
            //Name has format: some.module.filext!strip
            //The strip part is optional.
            //if strip is present, then that means only get the string contents
            //inside a body tag in an HTML string. For XML/SVG content it means
            //removing the <?xml ...?> declarations so the content can be inserted
            //into the current doc without problems.

            // Do not bother with the work if a build and text will
            // not be inlined.
            if (config && config.isBuild && !config.inlineText) {
                onLoad();
                return;
            }

            masterConfig.isBuild = config && config.isBuild;

            var parsed = text.parseName(name),
                nonStripName = parsed.moduleName +
                    (parsed.ext ? '.' + parsed.ext : ''),
                url = req.toUrl(nonStripName),
                useXhr = (masterConfig.useXhr) ||
                         text.useXhr;

            // Do not load if it is an empty: url
            if (url.indexOf('empty:') === 0) {
                onLoad();
                return;
            }

            //Load the text. Use XHR if possible and in a browser.
            if (!hasLocation || useXhr(url, defaultProtocol, defaultHostName, defaultPort)) {
                text.get(url, function (content) {
                    text.finishLoad(name, parsed.strip, content, onLoad);
                }, function (err) {
                    if (onLoad.error) {
                        onLoad.error(err);
                    }
                });
            } else {
                //Need to fetch the resource across domains. Assume
                //the resource has been optimized into a JS module. Fetch
                //by the module name + extension, but do not include the
                //!strip part to avoid file system issues.
                req([nonStripName], function (content) {
                    text.finishLoad(parsed.moduleName + '.' + parsed.ext,
                                    parsed.strip, content, onLoad);
                });
            }
        },

        write: function (pluginName, moduleName, write, config) {
            if (buildMap.hasOwnProperty(moduleName)) {
                var content = text.jsEscape(buildMap[moduleName]);
                write.asModule(pluginName + "!" + moduleName,
                               "define(function () { return '" +
                                   content +
                               "';});\n");
            }
        },

        writeFile: function (pluginName, moduleName, req, write, config) {
            var parsed = text.parseName(moduleName),
                extPart = parsed.ext ? '.' + parsed.ext : '',
                nonStripName = parsed.moduleName + extPart,
                //Use a '.js' file name so that it indicates it is a
                //script that can be loaded across domains.
                fileName = req.toUrl(parsed.moduleName + extPart) + '.js';

            //Leverage own load() method to load plugin value, but only
            //write out values that do not have the strip argument,
            //to avoid any potential issues with ! in file names.
            text.load(nonStripName, req, function (value) {
                //Use own write() method to construct full module value.
                //But need to create shell that translates writeFile's
                //write() to the right interface.
                var textWrite = function (contents) {
                    return write(fileName, contents);
                };
                textWrite.asModule = function (moduleName, contents) {
                    return write.asModule(moduleName, fileName, contents);
                };

                text.write(pluginName, nonStripName, textWrite, config);
            }, config);
        }
    };

    if (masterConfig.env === 'node' || (!masterConfig.env &&
            typeof process !== "undefined" &&
            process.versions &&
            !!process.versions.node &&
            !process.versions['node-webkit'] &&
            !process.versions['atom-shell'])) {
        //Using special require.nodeRequire, something added by r.js.
        fs = require.nodeRequire('fs');

        text.get = function (url, callback, errback) {
            try {
                var file = fs.readFileSync(url, 'utf8');
                //Remove BOM (Byte Mark Order) from utf8 files if it is there.
                if (file[0] === '\uFEFF') {
                    file = file.substring(1);
                }
                callback(file);
            } catch (e) {
                if (errback) {
                    errback(e);
                }
            }
        };
    } else if (masterConfig.env === 'xhr' || (!masterConfig.env &&
            text.createXhr())) {
        text.get = function (url, callback, errback, headers) {
            var xhr = text.createXhr(), header;
            xhr.open('GET', url, true);

            //Allow plugins direct access to xhr headers
            if (headers) {
                for (header in headers) {
                    if (headers.hasOwnProperty(header)) {
                        xhr.setRequestHeader(header.toLowerCase(), headers[header]);
                    }
                }
            }

            //Allow overrides specified in config
            if (masterConfig.onXhr) {
                masterConfig.onXhr(xhr, url);
            }

            xhr.onreadystatechange = function (evt) {
                var status, err;
                //Do not explicitly handle errors, those should be
                //visible via console output in the browser.
                if (xhr.readyState === 4) {
                    status = xhr.status || 0;
                    if (status > 399 && status < 600) {
                        //An http 4xx or 5xx error. Signal an error.
                        err = new Error(url + ' HTTP status: ' + status);
                        err.xhr = xhr;
                        if (errback) {
                            errback(err);
                        }
                    } else {
                        callback(xhr.responseText);
                    }

                    if (masterConfig.onXhrComplete) {
                        masterConfig.onXhrComplete(xhr, url);
                    }
                }
            };
            xhr.send(null);
        };
    } else if (masterConfig.env === 'rhino' || (!masterConfig.env &&
            typeof Packages !== 'undefined' && typeof java !== 'undefined')) {
        //Why Java, why is this so awkward?
        text.get = function (url, callback) {
            var stringBuffer, line,
                encoding = "utf-8",
                file = new java.io.File(url),
                lineSeparator = java.lang.System.getProperty("line.separator"),
                input = new java.io.BufferedReader(new java.io.InputStreamReader(new java.io.FileInputStream(file), encoding)),
                content = '';
            try {
                stringBuffer = new java.lang.StringBuffer();
                line = input.readLine();

                // Byte Order Mark (BOM) - The Unicode Standard, version 3.0, page 324
                // http://www.unicode.org/faq/utf_bom.html

                // Note that when we use utf-8, the BOM should appear as "EF BB BF", but it doesn't due to this bug in the JDK:
                // http://bugs.sun.com/bugdatabase/view_bug.do?bug_id=4508058
                if (line && line.length() && line.charAt(0) === 0xfeff) {
                    // Eat the BOM, since we've already found the encoding on this file,
                    // and we plan to concatenating this buffer with others; the BOM should
                    // only appear at the top of a file.
                    line = line.substring(1);
                }

                if (line !== null) {
                    stringBuffer.append(line);
                }

                while ((line = input.readLine()) !== null) {
                    stringBuffer.append(lineSeparator);
                    stringBuffer.append(line);
                }
                //Make sure we return a JavaScript string and not a Java string.
                content = String(stringBuffer.toString()); //String
            } finally {
                input.close();
            }
            callback(content);
        };
    } else if (masterConfig.env === 'xpconnect' || (!masterConfig.env &&
            typeof Components !== 'undefined' && Components.classes &&
            Components.interfaces)) {
        //Avert your gaze!
        Cc = Components.classes;
        Ci = Components.interfaces;
        Components.utils['import']('resource://gre/modules/FileUtils.jsm');
        xpcIsWindows = ('@mozilla.org/windows-registry-key;1' in Cc);

        text.get = function (url, callback) {
            var inStream, convertStream, fileObj,
                readData = {};

            if (xpcIsWindows) {
                url = url.replace(/\//g, '\\');
            }

            fileObj = new FileUtils.File(url);

            //XPCOM, you so crazy
            try {
                inStream = Cc['@mozilla.org/network/file-input-stream;1']
                           .createInstance(Ci.nsIFileInputStream);
                inStream.init(fileObj, 1, 0, false);

                convertStream = Cc['@mozilla.org/intl/converter-input-stream;1']
                                .createInstance(Ci.nsIConverterInputStream);
                convertStream.init(inStream, "utf-8", inStream.available(),
                Ci.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER);

                convertStream.readString(inStream.available(), readData);
                convertStream.close();
                inStream.close();
                callback(readData.value);
            } catch (e) {
                throw new Error((fileObj && fileObj.path || '') + ': ' + e);
            }
        };
    }
    return text;
});

//     Underscore.js 1.8.3
//     http://underscorejs.org
//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind,
    nativeCreate       = Object.create;

  // Naked function reference for surrogate-prototype-swapping.
  var Ctor = function(){};

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.8.3';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var optimizeCb = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      case 2: return function(value, other) {
        return func.call(context, value, other);
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

  // A mostly-internal function to generate callbacks that can be applied
  // to each element in a collection, returning the desired result — either
  // identity, an arbitrary callback, a property matcher, or a property accessor.
  var cb = function(value, context, argCount) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
    if (_.isObject(value)) return _.matcher(value);
    return _.property(value);
  };
  _.iteratee = function(value, context) {
    return cb(value, context, Infinity);
  };

  // An internal function for creating assigner functions.
  var createAssigner = function(keysFunc, undefinedOnly) {
    return function(obj) {
      var length = arguments.length;
      if (length < 2 || obj == null) return obj;
      for (var index = 1; index < length; index++) {
        var source = arguments[index],
            keys = keysFunc(source),
            l = keys.length;
        for (var i = 0; i < l; i++) {
          var key = keys[i];
          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
        }
      }
      return obj;
    };
  };

  // An internal function for creating a new object that inherits from another.
  var baseCreate = function(prototype) {
    if (!_.isObject(prototype)) return {};
    if (nativeCreate) return nativeCreate(prototype);
    Ctor.prototype = prototype;
    var result = new Ctor;
    Ctor.prototype = null;
    return result;
  };

  var property = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key];
    };
  };

  // Helper for collection methods to determine whether a collection
  // should be iterated as an array or as an object
  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var getLength = property('length');
  var isArrayLike = function(collection) {
    var length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;
    if (isArrayLike(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length);
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Create a reducing function iterating left or right.
  function createReduce(dir) {
    // Optimized iterator function as using arguments.length
    // in the main function will deoptimize the, see #1991.
    function iterator(obj, iteratee, memo, keys, index, length) {
      for (; index >= 0 && index < length; index += dir) {
        var currentKey = keys ? keys[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }
      return memo;
    }

    return function(obj, iteratee, memo, context) {
      iteratee = optimizeCb(iteratee, context, 4);
      var keys = !isArrayLike(obj) && _.keys(obj),
          length = (keys || obj).length,
          index = dir > 0 ? 0 : length - 1;
      // Determine the initial value if none is provided.
      if (arguments.length < 3) {
        memo = obj[keys ? keys[index] : index];
        index += dir;
      }
      return iterator(obj, iteratee, memo, keys, index, length);
    };
  }

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = createReduce(1);

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = createReduce(-1);

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var key;
    if (isArrayLike(obj)) {
      key = _.findIndex(obj, predicate, context);
    } else {
      key = _.findKey(obj, predicate, context);
    }
    if (key !== void 0 && key !== -1) return obj[key];
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    predicate = cb(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(cb(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given item (using `===`).
  // Aliased as `includes` and `include`.
  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
    if (!isArrayLike(obj)) obj = _.values(obj);
    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
    return _.indexOf(obj, item, fromIndex) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      var func = isFunc ? method : value[method];
      return func == null ? func : func.apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matcher(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matcher(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value > result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value < result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var set = isArrayLike(obj) ? obj : _.values(obj);
    var length = set.length;
    var shuffled = Array(length);
    for (var index = 0, rand; index < length; index++) {
      rand = _.random(0, index);
      if (rand !== index) shuffled[index] = shuffled[rand];
      shuffled[rand] = set[index];
    }
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (!isArrayLike(obj)) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iteratee(value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iteratee, context) {
      var result = {};
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key]++; else result[key] = 1;
  });

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (isArrayLike(obj)) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var pass = [], fail = [];
    _.each(obj, function(value, key, obj) {
      (predicate(value, key, obj) ? pass : fail).push(value);
    });
    return [pass, fail];
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[0];
    return _.initial(array, array.length - n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[array.length - 1];
    return _.rest(array, Math.max(0, array.length - n));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, startIndex) {
    var output = [], idx = 0;
    for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
      var value = input[i];
      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
        //flatten current level of array or arguments object
        if (!shallow) value = flatten(value, shallow, strict);
        var j = 0, len = value.length;
        output.length += len;
        while (j < len) {
          output[idx++] = value[j++];
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = cb(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = getLength(array); i < length; i++) {
      var value = array[i],
          computed = iteratee ? iteratee(value, i, array) : value;
      if (isSorted) {
        if (!i || seen !== computed) result.push(value);
        seen = computed;
      } else if (iteratee) {
        if (!_.contains(seen, computed)) {
          seen.push(computed);
          result.push(value);
        }
      } else if (!_.contains(result, value)) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(flatten(arguments, true, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = getLength(array); i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      for (var j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(arguments, true, true, 1);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    return _.unzip(arguments);
  };

  // Complement of _.zip. Unzip accepts an array of arrays and groups
  // each array's elements on shared indices
  _.unzip = function(array) {
    var length = array && _.max(array, getLength).length || 0;
    var result = Array(length);

    for (var index = 0; index < length; index++) {
      result[index] = _.pluck(array, index);
    }
    return result;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    var result = {};
    for (var i = 0, length = getLength(list); i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Generator function to create the findIndex and findLastIndex functions
  function createPredicateIndexFinder(dir) {
    return function(array, predicate, context) {
      predicate = cb(predicate, context);
      var length = getLength(array);
      var index = dir > 0 ? 0 : length - 1;
      for (; index >= 0 && index < length; index += dir) {
        if (predicate(array[index], index, array)) return index;
      }
      return -1;
    };
  }

  // Returns the first index on an array-like that passes a predicate test
  _.findIndex = createPredicateIndexFinder(1);
  _.findLastIndex = createPredicateIndexFinder(-1);

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = getLength(array);
    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Generator function to create the indexOf and lastIndexOf functions
  function createIndexFinder(dir, predicateFind, sortedIndex) {
    return function(array, item, idx) {
      var i = 0, length = getLength(array);
      if (typeof idx == 'number') {
        if (dir > 0) {
            i = idx >= 0 ? idx : Math.max(idx + length, i);
        } else {
            length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
        }
      } else if (sortedIndex && idx && length) {
        idx = sortedIndex(array, item);
        return array[idx] === item ? idx : -1;
      }
      if (item !== item) {
        idx = predicateFind(slice.call(array, i, length), _.isNaN);
        return idx >= 0 ? idx + i : -1;
      }
      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
        if (array[idx] === item) return idx;
      }
      return -1;
    };
  }

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Determines whether to execute a function as a constructor
  // or a normal function with the provided arguments
  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    var self = baseCreate(sourceFunc.prototype);
    var result = sourceFunc.apply(self, args);
    if (_.isObject(result)) return result;
    return self;
  };

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    var args = slice.call(arguments, 2);
    var bound = function() {
      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
    };
    return bound;
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    var bound = function() {
      var position = 0, length = boundArgs.length;
      var args = Array(length);
      for (var i = 0; i < length; i++) {
        args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return executeBound(func, bound, this, this, args);
    };
    return bound;
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var i, length = arguments.length, key;
    if (length <= 1) throw new Error('bindAll must be passed function names');
    for (i = 1; i < length; i++) {
      key = arguments[i];
      obj[key] = _.bind(obj[key], obj);
    }
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){
      return func.apply(null, args);
    }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = _.partial(_.delay, _, 1);

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;

      if (last < wait && last >= 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed on and after the Nth call.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed up to (but not including) the Nth call.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      }
      if (times <= 1) func = null;
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  // Object Functions
  // ----------------

  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

  function collectNonEnumProps(obj, keys) {
    var nonEnumIdx = nonEnumerableProps.length;
    var constructor = obj.constructor;
    var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;

    // Constructor is a special case.
    var prop = 'constructor';
    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

    while (nonEnumIdx--) {
      prop = nonEnumerableProps[nonEnumIdx];
      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
        keys.push(prop);
      }
    }
  }

  // Retrieve the names of an object's own properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve all the property names of an object.
  _.allKeys = function(obj) {
    if (!_.isObject(obj)) return [];
    var keys = [];
    for (var key in obj) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Returns the results of applying the iteratee to each element of the object
  // In contrast to _.map it returns an object
  _.mapObject = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys =  _.keys(obj),
          length = keys.length,
          results = {},
          currentKey;
      for (var index = 0; index < length; index++) {
        currentKey = keys[index];
        results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
      }
      return results;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = createAssigner(_.allKeys);

  // Assigns a given object with all the own properties in the passed-in object(s)
  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
  _.extendOwn = _.assign = createAssigner(_.keys);

  // Returns the first key on an object that passes a predicate test
  _.findKey = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = _.keys(obj), key;
    for (var i = 0, length = keys.length; i < length; i++) {
      key = keys[i];
      if (predicate(obj[key], key, obj)) return key;
    }
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(object, oiteratee, context) {
    var result = {}, obj = object, iteratee, keys;
    if (obj == null) return result;
    if (_.isFunction(oiteratee)) {
      keys = _.allKeys(obj);
      iteratee = optimizeCb(oiteratee, context);
    } else {
      keys = flatten(arguments, false, false, 1);
      iteratee = function(value, key, obj) { return key in obj; };
      obj = Object(obj);
    }
    for (var i = 0, length = keys.length; i < length; i++) {
      var key = keys[i];
      var value = obj[key];
      if (iteratee(value, key, obj)) result[key] = value;
    }
    return result;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj, iteratee, context) {
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
    } else {
      var keys = _.map(flatten(arguments, false, false, 1), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  };

  // Fill in a given object with default properties.
  _.defaults = createAssigner(_.allKeys, true);

  // Creates an object that inherits from the given prototype object.
  // If additional properties are provided then they will be added to the
  // created object.
  _.create = function(prototype, props) {
    var result = baseCreate(prototype);
    if (props) _.extendOwn(result, props);
    return result;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Returns whether an object has a given set of `key:value` pairs.
  _.isMatch = function(object, attrs) {
    var keys = _.keys(attrs), length = keys.length;
    if (object == null) return !length;
    var obj = Object(object);
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }
    return true;
  };


  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
    }

    var areArrays = className === '[object Array]';
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false;

      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
                               _.isFunction(bCtor) && bCtor instanceof bCtor)
                          && ('constructor' in a && 'constructor' in b)) {
        return false;
      }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);

    // Recursively compare objects and arrays.
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false;
      // Deep compare the contents, ignoring non-numeric properties.
      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      length = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      if (_.keys(b).length !== length) return false;
      while (length--) {
        // Deep compare each member
        key = keys[length];
        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return true;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
    return _.keys(obj).length === 0;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE < 9), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return _.has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
  // IE 11 (#1621), and in Safari 8 (#1929).
  if (typeof /./ != 'function' && typeof Int8Array != 'object') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj !== +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  // Predicate-generating functions. Often useful outside of Underscore.
  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  _.property = property;

  // Generates a function for a given object that returns a given property.
  _.propertyOf = function(obj) {
    return obj == null ? function(){} : function(key) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of
  // `key:value` pairs.
  _.matcher = _.matches = function(attrs) {
    attrs = _.extendOwn({}, attrs);
    return function(obj) {
      return _.isMatch(obj, attrs);
    };
  };

  // Run a function **n** times.
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = optimizeCb(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };

   // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property, fallback) {
    var value = object == null ? void 0 : object[property];
    if (value === void 0) {
      value = fallback;
    }
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escaper, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offest.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(instance, obj) {
    return instance._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result(this, func.apply(_, args));
      };
    });
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return result(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function() {
    return this._wrapped;
  };

  // Provide unwrapping proxy for some methods used in engine operations
  // such as arithmetic and JSON stringification.
  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

  _.prototype.toString = function() {
    return '' + this._wrapped;
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}.call(this));

// RequireJS UnderscoreJS template plugin
// http://github.com/jfparadis/requirejs-tpl
//
// An alternative to http://github.com/ZeeAgency/requirejs-tpl
//
// Using UnderscoreJS micro-templates at http://underscorejs.org/#template
// Using and RequireJS text.js at http://requirejs.org/docs/api.html#text
// @author JF Paradis
// @version 0.0.2
//
// Released under the MIT license
//
// Usage:
//   require(['backbone', 'tpl!mytemplate'], function (Backbone, mytemplate) {
//     return Backbone.View.extend({
//       initialize: function(){
//         this.render();
//       },
//       render: function(){
//         this.$el.html(mytemplate({message: 'hello'}));
//     });
//   });
//
// Configuration: (optional)
//   require.config({
//     tpl: {
//       extension: '.tpl' // default = '.html'
//     }
//   });

/*jslint nomen: true */
/*global define: false */

define('tpl',['text', 'underscore'], function (text, _) {
    'use strict';

    var buildMap = {},
        buildTemplateSource = "define('{pluginName}!{moduleName}', function () { return {source}; });\n";

    return {
        version: '0.0.2',

        load: function (moduleName, parentRequire, onload, config) {

            if (config.tpl && config.tpl.templateSettings) {
                _.templateSettings = config.tpl.templateSettings;
            }

            if (buildMap[moduleName]) {
                onload(buildMap[moduleName]);

            } else {
                var ext = (config.tpl && config.tpl.extension) || '.html';
                var path = (config.tpl && config.tpl.path) || '';
                text.load(path + moduleName + ext, parentRequire, function (source) {
                    buildMap[moduleName] = _.template(source);
                    onload(buildMap[moduleName]);
                }, config);
            }
        },

        write: function (pluginName, moduleName, write) {
            var build = buildMap[moduleName],
                source = build && build.source;
            if (source) {
                write.asModule(pluginName + '!' + moduleName,
                    buildTemplateSource
                    .replace('{pluginName}', pluginName)
                    .replace('{moduleName}', moduleName)
                    .replace('{source}', source));
            }
        }
    };
});


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

define('entity',['jquery', 'group'
	], function ($, Grp) {
    var Entity = Grp.obj.create('Entity');
    Entity.extend({
        value: null,
        update: function (opt) {
            this.value = opt.value;
            return this.command();
        },
        get: function (opt) {
            return this.value;
        },
    });

    return Entity;
});

define('collection',['jquery', 'group'
	], function ($, Grp) {
    var Collection = Grp.obj.create('Collection');
    Collection.extend({
        values: [],
        reset: function (opt) {
            this.values = [];
        },
        add: function (opt) {
            var that = this;

            function addValue(values) {
                var entityCmd = that.group.call('Entity', 'create', 'entityCmd').command();
                var opt_ = {
                    value: values,
                };
                var v = entityCmd('update', opt_);
                that.values.push(v);
            }

            if (opt.values) {
                if ($.isArray(opt.values)) {
                    $.each(opt.values, function (index, value) {
                        addValue(value);
                    });
                } else {
                    addValue(opt.values);
                }
            }
            return this.values;
        },
        addExtra: function (opt) {
            var startIndex = this.values.length;
            this.add(opt);
            return this.values.slice(startIndex);
        }
    });

    return Collection;
});

define('collectionGrp',['jquery', 'group', 'collection', 'entity'
	], function ($, Grp, Collection, Entity) {
	var CollectionGrp = Grp.group.create('CollectionGrp');
	var Collection = Collection.create('Collection');
	var Entity = Entity.create('Entity');
	CollectionGrp.join(Collection, Entity);

	CollectionGrp.setCallToMember('Collection');
	return CollectionGrp;
});


define('tpl!templates/form', [],function () { return function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<form onsubmit="return false;" method="get" action="data.json">\r\n<fieldset>\r\n</fieldset>\r\n</form>';
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
			//build fieldset from JSON
			if (opt.form_elements && $.isArray(opt.form_elements)) {
				var len = opt.form_elements.length;
				for (var i = 0; i < len; i++) {
					var elem = opt.form_elements[i];
					var comp = elem.elem;
					var compOpt = elem.opt;
					if (comp.hasOwnProperty('parentNames')) {
						this.add({
							compCmd : comp.command(),
							compOpt : compOpt || {},
						});
					}
				}
			}
			return this.comp;
		},
		submitting : false,
		submit : function (opt) {
			if (!this.submitting) {
				this.submitting = true;
				var action = this.comp.attr('action');
				var method = this.comp.attr('method');
				var data = this.serialize();
				$.ajax({
					type : method,
					url : action,
					data : data,
					context : this,
					done : function (data) {
						var opt_ = {
							data : data,
						};
						this.done(opt_);
					},
					always : function () {
						this.always();
					},
				});
			}
		},
		done : function (opt) {},
		always : function (opt) {
			this.submitting = false;
		},
		add : function (opt) {
			var opt_ = $.extend({
					container : this.comp.find('fieldset'),
                    form : this
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

define('request',['jquery', 'group'
	], function ($, Grp) {
	var Request = Grp.obj.create('Request');
	Request.extend({
		connect : function (opt) {
			$.ajax({
				url : opt.request_url,
				method : opt.request_method,
				data : opt.request_data,
				dataType : 'json',
				context : this,
			})
			.done(opt.request_done)
			.fail(opt.request_fail)
			.always(opt.request_always);
		},
	});

	return Request;
});

define('formGrp',['jquery', 'group', 'form', 'request'
	], function ($, Grp, Form, Request) {
	var FormGrp = Grp.group.create('FormGrp');
	var form = Form.create('form');
	form.extend({
		submit : function (opt) {
			if (!this.submitting) {
				this.submitting = true;
				var that = this;
				this.comp.find('.error').each(function (index) {
					$(this).remove();
				});
				var action = this.comp.attr('action');
				var method = this.comp.attr('method');
				var inputData = this.serializeArray();
				//request
				var opt_ = {
					request_url : action,
					request_method : method,
					request_data : inputData,
					request_done : function (data, textStatus, jqXHR) {
						var opt0 = {
							data : data
						};
						that.done(opt0);
					},
					request_fail : function (jqXHR, textStatus, errorThrown) {
						var opt0 = {
							error : errorThrown
						};
						that.error(opt0);
					},
					request_always : function (data_jqXHR, textStatus, jqXHR_errorThrow) {
                        that.always();
                    },
				};
				this.group.call('request', 'connect', opt_);
			}
		},
		error : function (opt) {
			this.comp.append('<div class="error">' + opt.error + '</div>');
		},

	});

	var request = Request.create('request');

	FormGrp.join(form, request);

	FormGrp.setCallToMember('form');

	return FormGrp;
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
        entityCmd: null,
        list: null,
        render: function(opt) {
            this.entityCmd = opt.item_data;
            this.list = opt.list;
            var opt_ = {
                    container: opt.container,
                    noSetup: opt.noSetup,
                    item_value: this.entityCmd('get'),
                };
            return Component.render.call(this, opt_);
        },
	});
    
    return Item;
});


define('tpl!templates/list', [],function () { return function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<ul class="clearfix"></ul>';
}
return __p;
}; });

define('list',['jquery', 'component', 'tpl!templates/list',
	], function ($, Component, tpl) {
    var List = Component.create('List');
    List.extend({
        tpl: tpl,
        items: [],
        reset: function (opt) {
            //make the original frame firm by setting min-height and width
            this.comp.css({
                'min-height': this.comp.css('height'),
                'min-width': this.comp.css('width')
            });

            this.items = [];
            this.comp.empty();
        },
        setup: function (opt) {
            var that = this;
            if (opt.list_data && $.isArray(opt.list_data)) {
                $.each(opt.list_data, function (index, data) {
                    var itemCmd = that.group.call('Item', 'create', 'itemCmd').command(); //member create
                    that.items.push(itemCmd);
                    var opt_ = {
                        noSetup: true,
                        list: that,
                        container: that.comp,
                        item_data: data,
                    };
                    var itemComp = itemCmd('render', opt_);
                    itemCmd('setup');
                    return itemComp;
                });

                //remove fixed css value so that less blank under the list
                var minH = this.comp.css('min-height');
                var winH = $(window).height()/2;
                this.comp.css({
                    'min-height': minH > winH ? winH : minH,
                    'min-width': ''
                });
            }
        }
    });

    return List;
});

define('listItemGrp',['jquery', 'group', 'list', 'item'
	], function ($, Grp, List, Item) {
	var ListItemGrp = Grp.group.create('ListItemGrp');
    var List = List.create('List');
    var Item = Item.create('Item');
    ListItemGrp.join(List, Item);
    
    ListItemGrp.setCallToMember('List');
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

define('promptFormGrp',['jquery', 'group', 'prompt', 'formGrp' 
	], function ($, Grp, Prompt, FormGrp) {
	var PromptFormGrp = Grp.group.create('PromptFormGrp');
    var prompt = Prompt.create('prompt');
    var formGrp = FormGrp.create('formGrp');
    var form = formGrp.call('form', 'create'); //create a form object from formGrp
    form.extend({
        done: function(opt){
          this.group.group.call('prompt', 'donePrompt');
        },
    });
    formGrp.override(form);
    
    PromptFormGrp.join(prompt, formGrp);
    
    prompt.extend({
        setup: function(opt) {
            var promptComp = Prompt.setup.call(this, opt);
            opt.container = promptComp;
            this.group.call('formGrp', 'render', opt);
            return promptComp;
        },
        
        donePrompt: function(opt) {
            var formValue = this.group.call('formGrp', 'submit', opt);
            Prompt.donePrompt.call(this, opt);
        },
    });
    
	PromptFormGrp.extend({
        render: function(opt) {
            if (this.defaultOpt) {
                opt = $.extend({}, this.defaultOpt, opt);
            }
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


define('tpl!templates/button', [],function () { return function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<button class="btn '+
((__t=( button_class ))==null?'':__t)+
'" type="'+
((__t=( button_type ))==null?'':__t)+
'" title="'+
((__t=( button_title ))==null?'':__t)+
'">'+
((__t=( button_name ))==null?'':__t)+
'</button>';
}
return __p;
}; });

define('button',['jquery', 'component', 'tpl!templates/button'
	], function ($, Component, tpl) {
    var Button = Component.create('Button');
    Button.extend({
        defaultOpt: {
            button_name: 'Button',
            button_title: 'button title',
            button_type: 'button',
            button_class: 'btn-sm btn-primary'
        },
        tpl: tpl,
        setup: function (opt) {
            if (opt && opt.form && opt.button_type === 'submit') {
                this.comp.on('click', function (e) {
                    e.preventDefault();
                    opt.form.submit();
                });
            }
        }
    });

    return Button;
});


define('tpl!templates/input', [],function () { return function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div class="form-group">\r\n    <label for="'+
((__t=( input_id ))==null?'':__t)+
'" class="sr-only">'+
((__t=( input_name ))==null?'':__t)+
'</label>\r\n    <input type="'+
((__t=( input_type ))==null?'':__t)+
'" id="'+
((__t=( input_id ))==null?'':__t)+
'" name="'+
((__t=( input_name ))==null?'':__t)+
'" class="form-control" placeholder="'+
((__t=( input_placeholder ))==null?'':__t)+
'" \r\n        ';
 if (input_required) {
__p+='\r\n         required \r\n        ';
 } 
__p+='\r\n        ';
 if (input_autofocus) {
__p+='\r\n         autofocus \r\n        ';
 } 
__p+='\r\n        ';
 if (input_action) {
__p+='\r\n         action="'+
((__t=( input_action ))==null?'':__t)+
'" \r\n        ';
 } 
__p+='\r\n        \r\n        value="'+
((__t=( input_value ))==null?'':__t)+
'"\r\n    >\r\n    <p class="hints"></p>\r\n</div>';
}
return __p;
}; });

define('input',['jquery', 'component', 'tpl!templates/input'
	], function ($, Component, tpl) {
    var Input = Component.create('Input');
    Input.extend({
        tpl: tpl,
        inputElem: null,
        defaultOpt: {
            input_required: false,
            input_autofocus: false,
            input_action: false,
            input_value: '',
            input_id: 'input_id',
            input_name: 'input_name',
            input_type: 'text',
            input_placeholder: '',
            input_timeout: 700
        },
        setup: function (opt) {
            var that = this;
            this.inputElem = this.comp.find('input');
            if (this.inputElem) {
                var wait;
                this.inputElem.on('input', function (e) {
                    if (wait) {
                        clearTimeout(wait);
                        wait = null;
                    }
                    wait = setTimeout(function () {
                        that.checkValid({
                            input_value: that.inputElem.val()
                        });
                    }, opt.input_timeout);
                });
            }
        },
        checkValid: function (opt) { //to be overriden
            this.getResult({
                invalidHints: false
            });
        },
        getResult: function (opt) {
            var hints = this.comp.find('.hints');
            if (opt && opt.invalidHints) {
                this.comp.removeClass('has-success').addClass('has-warning');
                if (this.inputElem) this.inputElem
                    .removeClass('form-control-success')
                    .addClass('form-control-warning');
                hints.html(opt.invalidHints);
            } else {
                this.comp.removeClass('has-warning').addClass('has-success');
                if (this.inputElem) this.inputElem
                    .removeClass('form-control-warning')
                    .addClass('form-control-success');
                hints.html('');
            }
        },
    });

    return Input;
});

define('inputPassword',['jquery', 'component', 'input'
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

define('inputGrp',['jquery', 'group', 'input', 'request'
	], function ($, Grp, Input, Request) {
	var InputGrp = Grp.group.create('InputGrp');
	var input = Input.create('input');
	input.extend({
		checkValid : function (opt) {
			var that = this;
            var action = this.comp.find('input').attr('action');
			//request
			var opt_ = {
				request_url : action,
				request_method : 'GET',
				request_data : {value: opt.input_value},
				request_done : function (data, textStatus, jqXHR) {
					if (data.hasOwnProperty('error')) {
						that.getResult({
							invalidHints : data.error.message || data.error.code,
						});
					} else {
						that.getResult({
							invalidHints : false
						});
					}
				},
				request_fail : function (jqXHR, textStatus, errorThrown) {
					that.getResult({
						invalidHints : errorThrown,
					});
				},
				request_always : function (data_jqXHR, textStatus, jqXHR_errorThrow) {},
			};
			this.group.call('request', 'connect', opt_);
		},
	});

	var request = Request.create('request');
	InputGrp.join(input, request);
	InputGrp.setCallToMember('input');

	return InputGrp;
});

define('inputEmailGrp',['jquery', 'group', 'inputGrp', 'input'
	], function ($, Grp, InputGrp) {
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


define('tpl!templates/navbar', [],function () { return function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<nav class="navbar '+
((__t=( navbar_placement ))==null?'':__t)+
'">\r\n  <div class="pull-right">\r\n      <button class="navbar-toggler pull-xs-right hidden-sm-up" type="button" data-toggle="collapse" data-target="#'+
((__t=( navbar_id ))==null?'':__t)+
'">\r\n        &#9776;\r\n      </button>\r\n  </div>\r\n  <style>\r\n@media screen and (max-width: 542px) {\r\n    ul.nav li.nav-item {\r\n        width: 100%;\r\n        display: block;\r\n        clear: both;\r\n        text-align:left;\r\n        margin-left: 0 !important;\r\n    }\r\n    \r\n    nav .nav-middle {\r\n        width: 80%;\r\n        height: 2.5em;\r\n    }\r\n}\r\n  </style>\r\n  <div class="nav-middle"></div>\r\n  <div class="collapse navbar-toggleable-xs menu-items" id="'+
((__t=( navbar_id ))==null?'':__t)+
'">\r\n    <ul class="nav navbar-nav">\r\n    </ul>\r\n  </div>\r\n</nav>';
}
return __p;
}; });

define('navbar',['jquery', 'component', 'tpl!templates/navbar'
	], function ($, Component, tpl) {
    var TAG = 'navjs';
    var Navbar = Component.create('Navbar');
    Navbar.extend({
        defaultOpt: {
            navbar_id: 'navbar_id',
            navbar_placement: 'navbar-fixed-top navbar-light bg-faded'
        },
        tpl: tpl,
        setup: function (opt) {
            var that = this;
            if (opt.navbar_brand && opt.navbar_brand.cmd) {
                var container = this.comp;
                opt.navbar_brand.cmd('render', $.extend({}, opt.navbar_brand.opt || {}, {
                    container: container
                }));
            } else {
                if (window.LOG) LOG(TAG, 'Opt navbar_brand is not correct!', 'error');
            }

            if (opt.navbar_items) {
                if ($.isArray(opt.navbar_items)) {
                    setNavItem(opt.navbar_items, opt.navbar_id);
                } else {
                    if (window.LOG) LOG(TAG, 'Opt navbar_items is not correct!', 'error');
                }
            }

            function setNavItem(items, navId) {
                var len = items.length;
                var container = that.comp.find('#' + navId + ' ul');
                for (var i = 0; i < len; i++) {
                    var item = items[i];
                    item.cmd('render', $.extend({}, item.opt || {}, {
                        container: container
                    }));
                }
            }

            //scoll
            if (opt && opt.toggleScoll) {
                this.toggleScoll(opt);
            }

            return this.comp;
        },

        toggleScoll: function (opt) {
            if (this.group) {
                //scroll down hide nav, up show
                var opt_ = $.extend({}, opt, {
                    header: this.comp
                });
                this.group.call('ToggleHeaderScroll', 'setToggleHeaderScroll', opt_);
            }
        }

    });

    return Navbar;
});

/*
    scroll : Since scroll event doesn't bubble up, we need one static object to handle all events for one element like window.
*/
define('scroll',['jquery', ], function ($) {
    var Scroll = Grp.obj.create('Scroll');
    Scroll.extend({
        set: function (opt) {
            var that = this;
            $(window).on('scroll', function (event) {
                that.triggerEvents(event);
            });
        },
        add: function (opt) {
            //if set, skip
            if (!this.isSet) {
                this.set();
                this.isSet = true;
            }
            //add to events array
            if (!(this.events && $.isArray(this.events) && this.events.length > 0)) {
                this.events = [];
            }
            if (opt && opt.fn && $.isFunction(opt.fn)) {
                this.events.push({
                    obj: opt.obj,
                    fn: opt.fn
                });
            }

        },

        remove: function (opt) {
            if (this.events && $.isArray(this.events) && this.events.length > 0 && opt && opt.obj) {
                for (var i = 0, len = this.events.length; i < len; i++) {
                    var eventObj = this.events[i];
                    if (eventObj.obj === opt.obj) {
                        this.events.splice(i, 1);
                    }
                }
            }
        },

        triggerEvents: function (event) {
            if (this.events && $.isArray(this.events) && this.events.length > 0) {
                for (var i = 0, len = this.events.length; i < len; i++) {
                    var eventObj = this.events[i];
                    eventObj.fn(event);

                }
            }
        }
    });

    return Scroll;
});

define('toggleHeaderScroll',['jquery', 'group', 'scroll'
	], function ($, Grp, Scroll) {
    var ToggleHeaderScroll = Grp.obj.create('ToggleHeaderScroll');
    ToggleHeaderScroll.extend({
        scrollEventFn: function () {
            var opt = arguments[0];
            var event = arguments[1];
            
            var st = $(window).scrollTop();

            // Make sure they scroll more than delta
            if (Math.abs(opt.lastScrollTop - st) <= opt.delta)
                return;

            if (st > opt.lastScrollTop && st > opt.navbarHeight) {
                // Scroll Down
                opt.header.hide();
            } else {
                // Scroll Up
                if (st + $(window).height() < $(document).height()) {
                    opt.header.show();
                }
            }

            opt.lastScrollTop = st;
        },
        setToggleHeaderScroll: function (opt) {
            // Hide Header on on scroll down
            var $header = opt && opt.hasOwnProperty('header') ? opt.header : $('header');

            var opt_ = $.extend({}, {
                lastScrollTop: 0,
                delta: 5,
                header: $header,
                navbarHeight: $header.outerHeight()
            }, opt);

            Scroll.add({
                obj: this,
                fn: this.scrollEventFn.bind(this, opt_)
            });
        }
    });

    return ToggleHeaderScroll;
});

define('navbarGrp',['jquery', 'group', 'navbar', 'toggleHeaderScroll'
	], function ($, Grp, Navbar, ToggleHeaderScroll) {
	var NavbarGrp = Grp.group.create('NavbarGrp');
    var Navbar = Navbar.create('Navbar');
    var ToggleHeaderScroll = ToggleHeaderScroll.create('ToggleHeaderScroll');
    NavbarGrp.join(Navbar, ToggleHeaderScroll);
    
    NavbarGrp.setCallToMember('Navbar');
	return NavbarGrp;
});


define('tpl!templates/navBrand', [],function () { return function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<a class="navbar-brand pull-left" href="'+
((__t=( navBrand_url ))==null?'':__t)+
'">'+
((__t=( navBrand_html ))==null?'':__t)+
'</a>';
}
return __p;
}; });

define('navBrand',['jquery', 'component', 'tpl!templates/navBrand'
	], function ($, Component, tpl) {
	var NavBrand = Component.create('NavBrand');
	NavBrand.extend({
        defaultOpt: {
            navBrand_url: '#',
            navBrand_html: '',
            prepend: true,
        },
        tpl: tpl,
	});

	return NavBrand;
});


define('tpl!templates/navItem', [],function () { return function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<li class="nav-item ';
 if (pullright){ 
__p+='pull-right';
 } 
__p+=' ';
 if (active){ 
__p+='active';
 } 
__p+='">\r\n    <a class="nav-link" href="'+
((__t=( navItem_url ))==null?'':__t)+
'">\r\n        <span class="label label-danger label-pill pull-right">';
 if ( badge > 0 ){ 
__p+=''+
((__t=( badge ))==null?'':__t)+
'';
 } 
__p+='</span>\r\n        '+
((__t=( navItem_html ))==null?'':__t)+
'\r\n    </a>\r\n</li>';
}
return __p;
}; });

define('navItem',['jquery', 'component', 'tpl!templates/navItem'
	], function ($, Component, tpl) {
	var NavItem = Component.create('NavItem');
	NavItem.extend({
        defaultOpt: {
            navItem_url: '#',
            navItem_html: '',
            pullright: false,
            active: false,
            badge: 0,
        },
        tpl: tpl,
        setActive: function (opt) {
            this.setOpt({
                active: true,
            });
        },
	});

	return NavItem;
});


define('tpl!templates/navDropdownItem', [],function () { return function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<li class="nav-item dropdown ';
 if (pullright){ 
__p+='pull-right';
 } 
__p+=' ';
 if (active){ 
__p+='active';
 } 
__p+='">\r\n    <span class="label label-danger label-pill pull-right">';
 if ( badge > 0 ){ 
__p+=''+
((__t=( badge ))==null?'':__t)+
'';
 } 
__p+='</span>\r\n    <a class="nav-link dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">'+
((__t=( navItem_html ))==null?'':__t)+
'</a>\r\n    <div class="dropdown-menu">\r\n    </div>\r\n</li>';
}
return __p;
}; });

define('navDropdownItem',['jquery', 'navItem', 'tpl!templates/navDropdownItem'
	], function ($, NavItem, tpl) {
	var NavDropdownItem = NavItem.create('NavDropdownItem');
	NavDropdownItem.extend({
		tpl : tpl,
		setup : function (opt) {
			var that = this;
			if (opt.dropdown_items) {
				if ($.isArray(opt.dropdown_items)) {
					setDropdownItem(opt.dropdown_items);
				} else {
					if (window.LOG)
						LOG(TAG, 'Opt dropdown_items is not correct!', 'error');
				}
			}

			function setDropdownItem(items) {
				var len = items.length;
				var container = that.comp.find('.dropdown-menu');
				for (var i = 0; i < len; i++) {
					var item = items[i];
					item.cmd('render', $.extend({}, item.opt || {}, {
							container : container
						}));
				}
			}

			return this.comp;
		},
	});

	return NavDropdownItem;
});


define('tpl!templates/navUserItem', [],function () { return function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<li class="nav-item ';
 if (pullright){ 
__p+='pull-right';
 } 
__p+=' ';
 if (active){ 
__p+='active';
 } 
__p+='">\n    ';
 if (!navUserItem_user) { 
__p+='\n        <a class="btn btn-secondary left" href="'+
((__t=( navUserItem_signinUrl ))==null?'':__t)+
'" role="button">'+
((__t=( navUserItem_signText ))==null?'':__t)+
'</a>\n        <a class="btn btn-success left" href="'+
((__t=( navUserItem_signupUrl ))==null?'':__t)+
'" role="button">'+
((__t=( navUserItem_signupText ))==null?'':__t)+
'</a>\n    ';
 } else { 
__p+='\n      <li class="nav-item dropdown pull-right">\n          <span class="label label-danger label-pill pull-right">';
 if ( badge > 0 ){ 
__p+=''+
((__t=( badge ))==null?'':__t)+
'';
 } 
__p+='</span>\n          <a class="nav-link dropdown-toggle" data-toggle="dropdown" href="'+
((__t=( navItem_url ))==null?'':__t)+
'" role="button" aria-haspopup="true" aria-expanded="false"><img class="img-rounded profile_image" src="'+
((__t=( navUserItem_user.profile_img ))==null?'':__t)+
'"/>'+
((__t=( navUserItem_user.name ))==null?'':__t)+
'</a>\n          <div class="dropdown-menu">\n          </div>\n      </li>\n    ';
 } 
__p+='\n</li>\n';
}
return __p;
}; });

define('navUserItem',['jquery', 'navDropdownItem', 'tpl!templates/navUserItem'
	], function ($, NavDropdownItem, tpl) {
	var NavUserItem = NavDropdownItem.create('NavUserItem');
	NavUserItem.extend({
        defaultOpt: $.extend({}, NavDropdownItem.defaultOpt, {
            navUserItem_user: null,
            navUserItem_signinUrl:'/login',
            navUserItem_signText:'Login',
            navUserItem_signupUrl: '/signup',
            navUserItem_signupText: 'Signup'
        }),
        tpl: tpl,
        setup: function(opt) {
            if (opt.navUserItem_user) {
                return NavDropdownItem.setup.call(this, opt);
            }
            
            return this.comp;
        }
	});

	return NavUserItem;
});



define('tpl!templates/dropdownItem', [],function () { return function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<a class="dropdown-item ';
 if (pullright){ 
__p+='pull-right';
 } 
__p+='" href="'+
((__t=( dropdownItem_url ))==null?'':__t)+
'">'+
((__t=( dropdownItem_html ))==null?'':__t)+
'</a>';
}
return __p;
}; });

define('dropdownItem',['jquery', 'component', 'tpl!templates/dropdownItem'
	], function ($, Component, tpl) {
	var DropdownItem = Component.create('DropdownItem');
	DropdownItem.extend({
        defaultOpt: {
            dropdownItem_url: '#',
            dropdownItem_html: '',
            pullright: false,
        },
        tpl: tpl,
	});

	return DropdownItem;
});


define('tpl!templates/dropdownDivider', [],function () { return function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div class="dropdown-divider"></div>';
}
return __p;
}; });

define('dropdownDivider',['jquery', 'component', 'tpl!templates/dropdownDivider'
	], function ($, Component, tpl) {
	var DropdownDivider = Component.create('DropdownDivider');
	DropdownDivider.extend({
        defaultOpt: {
            navItem_url: '#',
            navItem_html: '',
            pullright: false,
        },
        tpl: tpl,
	});

	return DropdownDivider;
});

define('fetcher',['jquery', 'group', 'scroll'
	], function ($, Grp, Scroll) {
    var Fetcher = Grp.obj.create('Fetcher');
    Fetcher.extend({
        jqxhr: null,
        timeoutHandler: null,
        initOpt: {
            data: {},
            done: function () {},
            fail: function (err) {
                console.error(err);
            },
            always: function () {},
            dataType: 'json'
        },
        stop: function (opt) {
            if (this.jqxhr) this.jqxhr.abort();
            Scroll.remove({ obj: this });
            if (this.timeoutHandler) clearTimeout(this.timeoutHandler);
        },
        get: function (opt) {
            var opt_ = $.extend({}, this.initOpt, opt);
            this.jqxhr = $.get({
                    url: opt_.url,
                    data: opt_.data,
                    dataType: opt_.dataType,
                    context: this,
                })
                .done(function (result) {
                    opt_.done(result);
                })
                .fail(function (err) {
                    opt_.fail(err);
                })
                .always(function () {
                    opt_.always();
                });
        },
        setScrollEndFetch: function (opt) {
            Scroll.add({
                obj: this,
                fn: this.scrollEventFn.bind(this, opt)
            });
        },

        scrollEventFn: function () {
            var opt = arguments[0];
            var event = arguments[1];

            var that = this;
            var nearToBottom = 100; //near 100 px from bottom, better to start loading
            if ($(document).height() - nearToBottom <= $(window).scrollTop() + $(window).height()) {
                //fetch more content
                function fetchNext() {
                    if (opt.pageLoading) { //we want it to match
                        this.timeoutHandler = setTimeout(fetchNext, 50); //wait 50 millisecnds then recheck
                        return;
                    }
                    if (!opt.lastPage) {
                        opt.pageLoading = true;
                        var opt_ = {
                            url: opt.getUrl(),
                            done: opt.afterNextFetch
                        }
                        that.get(opt_);
                    }
                }

                fetchNext();
            }
        }
    });

    return Fetcher;
});

define('listScrollEndFetchGrp',['jquery', 'group', 'listItemGrp', 'collectionGrp', 'fetcher'], function ($, Grp, ListItemGrp, CollectionGrp, Fetcher) {
    var ListScrollEndFetchGrp = Grp.group.create('ListScrollEndFetchGrp');
    var listItemGrp = ListItemGrp.create('listItemGrp');
    var collectionGrp = CollectionGrp.create('collectionGrp');
    var fetcher = Fetcher.create('fetcher');
    ListScrollEndFetchGrp.join(listItemGrp, collectionGrp, fetcher);
    
    ListScrollEndFetchGrp.extend({
        initOpt: {},
        reset: function (opt) {
            this.call('fetcher', 'stop');
            this.call('listItemGrp', 'reset');
            this.call('collectionGrp', 'reset');
            var opt_ = {};
            $.extend(opt_, this.initOpt, opt||{});
            this.set(opt_);
        },
        set: function (opt) {
            if (opt) $.extend(this.initOpt, opt);
            var thatGrp = this;
            //declaration
            var container = opt.container;
            var page = 1;
            var pageLoading = false;
            function getUrl() {
                return opt.getUrl(page, opt.input_vaule||null);
            }

            //fetch data from server API for initial dataset
            var opt_firstFetch = {
                url: getUrl(),
                done: afterFirstFetch
            }
            thatGrp.call('fetcher', 'get', opt_firstFetch);

            //after first load process
            function afterFirstFetch(firstResult) {
                /*
                   main logic
                */
                //prepare for next load
                var lastPage = false;

                function setNext(result) {
                    if (result.page == result.pages || lastPage) {
                        lastPage = true;
                    } else {
                        page++;
                    }
                }

                function afterNextFetch(nextResult) {
                    setNext(nextResult);
                    //rendering list next time
                    var opt_next = {
                        list_data: thatGrp.call('collectionGrp', 'addExtra', {
                            values: nextResult.docs
                        }),
                    };
                    thatGrp.call('listItemGrp', 'setup', opt_next);
                    pageLoading = false;
                }

                setNext(firstResult);

                //rendering list fisrt time
                var opt_ = {
                    container: container,
                    list_data: thatGrp.call('collectionGrp', 'add', {
                        values: firstResult.docs
                    }),
                };
                thatGrp.call('listItemGrp', 'render', opt_);

                //scroll to end function
                var opt_next = {
                    pageLoading: pageLoading,
                    lastPage: lastPage,
                    getUrl: getUrl,
                    afterNextFetch: afterNextFetch
                };
                thatGrp.call('fetcher', 'setScrollEndFetch', opt_next);
            }
        }
    });


    return ListScrollEndFetchGrp;
});

require([
    'component',
    'count',
    'entity',
    'collection',
    'collectionGrp',
    'form',
    'formGrp',
    'item',
    'list',
    'listItemGrp',
    'prompt',
    'promptFormGrp',
    'textarea',
    'textareaCountGrp',
    'request',
    'button',
    'input',
    'inputPassword',
    'inputGrp',
    'inputEmailGrp',
    'navbar',
    'navbarGrp',
    'navBrand',
    'navItem',
    'navUserItem',
    'navDropdownItem',
    'dropdownItem',
    'dropdownDivider',
    'fetcher',
    'listScrollEndFetchGrp',
    'toggleHeaderScroll',
    'scroll'
], function () {});

define("../../build/main", function(){});

