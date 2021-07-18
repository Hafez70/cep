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

                return str("", {"": value});
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
                        ? walk({"": j}, "")
                        : j;
                }

// If the text is not JSON parseable, then a SyntaxError is thrown.

                throw new SyntaxError("JSON.parse");
            };
        }
    }());
})();


function getSubFileItems(subFilePath, sourcPath) {
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

function getSubMenuItems(subMenuPath, sourcPath) {
    var sunbMenu = [];
    var textsubFolder = Folder(subMenuPath).getFiles();

    for (var i = 0; i < textsubFolder.length; i++) {
        if (textsubFolder[i] instanceof Folder) {

            // var logoImage = containerPanel.add("image", undefined, textsubFolder[i].fullName + '/demo.gif',{path : textsubFolder[i].fullName + '/' + textsubFolder[i].name + '.aep'});
            // logoImage.text = textsubFolder[i].name;
            // logoImage.onClick= function() {
            //     var item = new ImportOptions();
            //     item.file = new File(this.properties.path);
            //     var Item = app.project.importFile(item);
            // };

            var subfiles = getSubFileItems(textsubFolder[i].fullName, sourcPath + '/' + textsubFolder[i].name);
            sunbMenu.push({
                subMenuName: textsubFolder[i].name.replace(/%20/g, " "),
                subFiles: subfiles,
                demo: './' + sourcPath + '/' + textsubFolder[i].name + '/demo.gif'
            });
        }
    }
    return sunbMenu;
}

//getMainDirectories("C:/Program%20Files%20(x86)/Common%20Files/Adobe/CEP/extensions/hafez-test/assets/files/Texts",1);
function getMainDirectories(myPath,catIndex) {
    try {

        var files = [];
        var textsubFolder = Folder(myPath).getFiles();
        var textPath = 'assets/files/Texts';
        for (var i = 0; i < textsubFolder.length; i++) {
            if (textsubFolder[i] instanceof Folder && i === catIndex) {
                var subMenus = getSubMenuItems(textsubFolder[i].fullName, textPath + '/' + textsubFolder[i].name);
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
    } catch (e) {
        alert(e);
    }
}

//getCategiries("C:/Program%20Files%20(x86)/Common%20Files/Adobe/CEP/extensions/hafez-test/assets/files/Texts");
function getCategiries(myPath) {
    try {
        var files = [];
        var textsubFolder = Folder(myPath).getFiles();
        var textPath = 'assets/files/texts';
        for (var i = 0; i < textsubFolder.length; i++) {
            if (textsubFolder[i] instanceof Folder) {
                files.push({
                    CatName: textsubFolder[i].name.replace(/%20/, " "),
                    CatPath: textsubFolder[i].fullName,
                    CatIndex: i,
                    //subMenuNames: subMenus,
                    demo: './' + textPath + '/' + textsubFolder[i].name + '/demo.gif',
                });
            }
        }
        var x = JSON.stringify(files);
        return x;
    } catch (e) {
        alert(e);
    }
}

//ImportFile("~/AppData/Roaming/Adobe/CEP/extensions/hafez-test/assets/files/texts/simple-text-lists/moving/slide-down-to-up/slide-down-to-up.aep");
function ImportFile(filePath) {
    try {
        var item = new ImportOptions();
        item.file = new File(filePath);
        var Item = app.project.importFile(item);
        return JSON.stringify({result: true});
    } catch (e) {
        return JSON.stringify({result: false});
    }
}

//getAllComps();
function getAllComps() {

    var comps = [];
    var proj = app.project;

    var numitems = proj.numItems
    for (var i = 1; i < numitems; i++) {
        if (proj.item(i).typeName === "Composition") {
            comps.push({compName: proj.item(i).parentFolder.name + ' > ' + proj.item(i).name, compItemIndex: i});
        }
    }
    var js = JSON.stringify(comps);
    return js;

}

//getAllNullPointsInComp(1)
function getAllNullPointsInComp(compIndex) {

    var nullLayers = [];
    var proj = app.project;
    var curentComp = undefined;
    if (compIndex === 0) {
        curentComp = proj.activeItem;
    } else {
        curentComp = proj.item(compIndex);
    }
    var numLayers = curentComp.numLayers;
    for (var i = 1; i <= numLayers; i++) {
        var layer = curentComp.layer(i);
        if (curentComp.layer(i).nullLayer)
            nullLayers.push({layerName: curentComp.layer(i).name.replace('<', ' ').replace('>', ' '), layerIndex: i});
    }
    var js = JSON.stringify(nullLayers);
    return js;

}

//getAllLayersInComp(2)
function getAllLayersInComp(compIndex) {

    var allLayers = [];
    var proj = app.project;
    var curentComp = undefined;
    if (compIndex === 0) {
        curentComp = proj.activeItem;
    } else {
        curentComp = proj.item(compIndex);
    }
    var numLayers = curentComp.numLayers;
    for (var i = 1; i <= numLayers; i++) {
        allLayers.push({layerName: curentComp.layer(i).name.replace('<', ' ').replace('>', ' '), layerIndex: i});
    }
    var js = JSON.stringify(allLayers);
    return js;

}

//importStickyTextWithBeamEffect("/c/Program Files (x86)/Common Files/Adobe/CEP/extensions/hafez-test/assets/files/texts/simple-text-lists/tooltip/tooltip-with-beam/tooltip-with-beam.aep",2,2,3,"",false,1);

function importStickyTextWithBeamEffect(projPath, parentCompIndex, firstLayerIndex, secondLayerIndex, myText, fromCti, specificTime , endTime) {

    var comps = [];
    var _startTime = 0;
    var _endTime = 0;

    var proj = app.project;
    var parent = undefined;
    if (parentCompIndex === 0) {
        parent = proj.activeItem;
    } else {
        parent = proj.item(parentCompIndex);
    }

    if (fromCti) {
        _startTime = parent.time;
    } else if (specificTime !== 0) {
        _startTime = specificTime;
    }

    if(_startTime >= endTime)
    {
        return "{'error' :'end time is not correct!'}"
    }

    if((_startTime + endTime) >  parent.workAreaDuration)
    {
        return "{'error' :'wrong time range!'}"
    }

    var startLayer = parent.layer(firstLayerIndex);
    var endLayer = parent.layer(secondLayerIndex);

    var item = new ImportOptions();
    item.file = new File(projPath);
    var TextIFolder = proj.importFile(item);
    //var textLayer = parent.layers.add(TextIFolder.item(1));
    var RootComp = undefined;
    var TextComp = undefined;
    var solidsFolder = undefined;

    var TextIFolder_numitems = TextIFolder.numItems
    for (var i = 1; i <= TextIFolder_numitems; i++) {
        if (TextIFolder.item(i).typeName === "Composition" && TextIFolder.item(i).name === "RootComp") {
            RootComp = TextIFolder.item(i);
            continue;
        }
        if (TextIFolder.item(i).typeName === "Composition" && TextIFolder.item(i).name === "MyTextComp") {
            TextComp = TextIFolder.item(i);
            continue;
        }
    }

    if (myText.length > 0) {
        TextComp.layers.byName("Sample Text").property("Source Text").setValue(myText);
    }
    var solidItem = RootComp.layers.byName("MyBeam")

    var textCompInParent = parent.layers.add(TextComp);
    textCompInParent.moveToEnd();
    textCompInParent.transform.anchorPoint.setValue([110.5, 192.5]);
    textCompInParent.transform.position.setValue(endLayer.transform.position.value);
    textCompInParent.Effects.addProperty("Layer Control").property("Layer").setValue(endLayer.index);
    textCompInParent.startTime = _startTime;
    textCompInParent.selected = false;

    if (textCompInParent.transform.position.canSetExpression) {
        textCompInParent.transform.position.expression = 'effect("Layer Control")("Layer").toComp([0,0,0])';
    }

    var MyBeamCounter = 0;
    for (var i = 1; i <= parent.numLayers; i++) {
        if (String(parent.layer(i).name).indexOf('MyBeam') >= 0) {
            MyBeamCounter++;
        }
    }

    var selectedLayers = parent.selectedLayers;
    for (var i = 0; i < selectedLayers.lenght; i++) {
        selectedLayers.selected = false;
    }

    solidItem.copyToComp(parent);
    var parentSolidItem = parent.layer(1);

    if (MyBeamCounter !== 0) {
        parentSolidItem.name = "MyBeam " + String(MyBeamCounter + 1)
    } else {
        parentSolidItem.name = "MyBeam " + 1
    }

    parentSolidItem.moveToEnd();

    parentSolidItem.Effects("StartPoint").property("Layer").setValue(startLayer.index);
    parentSolidItem.Effects("EndPoint").property("Layer").setValue(endLayer.index);
    parentSolidItem.startTime = _startTime;

}

