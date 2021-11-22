(function () {
    //  json2.js
    //  2017-06-12
    //  Public Domain.
    //  NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    if (typeof JSON !== "object") {
        JSON = {};
    }

    (function () {
        "use strict";

        var rx_one = /^[\],:{}\s]*$/;
        var rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
        var rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
        var rx_four = /(?:^|:|,)(?:\s*\[)+/g;
        var rx_escapable = /[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
        var rx_dangerous = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

        function f(n) {
            // Format integers to have at least two digits.
            return (n < 10)
                ? "0" + n
                : n;
        }

        function this_value() {
            return this.valueOf();
        }

        if (typeof Date.prototype.toJSON !== "function") {

            Date.prototype.toJSON = function () {

                return isFinite(this.valueOf())
                    ? (
                        this.getUTCFullYear()
                        + "-"
                        + f(this.getUTCMonth() + 1)
                        + "-"
                        + f(this.getUTCDate())
                        + "T"
                        + f(this.getUTCHours())
                        + ":"
                        + f(this.getUTCMinutes())
                        + ":"
                        + f(this.getUTCSeconds())
                        + "Z"
                    )
                    : null;
            };

            Boolean.prototype.toJSON = this_value;
            Number.prototype.toJSON = this_value;
            String.prototype.toJSON = this_value;
        }

        var gap;
        var indent;
        var meta;
        var rep;


        function quote(string) {

            // If the string contains no control characters, no quote characters, and no
            // backslash characters, then we can safely slap some quotes around it.
            // Otherwise we must also replace the offending characters with safe escape
            // sequences.

            rx_escapable.lastIndex = 0;
            return rx_escapable.test(string)
                ? "\"" + string.replace(rx_escapable, function (a) {
                    var c = meta[a];
                    return typeof c === "string"
                        ? c
                        : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
                }) + "\""
                : "\"" + string + "\"";
        }


        function str(key, holder) {

            // Produce a string from holder[key].

            var i;          // The loop counter.
            var k;          // The member key.
            var v;          // The member value.
            var length;
            var mind = gap;
            var partial;
            var value = holder[key];

            // If the value has a toJSON method, call it to obtain a replacement value.

            if (
                value
                && typeof value === "object"
                && typeof value.toJSON === "function"
            ) {
                value = value.toJSON(key);
            }

            // If we were called with a replacer function, then call the replacer to
            // obtain a replacement value.

            if (typeof rep === "function") {
                value = rep.call(holder, key, value);
            }

            // What happens next depends on the value's type.

            switch (typeof value) {
                case "string":
                    return quote(value);

                case "number":

                    // JSON numbers must be finite. Encode non-finite numbers as null.

                    return (isFinite(value))
                        ? String(value)
                        : "null";

                case "boolean":
                case "null":

                    // If the value is a boolean or null, convert it to a string. Note:
                    // typeof null does not produce "null". The case is included here in
                    // the remote chance that this gets fixed someday.

                    return String(value);

                // If the type is "object", we might be dealing with an object or an array or
                // null.

                case "object":

                    // Due to a specification blunder in ECMAScript, typeof null is "object",
                    // so watch out for that case.

                    if (!value) {
                        return "null";
                    }

                    // Make an array to hold the partial results of stringifying this object value.

                    gap += indent;
                    partial = [];

                    // Is the value an array?

                    if (Object.prototype.toString.apply(value) === "[object Array]") {

                        // The value is an array. Stringify every element. Use null as a placeholder
                        // for non-JSON values.

                        length = value.length;
                        for (i = 0; i < length; i += 1) {
                            partial[i] = str(i, value) || "null";
                        }

                        // Join all of the elements together, separated with commas, and wrap them in
                        // brackets.

                        v = partial.length === 0
                            ? "[]"
                            : gap
                                ? (
                                    "[\n"
                                    + gap
                                    + partial.join(",\n" + gap)
                                    + "\n"
                                    + mind
                                    + "]"
                                )
                                : "[" + partial.join(",") + "]";
                        gap = mind;
                        return v;
                    }

                    // If the replacer is an array, use it to select the members to be stringified.

                    if (rep && typeof rep === "object") {
                        length = rep.length;
                        for (i = 0; i < length; i += 1) {
                            if (typeof rep[i] === "string") {
                                k = rep[i];
                                v = str(k, value);
                                if (v) {
                                    partial.push(quote(k) + (
                                        (gap)
                                            ? ": "
                                            : ":"
                                    ) + v);
                                }
                            }
                        }
                    } else {

                        // Otherwise, iterate through all of the keys in the object.

                        for (k in value) {
                            if (Object.prototype.hasOwnProperty.call(value, k)) {
                                v = str(k, value);
                                if (v) {
                                    partial.push(quote(k) + (
                                        (gap)
                                            ? ": "
                                            : ":"
                                    ) + v);
                                }
                            }
                        }
                    }

                    // Join all of the member texts together, separated with commas,
                    // and wrap them in braces.

                    v = partial.length === 0
                        ? "{}"
                        : gap
                            ? "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}"
                            : "{" + partial.join(",") + "}";
                    gap = mind;
                    return v;
            }
        }

        // If the JSON object does not yet have a stringify method, give it one.

        if (typeof JSON.stringify !== "function") {
            meta = {    // table of character substitutions
                "\b": "\\b",
                "\t": "\\t",
                "\n": "\\n",
                "\f": "\\f",
                "\r": "\\r",
                "\"": "\\\"",
                "\\": "\\\\"
            };
            JSON.stringify = function (value, replacer, space) {

                // The stringify method takes a value and an optional replacer, and an optional
                // space parameter, and returns a JSON text. The replacer can be a function
                // that can replace values, or an array of strings that will select the keys.
                // A default replacer method can be provided. Use of the space parameter can
                // produce text that is more easily readable.

                var i;
                gap = "";
                indent = "";

                // If the space parameter is a number, make an indent string containing that
                // many spaces.

                if (typeof space === "number") {
                    for (i = 0; i < space; i += 1) {
                        indent += " ";
                    }

                    // If the space parameter is a string, it will be used as the indent string.

                } else if (typeof space === "string") {
                    indent = space;
                }

                // If there is a replacer, it must be a function or an array.
                // Otherwise, throw an error.

                rep = replacer;
                if (replacer && typeof replacer !== "function" && (
                    typeof replacer !== "object"
                    || typeof replacer.length !== "number"
                )) {
                    throw new Error("JSON.stringify");
                }

                // Make a fake root object containing our value under the key of "".
                // Return the result of stringifying the value.

                return str("", { "": value });
            };
        }


        // If the JSON object does not yet have a parse method, give it one.

        if (typeof JSON.parse !== "function") {
            JSON.parse = function (text, reviver) {

                // The parse method takes a text and an optional reviver function, and returns
                // a JavaScript value if the text is a valid JSON text.

                var j;

                function walk(holder, key) {

                    // The walk method is used to recursively walk the resulting structure so
                    // that modifications can be made.

                    var k;
                    var v;
                    var value = holder[key];
                    if (value && typeof value === "object") {
                        for (k in value) {
                            if (Object.prototype.hasOwnProperty.call(value, k)) {
                                v = walk(value, k);
                                if (v !== undefined) {
                                    value[k] = v;
                                } else {
                                    delete value[k];
                                }
                            }
                        }
                    }
                    return reviver.call(holder, key, value);
                }


                // Parsing happens in four stages. In the first stage, we replace certain
                // Unicode characters with escape sequences. JavaScript handles many characters
                // incorrectly, either silently deleting them, or treating them as line endings.

                text = String(text);
                rx_dangerous.lastIndex = 0;
                if (rx_dangerous.test(text)) {
                    text = text.replace(rx_dangerous, function (a) {
                        return (
                            "\\u"
                            + ("0000" + a.charCodeAt(0).toString(16)).slice(-4)
                        );
                    });
                }

                // In the second stage, we run the text against regular expressions that look
                // for non-JSON patterns. We are especially concerned with "()" and "new"
                // because they can cause invocation, and "=" because it can cause mutation.
                // But just to be safe, we want to reject all unexpected forms.

                // We split the second stage into 4 regexp operations in order to work around
                // crippling inefficiencies in IE's and Safari's regexp engines. First we
                // replace the JSON backslash pairs with "@" (a non-JSON character). Second, we
                // replace all simple value tokens with "]" characters. Third, we delete all
                // open brackets that follow a colon or comma or that begin the text. Finally,
                // we look to see that the remaining characters are only whitespace or "]" or
                // "," or ":" or "{" or "}". If that is so, then the text is safe for eval.

                if (
                    rx_one.test(
                        text
                            .replace(rx_two, "@")
                            .replace(rx_three, "]")
                            .replace(rx_four, "")
                    )
                ) {

                    // In the third stage we use the eval function to compile the text into a
                    // JavaScript structure. The "{" operator is subject to a syntactic ambiguity
                    // in JavaScript: it can begin a block or an object literal. We wrap the text
                    // in parens to eliminate the ambiguity.

                    j = eval("(" + text + ")");

                    // In the optional fourth stage, we recursively walk the new structure, passing
                    // each name/value pair to a reviver function for possible transformation.

                    return (typeof reviver === "function")
                        ? walk({ "": j }, "")
                        : j;
                }

                // If the text is not JSON parseable, then a SyntaxError is thrown.

                throw new SyntaxError("JSON.parse");
            };
        }
    }());
})();

var $http = (function () {

    // JSON library for javascript, I took from somewhere but i don't remember where i took it.
    "object" != typeof JSON && (JSON = {}), function () { "use strict"; function f(t) { return 10 > t ? "0" + t : t } function this_value() { return this.valueOf() } function quote(t) { return escapable.lastIndex = 0, escapable.test(t) ? '"' + t.replace(escapable, function (t) { var e = meta[t]; return "string" == typeof e ? e : "\\u" + ("0000" + t.charCodeAt(0).toString(16)).slice(-4) }) + '"' : '"' + t + '"' } function str(t, e) { var n, r, o, u, f, i = gap, a = e[t]; switch (a && "object" == typeof a && "function" == typeof a.toJSON && (a = a.toJSON(t)), "function" == typeof rep && (a = rep.call(e, t, a)), typeof a) { case "string": return quote(a); case "number": return isFinite(a) ? String(a) : "null"; case "boolean": case "null": return String(a); case "object": if (!a) return "null"; if (gap += indent, f = [], "[object Array]" === Object.prototype.toString.apply(a)) { for (u = a.length, n = 0; u > n; n += 1)f[n] = str(n, a) || "null"; return o = 0 === f.length ? "[]" : gap ? "[\n" + gap + f.join(",\n" + gap) + "\n" + i + "]" : "[" + f.join(",") + "]", gap = i, o } if (rep && "object" == typeof rep) for (u = rep.length, n = 0; u > n; n += 1)"string" == typeof rep[n] && (r = rep[n], o = str(r, a), o && f.push(quote(r) + (gap ? ": " : ":") + o)); else for (r in a) Object.prototype.hasOwnProperty.call(a, r) && (o = str(r, a), o && f.push(quote(r) + (gap ? ": " : ":") + o)); return o = 0 === f.length ? "{}" : gap ? "{\n" + gap + f.join(",\n" + gap) + "\n" + i + "}" : "{" + f.join(",") + "}", gap = i, o } } "function" != typeof Date.prototype.toJSON && (Date.prototype.toJSON = function () { return isFinite(this.valueOf()) ? this.getUTCFullYear() + "-" + f(this.getUTCMonth() + 1) + "-" + f(this.getUTCDate()) + "T" + f(this.getUTCHours()) + ":" + f(this.getUTCMinutes()) + ":" + f(this.getUTCSeconds()) + "Z" : null }, Boolean.prototype.toJSON = this_value, Number.prototype.toJSON = this_value, String.prototype.toJSON = this_value); var cx, escapable, gap, indent, meta, rep; "function" != typeof JSON.stringify && (escapable = /[\\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, meta = { "\b": "\\b", "	": "\\t", "\n": "\\n", "\f": "\\f", "\r": "\\r", '"': '\\"', "\\": "\\\\" }, JSON.stringify = function (t, e, n) { var r; if (gap = "", indent = "", "number" == typeof n) for (r = 0; n > r; r += 1)indent += " "; else "string" == typeof n && (indent = n); if (rep = e, e && "function" != typeof e && ("object" != typeof e || "number" != typeof e.length)) throw new Error("JSON.stringify"); return str("", { "": t }) }), "function" != typeof JSON.parse && (cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, JSON.parse = function (text, reviver) { function walk(t, e) { var n, r, o = t[e]; if (o && "object" == typeof o) for (n in o) Object.prototype.hasOwnProperty.call(o, n) && (r = walk(o, n), void 0 !== r ? o[n] = r : delete o[n]); return reviver.call(t, e, o) } var j; if (text = String(text), cx.lastIndex = 0, cx.test(text) && (text = text.replace(cx, function (t) { return "\\u" + ("0000" + t.charCodeAt(0).toString(16)).slice(-4) })), /^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) return j = eval("(" + text + ")"), "function" == typeof reviver ? walk({ "": j }, "") : j; throw new SyntaxError("JSON.parse") }) }();

    return function (config) {
        var url = (/^(.*):\/\/([A-Za-z0-9\-\.]+):?([0-9]+)?(.*)$/).exec(config.url);
        if (url == null) {
            throw "unable to parse URL";
        }

        url = {
            scheme: url[1],
            host: url[2],
            port: url[3] || (url[1] == "https" ? 443 : 80),
            path: url[4]
        };

        if (url.scheme != "http") {
            throw "non-http url's not supported yet!";
        }

        var s = new Socket();
        s.timeout = 20;
        if (!s.open(url.host + ':' + url.port, 'binary')) {
            throw 'can\'t connect to ' + url.host + ':' + url.port;
        }

        var method = config.method || 'GET';

        var request = method + ' ' + url.path + " HTTP/1.0\r\nConnection: close\r\nHost: " + url.host;
        var header;

        if (config.payload) {
            if (typeof config.payload === 'object') {
                config.payload = JSON.stringify(config.payload);
                (config.headers = config.headers || {})["Content-Type"] = "application/json";
            }

            (config.headers = config.headers || {})["Content-Length"] = config.payload.length;
        }

        for (header in (config.headers || {})) {
            request += "\r\n" + header + ': ' + config.headers[header];
        }

        s.write(request + "\r\n\r\n");

        if (config.payload) {
            s.write(config.payload);
        }

        var data, response, payload, http = {};

        data = s.read();
        while (!s.eof) {
            data += s.read();
        }

        var response = data.indexOf("\r\n\r\n");
        if (response == -1) {
            throw "No HTTP payload found in the response!";
        }

        payload = data.substr(response + 4);
        response = data.substr(0, response);

        var http = /^HTTP\/([\d\.?]+) (\d+) (.*)\r/.exec(response), header;
        if (http == null) {
            throw "No HTTP payload found in the response!";
        }

        http = {
            ver: Number(http[1]),
            status: Number(http[2]),
            statusMessage: http[3],
            headers: {}
        };

        var httpregex = /(.*): (.*)\r/g;

        while (header = httpregex.exec(response)) {
            http.headers[header[1]] = header[2];
        }

        var contenttype = (http.headers["Content-Type"] || http.headers["content-type"] || '').split(";");
        var charset = config.charset || (contenttype[1] ? /charset=(.*)/.exec(contenttype[1])[1] : null);
        if (charset) payload = payload.toString(charset);
        contenttype = contenttype[0];

        if (config.forcejson || contenttype == "application/json") {
            http.payload = JSON.parse(payload);
        } else {
            http.payload = payload;
        }

        return http;
    };
})();


function getSubFileItems(subFilePath, sourcPath) {
    try {
        var sunbfiles = [];
        var textsubFolder = Folder(subFilePath).getFiles();

        for (var i = 0; i < textsubFolder.length; i++) {
            if (textsubFolder[i] instanceof Folder) {

                // logoImage.onClick= function() {
                //     var item = new ImportOptions();
                //     item.file = new File(this.properties.path);
                //     var Item = app.project.importFile(item);
                // };
                var settingFile = new File(textsubFolder[i].fullName + '/' + textsubFolder[i].name + '.json');
                if (settingFile.exists) {
                    sunbfiles.push({
                        fileName: textsubFolder[i].name.replace(/%20/g, " "),
                        demoGifFilePath: './' + sourcPath + '/' + textsubFolder[i].name + '/demo.gif',
                        //demoThumbFilePath: './' + sourcPath + '/' + textsubFolder[i].name + '/demo.png',
                        projectPath: textsubFolder[i].fullName + '/' + textsubFolder[i].name + '.aep',
                        settingPath: './' + sourcPath + '/' + textsubFolder[i].name + '/' + textsubFolder[i].name + '.json'
                    });
                } else {
                    sunbfiles.push({
                        fileName: textsubFolder[i].name.replace(/%20/g, " "),
                        demoGifFilePath: './' + sourcPath + '/' + textsubFolder[i].name + '/demo.gif',
                        //demoThumbFilePath: './' + sourcPath + '/' + textsubFolder[i].name + '/demo.png',
                        projectPath: textsubFolder[i].fullName + '/' + textsubFolder[i].name + '.aep',
                        settingPath: ''
                    });
                }

            }
        }
        return sunbfiles;
    }
    catch (e) {
        var err = { err: true, msg: ' -- line : ' + e.line + ' --- err.msg : ' + e.message };
        return err;
    }
}

function getSubMenuItems(subMenuPath, sourcPath) {
    try {
        var sunbMenu = [];
        var textsubFolder = Folder(subMenuPath).getFiles();

        for (var i = 0; i < textsubFolder.length; i++) {
            if (textsubFolder[i] instanceof Folder) {
                var subfiles = getSubFileItems(textsubFolder[i].fullName, sourcPath + '/' + textsubFolder[i].name);
                if (subfiles.err) { return subfiles; }

                sunbMenu.push({
                    subMenuName: textsubFolder[i].name.replace(/%20/g, " "),
                    subFiles: subfiles,
                    demo: './' + sourcPath + '/' + textsubFolder[i].name + '/demo.gif'
                });
            }
        }
        return sunbMenu;
    }
    catch (e) {
        var err = { err: true, msg: ' -- line : ' + e.line + ' --- err.msg : ' + e.message };
        return err;
    }
}


function getMainDirectories(myPath, appInfo) {
    try {
        var appInfo_params = JSON.parse(appInfo);

        var settingPath = getpathFromSetting();
        if (settingPath.length == 0 || settingPath != myPath) {
            app.settings.saveSetting("_wt", "myPath" + app.version, myPath);
        }
        var settingAppName = getAppNameFromSetting();
        if (settingAppName.length == 0 || settingAppName != appInfo_params.appName) {
            app.settings.saveSetting("_wt", "appName" + app.version, appInfo_params.appName);
        }

        var files = [];
        var textPath = '/assets/packages';
        var textsubFolder = Folder(myPath + textPath).getFiles();

        if (canWriteFiles()) {

            var res = mactichekti(myPath);

            if (res.err == true) {
                if (res.msg == "!") {
                    //var err = JSON.stringify({ err: true, pc : "first" });
                    var err = JSON.stringify({ err: true, pc: "mofo" });
                    err = JSON.stringify({ err: true, pc: "gtofo" });
                    //var err = JSON.stringify({ err: true, pc : "first" });
                    err = JSON.stringify({ err: true, pc: "trolololol" });
                    //var err = JSON.stringify({ err: true, pc : "first" });
                    return err;
                }
                else if (res.msg != "connectionerror") {
                    alert(res.msg);
                    err = JSON.stringify({ err: true, pc: "trolololol" });
                    return err;
                }
                //else if (parseInt(getConnectionFromSetting()) < 6) {
                //    alert("Your internet connection did not let us check the Activation\nAfter 6 attempts this extension will deactive automaticaly!\n" + (parseInt(getConnectionFromSetting()) - 6) + " left!");
                //} else if (parseInt(getConnectionFromSetting()) >= 6) {
                //    //var err = JSON.stringify({ err: true, pc : "first" });
                //    err = JSON.stringify({ err: true, pc: "mofo" });
                //    err = JSON.stringify({ err: true, pc: "gtofo" });
                //    //var err = JSON.stringify({ err: true, pc : "first" });
                //    err = JSON.stringify({ err: true, pc: "trolololol" });
                //    //var err = JSON.stringify({ err: true, pc : "first" });
                //}
            }

            for (var i = 0; i < textsubFolder.length; i++) {
                if (textsubFolder[i] instanceof Folder) {
                    var subMenus = getSubMenuItems(textsubFolder[i].fullName, textPath + '/' + textsubFolder[i].name);
                    if (subMenus.err) { return subMenus; }
                    files.push({
                        menuName: textsubFolder[i].name.replace(/%20/g, " "),
                        mainPath: textsubFolder[i].fullName,
                        subMenuNames: subMenus,
                        demo: './' + textPath + '/' + textsubFolder[i].name + '/demo.gif',
                    });
                }
            }

            var x = JSON.stringify(files);
            return x;
        }
    }
    catch (e) {
        var err = JSON.stringify({ err: true, msg: ' -- line : ' + e.line + ' --- err.msg : ' + e.message });
        return err;
    }
}

function getAllComps() {
    try {
        if (everythingOk()) {
            var comps = [];
            var proj = app.project;

            var numitems = proj.numItems
            for (var i = 1; i < numitems; i++) {
                if (proj.item(i).typeName === "Composition") {
                    comps.push({ compName: proj.item(i).parentFolder.name + ' > ' + proj.item(i).name, compItemIndex: i });
                }
            }
            var js = JSON.stringify(comps);
            return js;
        }
    }
    catch (e) {
        var err = JSON.stringify({ err: true, msg: ' -- line : ' + e.line + ' --- err.msg : ' + e.message });
        return err;
    }
}

function getAllLayersInComp(compIndex) {
    try {
        if (everythingOk()) {
            var allLayers = [];
            var proj = app.project;
            var curentComp = undefined;
            if (compIndex === 0) {
                curentComp = proj.activeItem;
            } else {
                curentComp = proj.item(compIndex);
            }

            if (!curentComp) {
                //alert("No active Comp. found!! active or select a Comp. to fetch layers")
                var js = JSON.stringify(allLayers);
                return js;
            }
            var numLayers = curentComp.numLayers;
            for (var i = 1; i <= numLayers; i++) {
                allLayers.push({ layerName: curentComp.layer(i).name.replace('<', ' ').replace('>', ' '), layerIndex: i });
            }
            var js = JSON.stringify(allLayers);
            return js;
        }
    }
    catch (e) {
        var err = JSON.stringify({ err: true, msg: ' -- line : ' + e.line + ' --- err.msg : ' + e.message });
        return err;
    }
}

function importBasicHud(projPath, params, projectName) {
    if (everythingOk()) {
        try {
            var obj_params = JSON.parse(params);
            var comps = [];
            var _startTime = 0;
            var _endTime = 0;
            obj_params.labelColor = Math.floor((Math.random() * 17));
            var proj = app.project;
            var parent = undefined;
            if (parseInt(obj_params.comp) === 0) {
                if (proj.activeItem.typeName === "Composition") {
                    parent = proj.activeItem;
                } else {
                    var err = JSON.stringify({ err: true, msg: 'no active comp found. please select a comp and click refresh button!' });
                    return err;
                }
            } else {
                if (proj.item(parseInt(obj_params.comp)).typeName === "Composition") {
                    parent = proj.item(parseInt(obj_params.comp));
                } else {
                    var err = JSON.stringify({ err: true, msg: 'no Comp found found. please select a comp and click refresh button!' });
                    return err;
                }
                if (parent === undefined || parent === null) {
                    var err = JSON.stringify({ err: true, msg: 'no Comp found, please select composition again!' });
                    return err;
                }
            }

            if (parent === undefined || parent === null) {
                var err = JSON.stringify({ err: true, msg: 'no active comp found. please select a comp and click refresh button!' });
                return err;
            }

            if (obj_params.cti.fromCti) {
                _startTime = parent.time;
                _endTime = parent.duration
            } else {
                _startTime = parseFloat(obj_params.cti.startTime);
                _endTime = parseFloat(obj_params.cti.endTime);
            }

            if (_endTime === 0) {
                _endTime = parent.duration;
            }


            if (_endTime !== 0) {
                if (_startTime >= _endTime) {
                    return "{'error' :'end time is not correct!'}"
                }

                if (_endTime > parent.workAreaDuration) {
                    _endTime = parent.duration;
                }
            }

            var hudStickerLayer = undefined;
            if (obj_params.sticker != 0) {
                hudStickerLayer = parent.layer(parseInt(obj_params.sticker));
            }

            if (hudStickerLayer instanceof AVLayer) {
                var item = new ImportOptions();
                item.file = new File(projPath);
                var hudFolder = proj.importFile(item);
                var RootComp = undefined;

                var hudFolder_numitems = hudFolder.numItems
                for (var i = 1; i <= hudFolder_numitems; i++) {
                    if (hudFolder.item(i).typeName === "Composition" && hudFolder.item(i).name === projectName) {
                        RootComp = hudFolder.item(i);
                        continue;
                    }
                }

                var selectedLayers = parent.selectedLayers;
                for (var i = 0; i < selectedLayers.length; i++) {
                    selectedLayers[i].selected = false;
                }

                var x = RootComp.layer(1);
                x.copyToComp(parent);

                var hudCompInParent = parent.layer(1);
                hudCompInParent.name = hudCompInParent.name + "-" + parent.layers.length
                hudCompInParent.label = obj_params.labelColor;
                if (hudStickerLayer !== undefined && hudStickerLayer) {

                    hudCompInParent.Effects.addProperty("Layer Control").property("Layer").setValue(hudStickerLayer.index);


                    if (hudStickerLayer.threeDLayer == true) {
                        hudCompInParent.threeDLayer = true;
                    } else {
                        hudCompInParent.threeDLayer = false;
                    }

                    if (obj_params.link) {

                        if (obj_params.position) {
                            if (hudCompInParent.transform.position.canSetExpression) {
                                hudCompInParent.transform.position.expression = 'effect("Layer Control")("Layer").position;'
                            }
                        }

                        if (obj_params.rotation) {

                            if (hudCompInParent.threeDLayer == false) {
                                if (hudCompInParent.transform.rotation.canSetExpression) {
                                    hudCompInParent.transform.rotation.expression = 'effect("Layer Control")("Layer").transform.rotation;'
                                }
                            } else {
                                hudCompInParent.transform.orientation.expression = 'effect("Layer Control")("Layer").transform.orientation;'
                            }
                        }
                    } else {
                        if (obj_params.position) {

                            hudCompInParent.transform.position.setValue(hudStickerLayer.transform.position.value);
                        }

                        if (obj_params.rotation) {
                            if (hudCompInParent.threeDLayer == false) {
                                hudCompInParent.transform.rotation.setValue(hudStickerLayer.transform.rotation.value);
                            } else {
                                hudCompInParent.transform.orientation.setValue(hudStickerLayer.transform.orientation.value);
                                hudCompInParent.transform.xRotation.setValue(hudStickerLayer.transform.xRotation.value);
                                hudCompInParent.transform.yRotation.setValue(hudStickerLayer.transform.yRotation.value);
                                if (hudStickerLayer.transform.zRotation) {
                                    hudCompInParent.transform.zRotation.setValue(hudStickerLayer.transform.zRotation.value);
                                }
                            }
                        }
                    }

                    hudCompInParent.startTime = _startTime;

                    if (_endTime !== 0) {
                        hudCompInParent.outPoint = _endTime;
                    }

                    hudCompInParent.selected = false;

                } else {
                    hudCompInParent.startTime = _startTime;

                    if (_endTime !== 0) {
                        hudCompInParent.outPoint = _endTime;
                    }
                    hudCompInParent.selected = false;
                }
                hudFolder.remove();

                return JSON.stringify({ res: 'ok' })
            }
        }
        catch (e) {
            var err = JSON.stringify({ err: true, msg: ' -- line : ' + e.line + ' --- err.msg : ' + e.message });
            return err;
        }
    }
}

function importBasicSizeline(projPath, params, projectName, textsizePath) {
    if (everythingOk()) {
        try {
            var obj_params = JSON.parse(params);
            var comps = [];
            var _startTime = 0;
            var _endTime = 0;
            obj_params.labelColor = Math.floor((Math.random() * 17));
            var proj = app.project;

            var parent = undefined;
            if (parseInt(obj_params.comp) === 0) {
                if (proj.activeItem.typeName === "Composition") {
                    parent = proj.activeItem;
                } else {
                    var err = JSON.stringify({ err: true, msg: 'no active comp found. please select a comp and click refresh button!' });
                    return err;
                }
            } else {
                if (proj.item(parseInt(obj_params.comp)).typeName === "Composition") {
                    parent = proj.item(parseInt(obj_params.comp));
                } else {
                    var err = JSON.stringify({ err: true, msg: 'no Comp found found. please select a comp and click refresh button!' });
                    return err;
                }
                if (parent === undefined || parent === null) {
                    var err = JSON.stringify({ err: true, msg: 'no Comp found, please select composition again!' });
                    return err;
                }
            }

            if (parent === undefined || parent === null) {
                var err = JSON.stringify({ err: true, msg: 'no active comp found. please select a comp and click refresh button!' });
                return err;
            }

            if (obj_params.cti.fromCti) {
                _startTime = parent.time;
                _endTime = parent.duration
            } else {
                _startTime = parseFloat(obj_params.cti.startTime);
                _endTime = parseFloat(obj_params.cti.endTime);
            }

            if (_endTime === 0) {
                _endTime = parent.duration;
            }


            if (_endTime !== 0) {
                if (_startTime >= _endTime) {
                    return "{'error' :'end time is not correct!'}"
                }

                if (_endTime > parent.workAreaDuration) {
                    _endTime = parent.duration;
                }
            }


            var hudStartLayer = undefined;
            var hudEndLayer = undefined;
            if (obj_params.start != 0) {

                hudStartLayer = parent.layer(parseInt(obj_params.start));
            }

            if (obj_params.end != 0) {

                hudEndLayer = parent.layer(parseInt(obj_params.end));
            }

            var item = new ImportOptions();
            item.file = new File(projPath);
            var hudFolder = proj.importFile(item);

            var RootComp = undefined;

            var hudFolder_numitems = hudFolder.numItems
            for (var i = 1; i <= hudFolder_numitems; i++) {
                if (hudFolder.item(i).typeName === "Composition" && hudFolder.item(i).name === projectName) {
                    RootComp = hudFolder.item(i);
                    continue;
                }
            }

            var selectedLayers = parent.selectedLayers;
            for (var i = 0; i < selectedLayers.length; i++) {
                selectedLayers[i].selected = false;
            }

            var x = RootComp.layer(1);
            x.copyToComp(parent);

            var hudCompInParent = parent.layer(1);
            hudCompInParent.name = hudCompInParent.name + "-" + parent.layers.length
            hudCompInParent.label = obj_params.labelColor;
            if (hudStartLayer !== undefined && hudEndLayer !== undefined) {
                hudCompInParent.Effects("StartPoint").property("Layer").setValue(hudStartLayer.index);
                hudCompInParent.Effects("EndPoint").property("Layer").setValue(hudEndLayer.index);
                hudCompInParent.startTime = _startTime;

                if (_endTime !== 0) {
                    hudCompInParent.outPoint = _endTime;
                }

                hudCompInParent.selected = false;

            } else {

                hudCompInParent.startTime = _startTime;

                if (_endTime !== 0) {
                    hudCompInParent.outPoint = _endTime;
                }
                hudCompInParent.selected = false;
            }

            importSizeText(textsizePath + '/textsize.aep', parent, hudStartLayer, hudEndLayer, _startTime, _endTime, obj_params.sizeText, obj_params.labelColor);
            hudFolder.remove();

            return JSON.stringify({ res: 'ok' })
        }
        catch (e) {
            var err = JSON.stringify({ err: true, msg: ' -- line : ' + e.line + ' --- err.msg : ' + e.message });
            return err;
        }
    }
}

function importSizeText(SizePath, parentComp, startPointLayer, endPointLayer, startTime, endTime, sizeText, labelColor) {
    if (everythingOk()) {
        try {
            var proj = app.project;
            var myfile = new ImportOptions();
            myfile.file = new File(SizePath);
            var sizeTextFolder = proj.importFile(myfile);

            var RootComp = undefined;
            var sizeTextFolder_numitems = sizeTextFolder.numItems

            for (var i = 1; i <= sizeTextFolder_numitems; i++) {
                if (sizeTextFolder.item(i).typeName === "Composition" && sizeTextFolder.item(i).name === "RootComp") {
                    RootComp = sizeTextFolder.item(i);
                    break;
                }
            }

            var controlItem = RootComp.layers.byName("textsize")

            controlItem.copyToComp(parentComp);
            var parentcontrolItem = parentComp.layer(1);

            parentcontrolItem.Effects("StartPoint").property("Layer").setValue(startPointLayer.index);
            parentcontrolItem.Effects("EndPoint").property("Layer").setValue(endPointLayer.index);
            parentcontrolItem.startTime = startTime;


            if (parentcontrolItem.text.sourceText.canSetExpression) {
                parentcontrolItem.text.sourceText.expression = 'tL = linear(effect("Time")("Slider"),0,200,0,20);' +
                    'fNu = effect("First-Number")("Slider");' +
                    'eNu = effect("End-Number")("Slider");' +
                    't = linear(time ,inPoint,inPoint+tL,fNu,eNu);' +
                    'deNu = clamp(effect("Decimal")("Slider"),0,8);' +
                    't.toFixed(deNu) + "  ' + sizeText + '" ;';
            }


            if (endTime !== 0) {
                parentcontrolItem.outPoint = endTime;
            }
            parentcontrolItem.name = "textsize-" + parentComp.layers.length + "-" + i
            parentcontrolItem.label = labelColor;
            sizeTextFolder.remove();

        }
        catch (e) {
            var err = { err: true, msg: ' -- line : ' + e.line + ' --- err.msg : ' + e.message };
            return err;
        }
    }
}

function importLine(linePath, nodeLayers, parentComp, endPointLayer, startTime, endTime, labelColor) {
    if (everythingOk()) {
        try {
            var proj = app.project;
            var myfile = new ImportOptions();
            myfile.file = new File(linePath);
            var lineFolder = proj.importFile(myfile);


            if (lineFolder.name != "line.aep") {
                for (var i = 1; i <= proj.rootFolder.numItems; i++) {
                    if (proj.rootFolder.item(i).typeName === "Folder" && proj.rootFolder.item(i).name === "line.aep") {
                        lineFolder = proj.rootFolder.item(i);
                        break;
                    }
                }
            }

            var RootComp = undefined;
            var lineFolder_numitems = lineFolder.numItems

            for (var i = 1; i <= lineFolder_numitems; i++) {
                if (lineFolder.item(i).typeName === "Composition" && lineFolder.item(i).name === "RootComp") {
                    RootComp = lineFolder.item(i);
                    break;
                }
            }

            var controlItem = RootComp.layers.byName("line-control")
            var solids = [];

            var y = nodeLayers.length;
            for (var i = 0; i < y; i++) {
                controlItem.copyToComp(parentComp);

                solids.push(parentComp.layer(1));
                var parentcontrolItem = parentComp.layer(1);

                parentcontrolItem.Effects("StartPoint").property("Layer").setValue(nodeLayers[i].start.index);
                parentcontrolItem.Effects("EndPoint").property("Layer").setValue(endPointLayer.index);
                parentcontrolItem.startTime = startTime;
                if (endTime !== 0) {
                    parentcontrolItem.outPoint = endTime;
                }
                parentcontrolItem.label = labelColor;
                parentcontrolItem.name = "line-control-" + parentComp.layers.length + "-" + i
                if (endPointLayer.threeDLayer == true) {
                    parentcontrolItem.threeDLayer = true;
                }
            }

            lineFolder.remove();

        }
        catch (e) {
            var err = { err: true, msg: ' -- line : ' + e.line + ' --- err.msg : ' + e.message };
            return err;
        }
    }
}

function checkIfBeamExist() {
    try {
        var wonderfolder = getWonderFolder();
        var beamFolder = null;
        var _numitems = wonderfolder.numItems
        for (var i = 1; i <= _numitems; i++) {
            if (wonderfolder.item(i) instanceof FolderItem && wonderfolder.item(i).name === "line-Beam.aep") {
                beamFolder = wonderfolder.item(i);
                break;
            }
        }
        return beamFolder
    }
    catch (e) {
        var err = { err: true, msg: ' -- line : ' + e.line + ' --- err.msg : ' + e.message };
        return err;
    }
}

function importBeamLine(linePath, nodeLayers, parentComp, endPointLayer, startTime, endTime, labelColor) {
    if (everythingOk()) {
        try {

            var proj = app.project;
            var myfile = new ImportOptions();
            myfile.file = new File(linePath);
            var lineFolder = proj.importFile(myfile);

            if (lineFolder.name != "line-Beam.aep") {
                for (var i = 1; i <= proj.rootFolder.numItems; i++) {
                    if (proj.rootFolder.item(i).typeName === "Folder" && proj.rootFolder.item(i).name === "line-Beam.aep") {
                        lineFolder = proj.rootFolder.item(i);
                        break;
                    }
                }
            }

            var RootComp = undefined;
            var lineFolder_numitems = lineFolder.numItems

            for (var i = 1; i <= lineFolder_numitems; i++) {
                if (lineFolder.item(i).typeName === "Composition" && lineFolder.item(i).name === "RootComp") {
                    RootComp = lineFolder.item(i);
                    break;
                }
            }

            var controlItem = RootComp.layers.byName("line-beam")

            var y = nodeLayers.length;
            for (var i = 0; i < y; i++) {
                controlItem.copyToComp(parentComp);
                var parentcontrolItem = parentComp.layer(1);
                parentcontrolItem.name = "line-control-" + (i + 1) + '-' + endPointLayer.name;
                parentcontrolItem.Effects("StartPoint").property("Layer").setValue(nodeLayers[i].start.index);
                parentcontrolItem.Effects("EndPoint").property("Layer").setValue(endPointLayer.index);
                parentcontrolItem.startTime = startTime;
                if (endTime !== 0) {
                    parentcontrolItem.outPoint = endTime;
                }
                parentcontrolItem.label = labelColor;
                parentcontrolItem.name = "line-control-" + (i + 1) + '-' + endPointLayer.name;
                parentcontrolItem.moveToEnd();
            }

            lineFolder.parentFolder = getWonderFolder();

        }
        catch (e) {
            var err = { err: true, msg: ' -- line : ' + e.line + ' --- err.msg : ' + e.message };
            return err;
        }
    }
}

function getWonderFolder() {
    try {
        var proj = app.project;
        var _numitems = proj.numItems
        var wonderToolsFolder = null;

        for (var i = 1; i <= _numitems; i++) {
            if (proj.item(i) instanceof FolderItem && proj.item(i).name === "WonderTools") {
                wonderToolsFolder = proj.item(i);
                break;
            }
        }

        if (wonderToolsFolder === null) {
            wonderToolsFolder = proj.items.addFolder("WonderTools");
        }

        return wonderToolsFolder;
    }
    catch (e) {
        var err = { err: true, msg: ' -- line : ' + e.line + ' --- err.msg : ' + e.message };
        return err;
    }
}
function importCallOut(projPath, linePath, params, projectName) {
    if (everythingOk()) {
        try {
            var obj_params = JSON.parse(params);
            var comps = [];
            var _startTime = 0;
            var _endTime = 0;
            obj_params.labelColor = Math.floor((Math.random() * 17));
            var proj = app.project;
            var parent = undefined;

            if (parseInt(obj_params.comp) === 0) {
                if (proj.activeItem.typeName === "Composition") {
                    parent = proj.activeItem;
                } else {
                    var err = JSON.stringify({ err: true, msg: 'no active comp found. please select a comp and click refresh button!' });
                    return err;
                }
            } else {
                if (proj.item(parseInt(obj_params.comp)).typeName === "Composition") {
                    parent = proj.item(parseInt(obj_params.comp));
                } else {
                    var err = JSON.stringify({ err: true, msg: 'no Comp found found. please select a comp and click refresh button!' });
                    return err;
                }
                if (parent === undefined || parent === null) {
                    var err = JSON.stringify({ err: true, msg: 'no Comp found, please select composition again!' });
                    return err;
                }

            }

            if (parent === undefined || parent === null) {
                var err = JSON.stringify({ err: true, msg: 'no active comp found. please select a comp and click refresh button!' });
                return err;
            }

            if (obj_params.cti.fromCti) {
                _startTime = parent.time;
                _endTime = parent.duration
            } else {
                _startTime = parseFloat(obj_params.cti.startTime);
                _endTime = parseFloat(obj_params.cti.endTime);
            }

            if (_endTime === 0) {
                _endTime = parent.duration;
            }


            if (_endTime !== 0) {
                if (_startTime >= _endTime) {
                    return "{'error' :'end time is not correct!'}"
                }

                if (_endTime > parent.workAreaDuration) {
                    _endTime = parent.duration;
                }
            }

            var callOutStickerLayer = parent.layer(parseInt(obj_params.sticker));

            var item = new ImportOptions();
            item.file = new File(projPath);
            var TextIFolder = app.project.importFile(item);
            var folderItems = [];
            if (TextIFolder.name != projectName + ".aep") {
                for (var i = 1; i <= proj.rootFolder.numItems; i++) {
                    if (proj.rootFolder.item(i).typeName === "Folder" && proj.rootFolder.item(i).name === projectName + ".aep") {
                        TextIFolder = proj.rootFolder.item(i);
                        break;
                    }
                }
            }
            var RootComp = undefined;
            var TextComp = undefined;

            var TextIFolder_numitems = TextIFolder.numItems
            for (var i = 1; i <= TextIFolder_numitems; i++) {
                if (TextIFolder.item(i).typeName === "Composition" && TextIFolder.item(i).name === "RootComp") {
                    RootComp = TextIFolder.item(i);
                    continue;
                }
                if (TextIFolder.item(i).typeName === "Composition" && TextIFolder.item(i).name === projectName) {
                    TextComp = TextIFolder.item(i);
                    continue;
                }
            }
            if (!TextComp) {
                var err = JSON.stringify({ err: true, msg: 'something went wrong code : 1122 \n email the code and project name to us for fix ! \n Thank You' });
                return err;
            }
            if (obj_params.mainText && obj_params.mainText.length > 0) {
                TextComp.layers.byName("main-text").property("Source Text").setValue(obj_params.mainText);
            }
            if (obj_params.subText && obj_params.subText.length > 0) {
                TextComp.layers.byName("sub-text").property("Source Text").setValue(obj_params.subText);
            }
            if (obj_params.descText && obj_params.descText.length > 0) {
                TextComp.layers.byName("desc-text").property("Source Text").setValue(obj_params.descText);
            }

            var nodeLayers = [];

            try {
                for (var i = 0; i < obj_params.layers.length; i++) {
                    nodeLayers.push({
                        start: parent.layer(parseInt(obj_params.layers[i].start)),
                        end: parent.layer(parseInt(obj_params.layers[i].end))
                    });
                }
            }
            catch (e) {
                TextIFolder.remove();
                var err = JSON.stringify({ err: true, msg: 'wrong start-point line selected!'});
                return err;
            }
            var textCompInParent = parent.layers.add(TextComp);

            var y = RootComp.layers.byName(projectName).transform.anchorPoint;

            textCompInParent.transform.anchorPoint.setValue(y.value);


            textCompInParent.Effects.addProperty("Slider Control").property("Slider").setValue(70);
            textCompInParent.effect("Slider Control").name = "Text-Size"


            textCompInParent.Effects.addProperty("Layer Control").property("Layer").setValue(callOutStickerLayer.index);

            if (callOutStickerLayer.threeDLayer == true) {
                textCompInParent.threeDLayer = true;
            } else {
                textCompInParent.threeDLayer = false;
            }

            if (obj_params.link) {

                if (obj_params.position) {
                    if (textCompInParent.transform.position.canSetExpression) {
                        textCompInParent.transform.position.expression = 'effect("Layer Control")("Layer").position;'
                    }
                }

                if (obj_params.rotation) {

                    if (textCompInParent.threeDLayer == false) {
                        if (textCompInParent.transform.rotation.canSetExpression) {
                            textCompInParent.transform.rotation.expression = 'effect("Layer Control")("Layer").transform.rotation;'
                        }
                    } else {
                        textCompInParent.transform.orientation.expression = 'effect("Layer Control")("Layer").transform.orientation;'
                    }
                }
            } else {
                if (obj_params.position) {

                    textCompInParent.transform.position.setValue(callOutStickerLayer.transform.position.value);
                }

                if (obj_params.rotation) {
                    if (textCompInParent.threeDLayer == false) {
                        textCompInParent.transform.rotation.setValue(callOutStickerLayer.transform.rotation.value);
                    } else {
                        textCompInParent.transform.orientation.setValue(callOutStickerLayer.transform.orientation.value);
                    }


                }
            }

            var base_Duration = TextComp.duration;
            var new_duration = _endTime - _startTime;
            textCompInParent.stretch = (new_duration * 100) / base_Duration;

            textCompInParent.startTime = _startTime;
            if (_endTime !== 0) {
                textCompInParent.outPoint = _endTime;
            }

            TextComp.name = textCompInParent.name + "-" + parent.layers.length
            textCompInParent.name = TextComp.name;

            app.beginUndoGroup("Time Remap Layer");
            textCompInParent.timeRemapEnabled = true;
            if (textCompInParent.timeRemap.canSetExpression) {
                var out_time = _endTime - ((_endTime - _startTime) / 3);
                var inMarker = new MarkerValue("in");

                textCompInParent.marker.setValueAtTime(_startTime, inMarker);
                var outMarker = new MarkerValue("out");
                textCompInParent.marker.setValueAtTime(out_time, outMarker);
                textCompInParent.timeRemap.expression = 'src = comp("' + textCompInParent.name + '").layer("MarkerWt");' +
                    'n = 0;' +
                    'if (marker.numKeys > 0) {' +
                    '    n = marker.nearestKey(time).index;' +
                    '    if (marker.key(n).time > time) {' +
                    '        n--;' +
                    '    }' +
                    '}' +
                    'if (n == 0) {' +
                    '    0' +
                    '} else {' +
                    '    m = marker.key(n);' +
                    '    myComment = m.comment;' +
                    '    t = time - m.time;' +
                    '    try {' +
                    '        mark = src.marker.key(myComment);' +
                    '        if (src.marker.numKeys > mark.index) {' +
                    '            tMax = src.marker.key(mark.index + 1).time - mark.time;' +
                    '        } else {' +
                    '            tMax = src.outPoint - mark.time;' +
                    '        }' +
                    '        t = Math.min(t, tMax);' +
                    '        mark.time + t;' +
                    '    }catch (err) {' +
                    '        0' +
                    '    }' +
                    '}';

            }
            app.endUndoGroup();

            if (textCompInParent.transform.position.canSetExpression) {

                textCompInParent.transform.scale.expression = 'temp=effect("Text-Size")("Slider");[temp, temp]';
            }

            var selectedLayers = parent.selectedLayers;
            for (var i = 0; i < selectedLayers.length; i++) {
                selectedLayers[i].selected = false;
            }

            var lineResult = '';
            if (nodeLayers.length > 0) {
                if (getversion() >= 15) {
                    lineResult = importLine(linePath + '/line.aep', nodeLayers, parent, textCompInParent, _startTime, _endTime, obj_params.labelColor);
                }
                else {
                    lineResult = importBeamLine(linePath + '/line-Beam.aep', nodeLayers, parent, textCompInParent, _startTime, _endTime, obj_params.labelColor);
                }
                if (lineResult && lineResult.err) { return JSON.stringify(lineResult); }
            }

            textCompInParent.label = obj_params.labelColor;

            TextIFolder.name = textCompInParent.name;
            TextIFolder.parentFolder = getWonderFolder();
            parent.selected = true;
            return JSON.stringify({ res: 'ok' })
        }
        catch (e) {
            TextIFolder.remove();
            var z = e.message.replace('“', '"').replace('”', '"');
            var err = JSON.stringify({ err: true, msg: ' -- line : ' + e.line + ' --- err.msg : ' + e.message.replace('“', '"').replace('”', '"') });
            return err;
        }
    }
}

function getmarkers(comp) {
    var p = thisComp.marker;
    var M = p.numKeys;
    var a = [];

    for (m = 1; m <= M; m++) a.push(p.key(m).time);

    var x = (M === 0 ? "NO_KEYS" : a);
}


function importSamples(projPath) {

    try {
        var proj = app.project;
        var item = new ImportOptions();
        item.file = new File(projPath);
        proj.importFile(item);

        return JSON.stringify({ res: 'ok' })
    }
    catch (e) {
        var err = JSON.stringify({ err: true, msg: ' -- line : ' + e.line + ' --- err.msg : ' + e.message });
        return err;
    }
}

function importNewPackage(appPackagePath) {
    try {
        var locFolder = new Folder();
        var newPkgFolder = locFolder.selectDlg("Folder");
        var error = "";
        if (newPkgFolder != null) {

            var newPkgFolder_files = newPkgFolder.getFiles();

            if (newPkgFolder_files.length > 1) {
                return { error: "you need to import each package seperatly!!" }
            }

            var pkg_NewFolder = new Folder(appPackagePath + "/" + newPkgFolder_files[0].name.replace(/%20/, " "));
            if (pkg_NewFolder.exists) {
                error = removePackage(pkg_NewFolder);

            }

            error = copyNewPackage(newPkgFolder_files[0], appPackagePath)
        }
        return { error: error }
    }
    catch (e) {
        var err = JSON.stringify({ err: true, msg: ' -- line : ' + e.line + ' --- err.msg : ' + e.message });
        return err;
    }
}

function copyNewPackage(new_pkg_folder, pathToCopy) {
    var files = new_pkg_folder.getFiles();
    var newFolder = null;

    try {
        newFolder = new Folder(pathToCopy + "/" + new_pkg_folder.name);
        newFolder.create();

        if (newFolder.error != "") {
            return newFolder.error;
        }
    }
    catch (e) {
        var err = { err: true, msg: ' -- line : ' + e.line + ' --- err.msg : ' + e.message };
        return err;
    }

    for (var i = 0; i < files.length; i++) {

        if (files[i] instanceof Folder) {
            var error = copyNewPackage(files[i], newFolder.fullName)
            if (error != "") {
                return error;
            }
        } else {
            try {
                var x = files[i].name;
                files[i].copy(newFolder.absoluteURI + '/' + files[i].name);

                if (files[i].error != "") {
                    return files[i].error;
                }
            } catch (e) {
                var err = e;
            }
        }
    }
}

function removePackage(pkg_folder) {

    var files = pkg_folder.getFiles();

    for (var i = 0; i < files.length; i++) {

        if (files[i] instanceof Folder) {
            var error = removePackage(files[i]);

            if (error != "") {
                return error;
            }
        } else {
            try {
                files[i].remove();

                if (files[i].error != "") {
                    return files[i].error;
                }
            } catch (e) {
                var err = e;
            }
        }
    }
    pkg_folder.remove();

    if (pkg_folder.error != "") {
        return pkg_folder.error;
    }

    return "";
}

function openURL(url) {
    try {
        var os = system.osName;
        if (!os.length) {
            os = $.os;
        }
        var app_os = (os.indexOf("Win") != -1) ? system.callSystem('explorer ' + url) : system.callSystem('open ' + url);
    }
    catch (e) {
        var err = { err: true, msg: ' -- line : ' + e.line + ' --- err.msg : ' + e.message };
        return err;
    }
}

function getversion() {
    try {
        return app.version.split('.')[0];
    }
    catch (e) {
        var err = { err: true, msg: ' -- line : ' + e.line + ' --- err.msg : ' + e.message };
        return err;
    }
}

function canWriteFiles() {

    var appVersion, commandID, scriptName, tabName;

    appVersion = parseFloat(app.version);

    commandID = 2359;
    tabName = 'General';
    if (appVersion >= 16.1) {
        commandID = 3131;
        tabName = 'Scripting & Expressions';
    }

    if (isSecurityPrefSet()) return true;


    alert(message = 'Wonder-callouts requires access to write files.\n' +
        'Go to the "' + tabName + '" panel of the application preferences and make sure ' +
        '"Allow Scripts to Write Files and Access Network" is checked.');

    app.executeCommand(commandID);

    return isSecurityPrefSet();

    function isSecurityPrefSet() {
        return app.preferences.getPrefAsLong(
            'Main Pref Section',
            'Pref_SCRIPTING_FILE_NETWORK_SECURITY'
        ) === 1;
    }
}

function getUserName() {
    return $.getenv('USERNAME');
}

function getmac() {
    if (canWriteFiles()) {
        var name;
        if ($.os.indexOf('Macintosh') !== -1) {
            try {
                name = system.callSystem("ifconfig en1 | awk '/ether/{print $2}'");
                name = name.replace(/[:]/g, "");
            } catch (err) {
                name = "1111111111";
            }
        } else {
            var name = (system.callSystem("getmac"))
            name = name.replace("\n", '')
            var patt = /[0-9A-Z]-[0-9A-Z]{2}-[0-9A-Z]{2}-[0-9A-Z]{2}-[0-9A-Z]{2}-[0-9A-Z]{2}/ig;
            name = patt.exec(name);
            name = name[0]
            name = name.replace(/[-]/g, "");
        }
    }
    return name;
}

function getMachinId(path) {
    return getUserName() + "|" + getAppNameFromSetting() + "|" + app.version + "|" + getExtensionName(path) + "|" + getExtensionVersion(path);
}

function getExtensionVersion(path) {
    var helpFile = new File(path + "/CSXS/manifest.xml");
    helpFile.open('r');
    var content = helpFile.read();
    helpFile.close();
    var xmlDoc = new XML(content);
    var ver = xmlDoc.@ExtensionBundleVersion.toString();
    return ver;
}

function getExtensionName(path) {
    var helpFile = new File(path + "/CSXS/manifest.xml");
    helpFile.open('r');
    var content = helpFile.read();
    helpFile.close();
    var xmlDoc = new XML(content);
    var name = xmlDoc.@ExtensionBundleId.toString();
    return name;
}
function mactichekti(myPath) {
    var __a = "!";
    if (app.settings.haveSetting("_wt", "a__" + app.version)) {
        __a = app.settings.getSetting("_wt", "a__" + app.version);
        if (!__a || __a == null || __a == undefined || __a == "") {
            app.settings.saveSetting("_wt", "a__" + app.version, "!");
            __a = "!";
        }
    }
    else {
        app.settings.saveSetting("_wt", "a__" + app.version, "!");
    }

    var res;
    if (__a === "!") {
        res = { err: true, msg: '!' };
        app.settings.saveSetting("_wt", "internet__" + app.version, "0");
        return res;
    }
    else {
        try {
            var machiatochi = getMachinId(myPath);
            var homeStr = backtohome(__a + '|' + machiatochi);
            var data = $http({
                method: 'GET',
                url: 'http://wondertools-official.com/api/lic/check/' + homeStr
            });
            var data_json = data.payload;

            if (data.statusMessage != 'OK') {
                var atts = getConnectionFromSetting();
                atts = parseInt(atts) + 1;
                app.settings.saveSetting("_wt", "internet__" + app.version, atts.toString());
                alert('Please check the Internet connection, something went wrong');
                return { err: true, msg: 'connectionerror' };
            }

            if (data_json.boolResult == true) {
                app.settings.saveSetting("_wt", "internet__" + app.version, "0");
                return { err: false, msg: data_json.description };
            }
            else {
                app.settings.saveSetting("_wt", "a__" + app.version, "!");
                app.settings.saveSetting("_wt", "internet__" + app.version, "0");
                return { err: true, msg: data_json.description };
            }
        } catch (e) {
            var atts = getConnectionFromSetting();
            atts = parseInt(atts) + 1;
            app.settings.saveSetting("_wt", "internet__" + app.version, atts.toString());
            res = { err: true, msg: 'connectionerror' };
            return res;
        }
    }
}
function registerRequest(activationCode) {
    try {
        if (canWriteFiles()) {

            var settingPath = getpathFromSetting();

            var machiatochi = getMachinId(settingPath);

            var homeStr = backtohome(activationCode + '|' + machiatochi);
            try {
                var data = $http({
                    method: 'GET',
                    url: 'http://wondertools-official.com/api/lic/activate/' + homeStr
                });
            }
            catch (e) {
                var er = JSON.stringify({ err: true, msg: 'connection error' });
                return er;
            }
            var data_json = data.payload;

            if (data_json.boolResult === false) {
                var err = JSON.stringify({ err: true, msg: data_json.description });
                return err;
            }
            if (data_json.boolResult === true && data_json.description.length > 0) {

                app.settings.saveSetting("_wt", "a__" + app.version, data_json.description);
                return JSON.stringify({ err: false, msg: '' });
            }
        }
    }
    catch (e) {
        var er = JSON.stringify({ err: true, msg: ' -- line : ' + e.line + ' ' + e.message });
        return er;
    }

}

function getpathFromSetting() {
    if (app.settings.haveSetting("_wt", "myPath" + app.version)) {
        return app.settings.getSetting("_wt", "myPath" + app.version);
    }
    return "";
}

function getAppNameFromSetting() {
    if (app.settings.haveSetting("_wt", "appName" + app.version)) {
        return app.settings.getSetting("_wt", "appName" + app.version);
    }
    return "";
}

function getACodeFromSetting() {
    if (app.settings.haveSetting("_wt", "a__" + app.version)) {
        return app.settings.getSetting("_wt", "a__" + app.version);
    }
    return "";
}

function everythingOk() {
    var state = getACodeFromSetting();
    if (state == "" || state == "!") {
        alert("Your Extension is not registered! reInstall and Register it here :\nwondertools-official.com/verify")
        return false;
    }
    return true;
}

function getConnectionFromSetting() {
    if (app.settings.haveSetting("_wt", "internet__" + app.version)) {
        return app.settings.getSetting("_wt", "internet__" + app.version);
    }
    return "0";
}

function logOut() {
    try {
        var aCode = backtohome(getACodeFromSetting());
        app.settings.saveSetting("_wt", "a__" + app.version, "");
        app.settings.saveSetting("_wt", "myPath" + app.version, "");
        app.settings.saveSetting("_wt", "internet__" + app.version, "");
        try {
            var data = $http({
                method: 'GET',
                url: 'http://wondertools-official.com/api/lic/deactivebc/' + aCode
            });
            return JSON.stringify({ err: false, msg: '' });
        }
        catch (e) {
            var er = JSON.stringify({ err: true, msg: 'connection error' });
            return er;
        }
    }
    catch (e) {
        var er = JSON.stringify({ err: true, msg: 'Something went worng\nClose and reOpen the extension to fix it!' });
        return er;
    }
}

function backtohome(s) {

    var ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    var n = s.length,

        a = [], z = 0, c = 0,

        b, b0, b1, b2;

    while (c < n) {

        b0 = s.charCodeAt(c++);

        b1 = s.charCodeAt(c++);

        b2 = s.charCodeAt(c++);

        var b = (b0 << 16) + ((b1 || 0) << 8) + (b2 || 0);

        a[z++] = ALPHA.charAt((b & (63 << 18)) >> 18);

        a[z++] = ALPHA.charAt((b & (63 << 12)) >> 12);

        a[z++] = ALPHA.charAt(isNaN(b1) ? 64 : ((b & (63 << 6)) >> 6));

        a[z++] = ALPHA.charAt(isNaN(b2) ? 64 : (b & 63));

    }

    s = a.join('');

    a.length = 0;

    a = null;

    return s;

};

function getLabelsFromPrefs() {
    $.appEncoding = 'CP1252';

    var sectionName = "Label Preference Color Section 5";
    var prefFile = PREFType.PREF_Type_MACHINE_INDEPENDENT;
    var keyName;
    var mypref;
    var resArray = [];

    for (var i = 1; i <= 16; i++) {
        keyName = "Label Color ID 2 # " + i.toString();
        mypref = app.preferences.getPrefAsString(sectionName, keyName, prefFile);

        var res = '';
        for (var j = 1; j < mypref.length; j++) {
            var charCode = mypref.charCodeAt(j)
            res += charCode.toString(16).toUpperCase();
        }
        resArray.push(res);
    }
    return resArray;
};