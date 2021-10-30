(function () {
    //  json2.js
    //  2017-06-12
    //  Public Domain.
    //  NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    //  USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    //  NOT CONTROL.

    //  This file creates a global JSON object containing two methods: stringify
    //  and parse. This file provides the ES5 JSON capability to ES3 systems.
    //  If a project might run on IE8 or earlier, then this file should be included.
    //  This file does nothing on ES5 systems.

    //      JSON.stringify(value, replacer, space)
    //          value       any JavaScript value, usually an object or array.
    //          replacer    an optional parameter that determines how object
    //                      values are stringified for objects. It can be a
    //                      function or an array of strings.
    //          space       an optional parameter that specifies the indentation
    //                      of nested structures. If it is omitted, the text will
    //                      be packed without extra whitespace. If it is a number,
    //                      it will specify the number of spaces to indent at each
    //                      level. If it is a string (such as "\t" or "&nbsp;"),
    //                      it contains the characters used to indent at each level.
    //          This method produces a JSON text from a JavaScript value.
    //          When an object value is found, if the object contains a toJSON
    //          method, its toJSON method will be called and the result will be
    //          stringified. A toJSON method does not serialize: it returns the
    //          value represented by the name/value pair that should be serialized,
    //          or undefined if nothing should be serialized. The toJSON method
    //          will be passed the key associated with the value, and this will be
    //          bound to the value.

    //          For example, this would serialize Dates as ISO strings.

    //              Date.prototype.toJSON = function (key) {
    //                  function f(n) {
    //                      // Format integers to have at least two digits.
    //                      return (n < 10)
    //                          ? "0" + n
    //                          : n;
    //                  }
    //                  return this.getUTCFullYear()   + "-" +
    //                       f(this.getUTCMonth() + 1) + "-" +
    //                       f(this.getUTCDate())      + "T" +
    //                       f(this.getUTCHours())     + ":" +
    //                       f(this.getUTCMinutes())   + ":" +
    //                       f(this.getUTCSeconds())   + "Z";
    //              };

    //          You can provide an optional replacer method. It will be passed the
    //          key and value of each member, with this bound to the containing
    //          object. The value that is returned from your method will be
    //          serialized. If your method returns undefined, then the member will
    //          be excluded from the serialization.

    //          If the replacer parameter is an array of strings, then it will be
    //          used to select the members to be serialized. It filters the results
    //          such that only members with keys listed in the replacer array are
    //          stringified.

    //          Values that do not have JSON representations, such as undefined or
    //          functions, will not be serialized. Such values in objects will be
    //          dropped; in arrays they will be replaced with null. You can use
    //          a replacer function to replace those with JSON values.

    //          JSON.stringify(undefined) returns undefined.

    //          The optional space parameter produces a stringification of the
    //          value that is filled with line breaks and indentation to make it
    //          easier to read.

    //          If the space parameter is a non-empty string, then that string will
    //          be used for indentation. If the space parameter is a number, then
    //          the indentation will be that many spaces.

    //          Example:

    //          text = JSON.stringify(["e", {pluribus: "unum"}]);
    //          // text is '["e",{"pluribus":"unum"}]'

    //          text = JSON.stringify(["e", {pluribus: "unum"}], null, "\t");
    //          // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

    //          text = JSON.stringify([new Date()], function (key, value) {
    //              return this[key] instanceof Date
    //                  ? "Date(" + this[key] + ")"
    //                  : value;
    //          });
    //          // text is '["Date(---current time---)"]'

    //      JSON.parse(text, reviver)
    //          This method parses a JSON text to produce an object or array.
    //          It can throw a SyntaxError exception.

    //          The optional reviver parameter is a function that can filter and
    //          transform the results. It receives each of the keys and values,
    //          and its return value is used instead of the original value.
    //          If it returns what it received, then the structure is not modified.
    //          If it returns undefined then the member is deleted.

    //          Example:

    //          // Parse the text. Values that look like ISO date strings will
    //          // be converted to Date objects.

    //          myData = JSON.parse(text, function (key, value) {
    //              var a;
    //              if (typeof value === "string") {
    //                  a =
    //   /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
    //                  if (a) {
    //                      return new Date(Date.UTC(
    //                         +a[1], +a[2] - 1, +a[3], +a[4], +a[5], +a[6]
    //                      ));
    //                  }
    //                  return value;
    //              }
    //          });

    //          myData = JSON.parse(
    //              "[\"Date(09/09/2001)\"]",
    //              function (key, value) {
    //                  var d;
    //                  if (
    //                      typeof value === "string"
    //                      && value.slice(0, 5) === "Date("
    //                      && value.slice(-1) === ")"
    //                  ) {
    //                      d = new Date(value.slice(5, -1));
    //                      if (d) {
    //                          return d;
    //                      }
    //                  }
    //                  return value;
    //              }
    //          );

    //  This is a reference implementation. You are free to copy, modify, or
    //  redistribute.

    /*jslint
        eval, for, this
    */

    /*property
        JSON, apply, call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
        getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
        lastIndex, length, parse, prototype, push, replace, slice, stringify,
        test, toJSON, toString, valueOf
    */


    // Create a JSON object only if one does not already exist. We create the
    // methods in a closure to avoid creating global variables.

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

//getMainDirectories("C:/Program%20Files%20(x86)/Common%20Files/Adobe/CEP/extensions/hafez-test/assets/packages");
function getMainDirectories(myPath) {
    try {

        var files = [];
        var textsubFolder = Folder(myPath).getFiles();
        var textPath = 'assets/packages';
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
    catch (e) {
        var err = JSON.stringify({ err: true, msg: ' -- line : ' + e.line + ' --- err.msg : ' + e.message });
        return err;
    }
}

//getAllComps();
function getAllComps() {
    try {
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
    catch (e) {
        var err = JSON.stringify({ err: true, msg: ' -- line : ' + e.line + ' --- err.msg : ' + e.message });
        return err;
    }
}

//getAllLayersInComp(0)
function getAllLayersInComp(compIndex) {
    try {
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
    catch (e) {
        var err = JSON.stringify({ err: true, msg: ' -- line : ' + e.line + ' --- err.msg : ' + e.message });
        return err;
    }
}

//importBasicHud("~/AppData/Roaming/Adobe/CEP/extensions/wonder-2018/assets/packages/H-U-D.s/basic shapes/element-01/element-01.aep",
//'{"comp":"1","sticker":"5","cti":{"fromCti":true,"startTime":"0","endTime":"0"},"thd":false}', "element-01");
function importBasicHud(projPath, params, projectName) {

    try {
        var obj_params = JSON.parse(params);
        var comps = [];
        var _startTime = 0;
        var _endTime = 0;

        var proj = app.project;
        var parent = undefined;
        if (parseInt(obj_params.comp) === 0) {
            parent = proj.activeItem;
        } else {
            parent = proj.item(parseInt(obj_params.comp));
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
            //var startLayer = []; parent.layer(firstLayerIndex);
            hudStickerLayer = parent.layer(parseInt(obj_params.sticker));
        }
    
    if(hudStickerLayer instanceof  AVLayer){
        var item = new ImportOptions();
        item.file = new File(projPath);
        var hudFolder = proj.importFile(item);
        //var textLayer = parent.layers.add(TextIFolder.item(1));
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

        if (hudStickerLayer !== undefined && hudStickerLayer ) {

            hudCompInParent.Effects.addProperty("Layer Control").property("Layer").setValue(hudStickerLayer.index);
            if (hudCompInParent.transform.position.canSetExpression) {
                hudCompInParent.transform.position.expression = 'effect("Layer Control")("Layer").position;'
            }
        
            if (obj_params.thd) {
                if (hudStickerLayer.threeDLayer.threeDLayer == false) {
                    hudStickerLayer.threeDLayer = true;
                }
                hudCompInParent.threeDLayer = true;
                hudCompInParent.transform.position.setValue(hudStickerLayer.transform.position.value);
                hudCompInParent.transform.orientation.setValue(hudStickerLayer.transform.orientation.value);
                hudCompInParent.transform.xRotation.setValue(hudStickerLayer.transform.xRotation.value);
                hudCompInParent.transform.yRotation.setValue(hudStickerLayer.transform.yRotation.value);
                if (hudStickerLayer.transform.zRotation) {
                    hudCompInParent.transform.zRotation.setValue(hudStickerLayer.transform.zRotation.value);
                }

            } else {
                hudCompInParent.threeDLayer = false;
                hudCompInParent.transform.position.setValue(hudStickerLayer.transform.position.value);

            }

            hudCompInParent.startTime = _startTime;

            if (_endTime !== 0) {
                hudCompInParent.outPoint = _endTime;
            }

            hudCompInParent.selected = false;

        } else {
            if (obj_params.thd) {
                hudCompInParent.threeDLayer = true;
            } else {
                hudCompInParent.threeDLayer = false;
            }
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

//importBasicSizeline("~/AppData/Roaming/Adobe/CEP/extensions/wonder-2018/assets/packages/H-U-D.s/Size Lines/SizeLine-01/SizeLine-01.aep",
//'{"comp":"1","start":"1","end":"2","sizeText":"mm","cti":{"fromCti":true,"startTime":"0","endTime":"0"}}','SizeLine-01',
//"file:///C:/Users/Ali-Pc2/AppData/Roaming/Adobe/CEP/extensions/wonder-2018/assets/basicRequiers/textsize");
function importBasicSizeline(projPath, params, projectName,textsizePath) {

    try {
        var obj_params = JSON.parse(params);
        var comps = [];
        var _startTime = 0;
        var _endTime = 0;

        var proj = app.project;
        var parent = undefined;
        if (parseInt(obj_params.comp) === 0) {
            parent = proj.activeItem;
        } else {
            parent = proj.item(parseInt(obj_params.comp));
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

        if (hudStartLayer !== undefined && hudEndLayer !== undefined) {
            hudCompInParent.Effects("StartPoint").property("Layer").setValue(hudStartLayer.index);
            hudCompInParent.Effects("EndPoint").property("Layer").setValue(hudEndLayer.index);
            hudCompInParent.startTime = _startTime;

            if (_endTime !== 0) {
                hudCompInParent.outPoint = _endTime;
            }

            hudCompInParent.selected = false;

        } else {
            if (obj_params.thd) {
                hudCompInParent.threeDLayer = true;
            } else {
                hudCompInParent.threeDLayer = false;
            }
            hudCompInParent.startTime = _startTime;

            if (_endTime !== 0) {
                hudCompInParent.outPoint = _endTime;
            }
            hudCompInParent.selected = false;
        }

        importSizeTest(textsizePath + '/textsize.aep',parent,hudStartLayer,hudEndLayer,_startTime,_endTime,obj_params.sizeText);
        hudFolder.remove();

        return JSON.stringify({ res: 'ok' })
    }
    catch (e) {
        var err = JSON.stringify({ err: true, msg: ' -- line : ' + e.line + ' --- err.msg : ' + e.message });
        return err;
    }
}

function importSizeTest(SizePath, parentComp, startPointLayer, endPointLayer, startTime, endTime,sizeText) {
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
       

        //var y = nodeLayers.length;
       
        controlItem.copyToComp(parentComp);
        var parentcontrolItem = parentComp.layer(1);

        parentcontrolItem.Effects("StartPoint").property("Layer").setValue(startPointLayer.index);
        parentcontrolItem.Effects("EndPoint").property("Layer").setValue(endPointLayer.index);
        parentcontrolItem.startTime = startTime;
        
         
            if (parentcontrolItem.text.sourceText.canSetExpression) {
                parentcontrolItem.text.sourceText.expression = 'tL = linear(effect("Time")("Slider"),0,200,0,20);'+
                                                                                        'fNu = effect("First-Number")("Slider");'+
                                                                                        'eNu = effect("End-Number")("Slider");'+
                                                                                        't = linear(time ,inPoint,inPoint+tL,fNu,eNu);'+
                                                                                        'deNu = clamp(effect("Decimal")("Slider"),0,8);'+
                                                                                        't.toFixed(deNu) + "  '+ sizeText +'" ;';
            }

        
        if (endTime !== 0) {
            parentcontrolItem.outPoint = endTime;
        }
        parentcontrolItem.name = "textsize-" + parentComp.layers.length + "-" + i
       
        sizeTextFolder.remove();

    }
    catch (e) {
        var err = { err: true, msg: ' -- line : ' + e.line + ' --- err.msg : ' + e.message };
        return err;
    }
}

function importLine(linePath, nodeLayers, parentComp, endPointLayer, startTime, endTime) {
    try {
        var proj = app.project;
        var myfile = new ImportOptions();
        myfile.file = new File(linePath);
        var lineFolder = proj.importFile(myfile);

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
            parentcontrolItem.name = "line-control-" + parentComp.layers.length + "-" + i
        }

        lineFolder.remove();

    }
    catch (e) {
        var err = { err: true, msg: ' -- line : ' + e.line + ' --- err.msg : ' + e.message };
        return err;
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

function importBeamLine(linePath, nodeLayers, parentComp, endPointLayer, startTime, endTime) {
    try {
        var lineFolder =checkIfBeamExist();
        if(lineFolder == null){
            var proj = app.project;
            var myfile = new ImportOptions();
            myfile.file = new File(linePath);
            lineFolder = proj.importFile(myfile);
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

//importCallOut("~/AppData/Roaming/Adobe/CEP/extensions/wonder-2018/assets/packages/Call Out/PoP Calls/OP-1-R/OP-1-R.aep",
///"C:/Users/h-ghods/AppData/Roaming/Adobe/CEP/extensions/wonder-2018/assets/basicRequiers/line",
//'{"comp":"0","sticker":"5","layers":[{"start":"7","end":"5"}],"cti":{"fromCti":true,"startTime":"0","endTime":"0"},"mainText":"یشسیشسی","subText":"سسیشیشسی"}',
//"OP-1-R")
function importCallOut(projPath, linePath, params, projectName) {
    try {
        var obj_params = JSON.parse(params);
        var comps = [];
        var _startTime = 0;
        var _endTime = 0;

        var proj = app.project;
        var parent = undefined;
        if (parseInt(obj_params.comp) === 0) {
            if (proj.activeItem.typeName === "Composition"){
                parent = proj.activeItem;
            }else{
                 var err = JSON.stringify({ err: true, msg: 'no active comp found. please select a comp and click refresh button!' });
                return err;
            }
        } else {
            parent = proj.item(parseInt(obj_params.comp));
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
        if(TextIFolder.name != projectName+".aep"){
            for (var i = 1; i <= proj.rootFolder.numItems; i++) {
                if (proj.rootFolder.item(i).typeName === "Folder" && proj.rootFolder.item(i).name === projectName+".aep") {
                    TextIFolder = proj.rootFolder.item(i);
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
        if(!TextComp){
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

        for (var i = 0; i < obj_params.layers.length; i++) {
            nodeLayers.push({
                start: parent.layer(parseInt(obj_params.layers[i].start)),
                end: parent.layer(parseInt(obj_params.layers[i].end))
            });
        }

        var textCompInParent = parent.layers.add(TextComp);

        var y = RootComp.layers.byName(projectName).transform.anchorPoint;

        textCompInParent.transform.anchorPoint.setValue(y.value);
        textCompInParent.transform.position.setValue(callOutStickerLayer.transform.position.value);

        textCompInParent.Effects.addProperty("Slider Control").property("Slider").setValue(70);
        textCompInParent.effect("Slider Control").name = "Text-Size"
        
          textCompInParent.Effects.addProperty("Layer Control").property("Layer").setValue(callOutStickerLayer.index);
            if (textCompInParent.transform.position.canSetExpression) {
                textCompInParent.transform.position.expression = 'effect("Layer Control")("Layer").position;'
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
                lineResult = importLine(linePath + '/line.aep', nodeLayers, parent, textCompInParent, _startTime, _endTime);
            }
            else {//beam
                lineResult = importBeamLine(linePath + '/line-Beam.aep', nodeLayers, parent, textCompInParent, _startTime, _endTime);
            }
            if (lineResult && lineResult.err) { return JSON.stringify(lineResult); }
        }
        
        TextIFolder.name = textCompInParent.name;
        TextIFolder.parentFolder = getWonderFolder();
        parent.selected = true;
        return JSON.stringify({ res: 'ok' })
    }
    catch (e) {
        var err = JSON.stringify({ err: true, msg: ' -- line : ' + e.line + ' --- err.msg : ' + e.message });
        return err;
    }
}

function getmarkers(comp) {
    var p = thisComp.marker;
    var M = p.numKeys;
    var a = [];

    for (m = 1; m <= M; m++) a.push(p.key(m).time);

    var x = (M === 0 ? "NO_KEYS" : a);
}

function importWithEffect(projPath, params, projectName) {

    try {
        var obj_params = JSON.parse(params);
        var comps = [];
        var _startTime = 0;
        var _endTime = 0;

        var proj = app.project;
        var parent = undefined;
        if (parseInt(obj_params.comp) === 0) {
            parent = proj.activeItem;
        } else {
            parent = proj.item(parseInt(obj_params.comp));
        }

        if (obj_params.cti.fromCti) {
            _startTime = parent.time;
        } else {
            if (parseFloat(obj_params.cti.startTime) !== 0) {
                _startTime = parseFloat(obj_params.cti.startTime);
            } else {
                _startTime = parent.time;
            }
        }
        if (parseFloat(obj_params.cti.endTime) !== 0) {
            _endTime = parseFloat(obj_params.cti.endTime);
        }

        if (_endTime !== 0) {
            if (_startTime >= _endTime) {
                return "{'error' :'end time is not correct!'}"
            }

            if (_endTime > parent.workAreaDuration) {
                return "{'error' :'wrong time range!'}"
            }
        }

        var item = new ImportOptions();
        item.file = new File(projPath);
        var witchEffect_Folder = proj.importFile(item);
        var RootComp = undefined;

        var witchEffect_Folder_numitems = witchEffect_Folder.numItems
        for (var i = 1; i <= witchEffect_Folder_numitems; i++) {
            if (witchEffect_Folder.item(i).typeName === "Composition" && witchEffect_Folder.item(i).name === projectName) {
                RootComp = witchEffect_Folder.item(i);
                continue;
            }
        }

        var selectedLayers = parent.selectedLayers;
        for (var i = 0; i < selectedLayers.length; i++) {
            selectedLayers[i].selected = false;
        }

        var x = RootComp.layer(1);
        x.copyToComp(parent);

        var witchEffect_CompInParent = parent.layer(1);
        witchEffect_CompInParent.name = witchEffect_CompInParent.name + "-" + parent.layers.length
        witchEffect_CompInParent.startTime = _startTime;

        witchEffect_CompInParent.startTime = _startTime;

        if (_endTime !== 0) {
            witchEffect_CompInParent.outPoint = _endTime;
        }
        witchEffect_CompInParent.selected = false;
        witchEffect_Folder.remove();
        //proj.autoFixExpressions("fixme",RootComp.name);
        return JSON.stringify({ res: 'ok' })
    }
    catch (e) {
        var err = JSON.stringify({ err: true, msg: ' -- line : ' + e.line + ' --- err.msg : ' + e.message });
        return err;
    }
}

//importSamples("/c/Program Files (x86)/Common Files/Adobe/CEP/extensions/hafez-test/assets/packages/Call Out/samples/sample-callout/sample-callout.aep");
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

//importNewPackage("C:/Program%20Files%20(x86)/Common%20Files/Adobe/CEP/extensions/hafez-test/assets/packages");
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

            /// check if pkg exists remove!!!
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

//openURL("https://www.google.com")
function openURL(url) {
    try {
        var os = system.osName;
        if (!os.length) {
            // I never remember which one is available, but I think $.os always is, you'll have to check
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
