var contentTree = {};
var importProjPath = '';
var importProjName = '';
var setingNeede = null;
var lineFullPath = '';
var sizetextFullPath = '';
var helpjsonPath = '';
var helpDirPath = '';
var packagesPath = '';
var ads = {};
var callout_linecount = 1;
var csInterface = new CSInterface();
var canWriteFiles = false;

(function () {
    'use strict';
    var extensionPath = csInterface.getSystemPath(SystemPath.EXTENSION);

    lineFullPath = extensionPath + '/assets/basicRequiers/line';
    sizetextFullPath = extensionPath + '/assets/basicRequiers/textsize';
    helpjsonPath = extensionPath + '/assets/help/help.json';
    helpDirPath = extensionPath + '/assets/help/';
    packagesPath = extensionPath + '/assets/packages';

    var jsxFile = extensionPath + '/jsx/hostjs.jsx';

    //debug
    //csInterface.evalScript("try{\n var jsxFile = new File('" + jsxFile + "');\n $.evalFile(jsxFile); \n }catch(e){alert(e.toString())}", function (params) {
    //    csInterface.evalScript("canWriteFiles();", function (params) {
    //        canWriteFiles = params;
    //    });
    //});
    //release
    csInterface.evalScript("try{\n var jsxFile = new File('" + jsxFile + "');\n $.evalFile(jsxFile); \n }catch(e){alert(e.toString())}", function (params) {
        csInterface.evalScript("canWriteFiles();", function (params) {
            canWriteFiles = params;
        });
    });
}());


///-----------------create menu part ----
function getFilesTree() {
    //csInterface.evalScript("getLabelsFromPrefs();", function (params) {
    //    var arrayColours = String.prototype.split.call(params, ',');
    //    var _colors = '';
    //    Array.prototype.map.call(arrayColours, function (val, inx) {
    //        _colors += '<div class="col-3 m-0 p-1" style="width:20px;height:20px;background-color: #' + val + ';"' +
    //            'onclick="$(\'.color-palette-toggler\').css(\'color\', \'#' + val + '\');$(\'.color-palette-toggler\').attr(\'data-color\', \'' + (inx + 1) + '\');" ></div > \n';
    //    });

    //    $('.color-palette-toggler').css('color', "#" + arrayColours[0]);
    //    $('.color-palette-toggler').attr('data-color', '1');

    //    $('.color-palette').append(_colors);
    //})


    ShowLoader();
    var info = JSON.stringify(csInterface.getHostEnvironment());
    var _script = "getMainDirectories('" + csInterface.getSystemPath(SystemPath.EXTENSION) + "','" + info + "');";
    csInterface.evalScript(_script,
        function (res) {
            var result = JSON.parse(res);
            HideLoader();
            if (result.err) {
                if (result.pc != undefined && result.pc.length > 0) {
                    openRegistrationWindow();
                    return;
                }
                else {
                    alert(result.msg);
                    return;
                }
            } else {

                $('#registerModal').fadeOut();
                contentTree = result;
                if (contentTree.length > 0) {
                    generateSideBar();
                }
            }
        });
}

function generateSideBar() {
    $('#sidebarMenu').empty();
    Array.prototype.map.call(contentTree, function (val, indx) {
        var child_li = '';
        Array.prototype.map.call(val.subMenuNames, function (ch_val, ch_indx) {
            child_li += '<li class="w-100 pl-2 mt-1" onclick="generateContentView(' + indx + ',' + ch_indx + ',this)">\n' +
                '           <a href="#" class="px-0 align-self-end text-light pkg"> ' +
                '               <span class="d-inline">' + ch_val.subMenuName + '</span>\n' +
                '           </a>\n' +
                '       </li>\n';
        });

        $('#sidebarMenu').append('<li class="w-100 ">\n' +
            ' <a href="#submenu' + indx + '" data-toggle="collapse" ' +
            '       data-target="#submenu' + indx + '" aria-expanded="false" class="px-0 align-middle text-light collapsed">\n' +
            '       <span class="ml-1 d-inline">' + val.menuName + '</span>\n' +
            ' </a>\n' +
            ' <ul class="pl-sm-2 collapse fade flex-column ml-1 list-group-flush" id="submenu' + indx + '" data-parent="#sidebarMenu">\n' +
            child_li + '\n' +
            ' </ul>\n' +
            '</li>')
    });
}

function generateContentView(menuIndex, subMenIndex, element) {

    $('#gridSystem').empty();
    $(".sideMenu-selected").parent().parent().removeClass(" border rounded-pill border-light ");
    $(".sideMenu-selected").removeClass("sideMenu-selected");
    $(element).find("span").addClass("sideMenu-selected");
    $(element).addClass(" border rounded border-light ");
    var newelements = [];
    Array.prototype.map.call(contentTree[menuIndex].subMenuNames[subMenIndex].subFiles,
        function (val, indx, arr) {
            newelements.push($('<div class="shadow-fancy card bg-dark small-card" ' +
                '                       onclick="importFile(' + menuIndex + ',' + subMenIndex + ',' + indx + ', \'' + val.fileName + '\')">\n' +
                '      <div class="card-body m-0 p-0">\n' +
                '           <div class="card-img-top">\n' +
                '               <img id="img' + indx + '" src="' + val.demoGifFilePath + '" class="card-img-top" >' +
                '           </div>\n' +
                '           <div class=" bg-fancy">\n' +
                '               <p class="m-0 p-0 text-neon text-center ">' + val.fileName + '</p>\n' +
                '           </div>\n' +
                '    </div>\n' +
                '  </div>').hide().fadeIn(500));
        });
    $('#gridSystem').append(newelements);
}

function searchItems(inputValue) {
    $('#gridSystem').empty();
    if (inputValue !== '') {
        $('#btnSearch').attr('disabled', false);
        $(".sideMenu-selected").parent().parent().removeClass(" border rounded-pill border-light ");
        $(".sideMenu-selected").removeClass("sideMenu-selected");
        var newelements = [];
        Array.prototype.map.call(contentTree, function (contentTree_Val, contentTreeVal_indx) {
            Array.prototype.map.call(contentTree_Val.subMenuNames, function (subMenuNames_Val, subMenuNames_indx) {
                Array.prototype.map.call(subMenuNames_Val.subFiles,
                    function (subFiles_val, subFiles_indx) {
                        if (subFiles_val.fileName.toLowerCase().indexOf(inputValue.toLowerCase(), 0) !== -1) {
                            newelements.push($('<div class="shadow-fancy card bg-dark small-card" ' +
                                '                       onclick="importFile(' + contentTreeVal_indx + ',' + subMenuNames_indx + ',' + subFiles_indx + ', \'' + subFiles_val.fileName + '\')">\n' +
                                '      <div class="card-body m-0 p-0">\n' +
                                '           <div class="card-img-top">\n' +
                                '               <img id="img' + subFiles_indx + '" src="' + subFiles_val.demoGifFilePath + '" class="card-img-top" >' +
                                '           </div>\n' +
                                '           <div class=" bg-fancy">\n' +
                                '               <p class="m-0 p-0 text-neon text-center ">' + subFiles_val.fileName + '</p>\n' +
                                '           </div>\n' +
                                '    </div>\n' +
                                '  </div>').hide().fadeIn(500));
                        }
                    });
            });
        });

        $('#gridSystem').append(newelements);
    }
    else {
        $('#btnSearch').attr('disabled', 'disabled');
    }
}

function importFile(menuIndex, subMenuIndex, fileIndex, projName) {
    var selected_file = contentTree[menuIndex].subMenuNames[subMenuIndex].subFiles[fileIndex];
    importProjPath = selected_file.projectPath;
    importProjName = selected_file.fileName
    var settingPath = selected_file.settingPath;

    csInterface.evalScript('getAllComps()', function (res) {
        if (res !== "") {
            var allComps = JSON.parse(res);

            if (allComps.err) {
                alert(allComps.msg);
                return;
            }

            opneSetting(settingPath, allComps, projName);

        }
    });
}

function opneSetting(settingPath, comps, projName) {

    $.ajax({
        cache: false,
        url: settingPath,
        success: function (settingResult) {
            setingNeede = JSON.parse(settingResult);
            rawModal();

            $('.lbl_projname').text(function () {
                return projName + " Pre-setup";
            });

            var items = '<option value="0" selected>Active Comp</option>\n';
            $('#compSelect_hud').empty();
            $('#compSelect_sizeline').empty();
            $('#compSelect_callout').empty();

            Array.prototype.map.call(comps, function (val) {
                items += '<option value="' + val.compItemIndex + '">' + val.compName + '</option> \n';
            });

            $('#compSelect_hud').append(items);
            $('#compSelect_sizeline').append(items);
            $('#compSelect_callout').append(items);

            compSelected(0);

            var _setting = setingNeede.setting;

            if (setingNeede.type === "hud") {

                $('#hudSettingModal').modal('show');
            }
            if (setingNeede.type === "sizeline") {

                $('#sizelineSettingModal').modal('show');
            }
            else if (setingNeede.type === "Sample") {

                $('#SampleSettingModal').modal('show');
            }
            else if (setingNeede.type === "CallOut") {

                var lineCount = _setting.beam;

                $("#div_compSelect_callout").show();

                $('#div_textSticker_callout').show();
                if (lineCount > 0) {
                    $("#div_lineSelect_callout").show();
                    for (var i = 1; i <= lineCount; i++) {
                        $("#div_startlayerSelect_callout_line" + i).show();
                    }
                }
                if (_setting.time) {
                    $("div .cti").show();
                }


                if (_setting.text.indexOf("main", 0) !== -1) {
                    $("#div_mainText_callout").show();
                }

                if (_setting.text.indexOf("sub", 0) !== -1) {
                    $("#div_subText_callout").show();
                }

                if (_setting.text.indexOf("desc", 0) !== -1) {
                    $("#div_descText_callout").show();
                }

                $('#calloutSettingModal').modal('show');
            }
        }
    });


}

function compSelected(this_val) {

    csInterface.evalScript('getAllLayersInComp(' + this_val + ')', function (res) {
        if (res !== "") {

            var layers = JSON.parse(res);
            if (layers.err) {
                alert('Comp moved or removed, select the Comp again!');
                reloadComps();
                return;
            }

            var _layers = '';
            var _layers_first = '<option value="0" selected>Do not Stick</option> \n';
            var _layers_first_withNull = '<option value="" selected>Choose layer ...</option> \n';

            Array.prototype.map.call(layers, function (val) {
                _layers += '<option value="' + val.layerIndex + '">' + val.layerName + '</option> \n'
            });

            $('#startlayerSelect_line1').empty();
            $('#startlayerSelect_line1').append(_layers_first_withNull + _layers);

            $('#startlayerSelect_line2').empty();
            $('#startlayerSelect_line2').append(_layers_first_withNull + _layers);

            $('#startlayerSelect_line3').empty();
            $('#startlayerSelect_line3').append(_layers_first_withNull + _layers);

            $('#layerTextSticker_callout').empty();
            $('#layerTextSticker_callout').append(_layers_first_withNull + _layers);

            $('#startlayerSelect_callout_line1').empty();
            $('#startlayerSelect_callout_line1').append(_layers_first_withNull + _layers);

            $('#startlayerSelect_callout_line2').empty();
            $('#startlayerSelect_callout_line2').append(_layers_first_withNull + _layers);

            $('#startlayerSelect_callout_line3').empty();
            $('#startlayerSelect_callout_line3').append(_layers_first_withNull + _layers);

            $('#startlayerSelect_callout_line4').empty();
            $('#startlayerSelect_callout_line4').append(_layers_first_withNull + _layers);

            $('#layerSticker_hud').empty();
            $('#layerSticker_hud').append(_layers_first + _layers);

            $('#start_point_sizeline').empty();
            $('#start_point_sizeline').append(_layers_first_withNull + _layers);

            $('#end_point_sizeline').empty();
            $('#end_point_sizeline').append(_layers_first_withNull + _layers);
        }
    });
}

function reloadComps() {
    csInterface.evalScript('getAllComps()', function (res) {
        if (res !== "") {
            var allComps = JSON.parse(res);
            if (allComps.err) {
                alert(allComps.msg);
                return;
            }

            $('#compSelect_hud').empty();
            $('#compSelect_callout').empty();
            var items = '<option value="0" selected>Active Comp</option>\n';
            Array.prototype.map.call(allComps, function (val) {
                items += '<option value="' + val.compItemIndex + '">' + val.compName + '</option> \n';
            });
            $('#compSelect_hud').append(items);
            $('#compSelect_callout').append(items);
            compSelected(0);
        }
    });
}

function rawModal() {

    $('#calloutImportFomr').removeClass('was-validated');
    $('#sizelineImportForm').removeClass('was-validated');
    $('#hudImportForm').removeClass('was-validated');

    $("#startlayerSelect_callout_line1").removeClass("border-danger");
    $("#startlayerSelect_callout_line2").removeClass("border-danger");
    $("#startlayerSelect_callout_line3").removeClass("border-danger");
    $("#startlayerSelect_callout_line4").removeClass("border-danger");
    $("#compSelect_callout").removeClass("border-danger");
    $("#compSelect_hud").removeClass("border-danger");

    $("#stickyImportFomr>div.position-relative").hide();
    $("#calloutImportFomr>div.position-relative").hide();

    $('#compSelect_hud').empty();
    $('#compSelect_sizeline').empty();
    $('#compSelect_callout').empty();

    $('#start_point_sizeline').empty();
    $('#end_point_sizeline').empty();

    $("#TextSourceInput_MainText_callout").val('');
    $("#TextSourceInput_SubText_callout").val('');
    $("#TextSourceInput_DescText_callout").val('');

    startTimeChangestickyImportFomr(false);
    $('#startTimeSwitch_hud')[0].checked = false;

    $('#layerTextSticker_callout').empty();
    $('#startlayerSelect_callout_line1').empty();
    $('#startlayerSelect_callout_line2').empty();
    $('#startlayerSelect_callout_line3').empty();
    $('#startlayerSelect_callout_line4').empty();

    callout_linecount = 1;
    $('#startlayerSelect_callout_line2').val('');
    $('#div_startlayerSelect_callout_line2').addClass('d-none');

    $('#startlayerSelect_callout_line3').val('');
    $('#div_startlayerSelect_callout_line3').addClass('d-none');

    $('#startlayerSelect_callout_line4').val('');
    $('#div_startlayerSelect_callout_line4').addClass('d-none');

    $('#startTimeSwitch_callout')[0].checked = false;

    $('.form-check-input').prop('checked', true);
    $('.form-switch-input').prop('checked', false);
}

function startTimeChangestickyImportFomr(value) {
    if (value === true) {
        $("#startTimeSwitchlabel_hud").text("from - to (Seconds - accept decimal)");
        $("#startTimeSpecificValue_hud").prop("disabled", false).parent().parent().css("opacity", "1");
        $("#endTimeSpecificValue_hud").prop("disabled", false).parent().parent().css("opacity", "1");

        $("#startTimeSwitchlabel_callout").text("from - to (Seconds - accept decimal)");
        $("#startTimeSpecificValue_callout").prop("disabled", false).parent().parent().css("opacity", "1");
        $("#endTimeSpecificValue_callout").prop("disabled", false).parent().parent().css("opacity", "1");

        $("#startTimeSpecificValue_sizeline").text("from - to (Seconds - accept decimal)");
        $("#startTimeSpecificValue_sizeline").prop("disabled", false).parent().parent().css("opacity", "1");
        $("#endTimeSpecificValue_sizeline").prop("disabled", false).parent().parent().css("opacity", "1");
    } else {
        $("#startTimeSwitchlabel_hud").text("start from current CTI to end of timeline");
        $("#startTimeSpecificValue_hud")[0].value = 0;
        $("#endTimeSpecificValue_hud")[0].value = 0;
        $("#endTimeSpecificValue_hud").prop("disabled", true).parent().parent().css("opacity", "0.2");
        $("#startTimeSpecificValue_hud").prop("disabled", true).parent().parent().css("opacity", "0.2");

        $("#startTimeSwitchlabel_callout").text("start from current CTI to end of timeline");
        $("#startTimeSpecificValue_callout")[0].value = 0;
        $("#endTimeSpecificValue_callout")[0].value = 0;
        $("#endTimeSpecificValue_callout").prop("disabled", true).parent().parent().css("opacity", "0.2");
        $("#startTimeSpecificValue_callout").prop("disabled", true).parent().parent().css("opacity", "0.2");

        $("#startTimeSpecificValue_sizeline").text("start from current CTI");
        $("#startTimeSpecificValue_sizeline")[0].value = 0;
        $("#endTimeSpecificValue_sizeline")[0].value = 0;
        $("#endTimeSpecificValue_sizeline").prop("disabled", true).parent().parent().css("opacity", "0.2");
        $("#startTimeSpecificValue_sizeline").prop("disabled", true).parent().parent().css("opacity", "0.2");
    }
}

function generateJsonSetting() {
    if (setingNeede !== null) {
        if (setingNeede.type === "hud") {
            var json_result = {};

            $('#stickyImportFomr').addClass('was-validated');

            var _setting = setingNeede.setting;
            if (!$('#compSelect_hud').find("option:selected").val()) {

                return;
            }

            json_result.comp = (!$('#compSelect_hud').find("option:selected").val() ? 0 : $('#compSelect_hud').find("option:selected").val());


            json_result.sticker = $('#layerSticker_hud').find("option:selected").val();

            if (_setting.time) {

                json_result.cti = {
                    fromCti: (!$('#startTimeSwitch_hud')[0].checked),
                    startTime: (!$('#startTimeSpecificValue_hud')[0].value ? 0 : $('#startTimeSpecificValue_hud')[0].value),
                    endTime: (!$('#endTimeSpecificValue_hud')[0].value ? 0 : $('#endTimeSpecificValue_hud')[0].value),
                };
            }

            json_result.link = $('#attribuites_hud')[0].checked;

            json_result.position = $('#position_CheckBox_hud')[0].checked;
            json_result.rotation = $('#rotation_CheckBox_hud')[0].checked;

            importHud(json_result);
        }
        if (setingNeede.type === "sizeline") {
            var json_result = {};

            $('#sizelineImportForm').addClass('was-validated');

            var _setting = setingNeede.setting;
            if (!$('#compSelect_sizeline').find("option:selected").val()) {

                return;
            }

            json_result.comp = (!$('#compSelect_sizeline').find("option:selected").val() ? 0 : $('#compSelect_sizeline').find("option:selected").val());

            json_result.start = $('#start_point_sizeline').find("option:selected").val();
            json_result.end = $('#end_point_sizeline').find("option:selected").val();

            if ($('#TextSourceInput_SizeText_sizeline').val() !== "") {
                json_result.sizeText = $('#TextSourceInput_SizeText_sizeline').val();
            }
            else {
                json_result.sizeText = '';
            }

            if (_setting.time) {

                json_result.cti = {
                    fromCti: (!$('#startTimeSwitch_sizeline')[0].checked),
                    startTime: (!$('#startTimeSpecificValue_sizeline')[0].value ? 0 : $('#startTimeSpecificValue_sizeline')[0].value),
                    endTime: (!$('#endTimeSpecificValue_sizeline')[0].value ? 0 : $('#endTimeSpecificValue_sizeline')[0].value),
                };
            }

            importSizeline(json_result);
        }
        else if (setingNeede.type === "CallOut") {

            $('#calloutImportFomr').addClass('was-validated');

            var _setting = setingNeede.setting;
            var lineCount = _setting.beam;
            var json_result = {};
            if (!$('#compSelect_callout').find("option:selected").val()) {

                return;
            }
            json_result.comp = $('#compSelect_callout').find("option:selected").val();
            if (!$('#layerTextSticker_callout').find("option:selected").val() || $('#layerTextSticker_callout').find("option:selected").val() === 0) {

                return;
            }
            json_result.sticker = $('#layerTextSticker_callout').find("option:selected").val();

            var layers_selected = [];

            if (lineCount > 0) {

                for (var i = 1; i <= lineCount; i++) {
                    if (!$('#startlayerSelect_callout_line' + i).find("option:selected").val()
                        || $('#startlayerSelect_callout_line' + i).find("option:selected").val() === 0) {
                        continue;
                    }
                    layers_selected.push({
                        start: $('#startlayerSelect_callout_line' + i).find("option:selected").val(),
                        end: json_result.sticker
                    });
                }
            }

            json_result.layers = layers_selected;

            if (_setting.time) {
                json_result.cti = {
                    fromCti: (!$('#startTimeSwitch_callout')[0].checked),
                    startTime: (!$('#startTimeSpecificValue_callout')[0].value ? 0 : $('#startTimeSpecificValue_callout')[0].value),
                    endTime: (!$('#endTimeSpecificValue_callout')[0].value ? 0 : $('#endTimeSpecificValue_callout')[0].value),
                };
            }

            if (_setting.text.indexOf("main", 0) !== -1) {
                if ($('#TextSourceInput_MainText_callout').val() !== "") {
                    json_result.mainText = $('#TextSourceInput_MainText_callout').val();
                }
            }

            if (_setting.text.indexOf("sub", 0) !== -1) {

                if ($('#TextSourceInput_SubText_callout').val() !== "") {
                    json_result.subText = $('#TextSourceInput_SubText_callout').val();
                }
            }

            if (_setting.text.indexOf("desc", 0) !== -1) {
                if ($('#TextSourceInput_DescText_callout').val() !== "") {
                    json_result.descText = $('#TextSourceInput_DescText_callout').val();
                }
            }

            json_result.link = $('#attribuites_callout')[0].checked;

            json_result.position = $('#position_CheckBox_callout')[0].checked;
            json_result.rotation = $('#rotation_CheckBox_callout')[0].checked;

            importCallOut(json_result);
        }
    }
}

function importCallOut(jsonInput) {
    var str_input = JSON.stringify(jsonInput);
    const strEval = 'importCallOut("' + importProjPath + '","' + lineFullPath + '",\'' + str_input + '\',\'' + importProjName + '\')';
    ShowLoader();
    csInterface.evalScript(strEval
        , function (res) {
            HideLoader();
            var result = JSON.parse(res);
            if (result.err) {
                reloadComps();
                if (result.msg.indexOf('Unable to call "layer" because of parameter 1', 0) !== -1) {
                    alert("Wrong sticker-Layer selected!");
                    $("#layerTextSticker_callout").addClass("border-danger");
                } else if (result.msg.indexOf('no Comp found', 0) !== -1 ||
                    result.msg.indexOf('no active comp found', 0) !== -1) {
                    alert("Wrong Comp selected!");
                    $("#compSelect_callout").addClass("border-danger");
                } else if (result.msg.indexOf('start-point', 0) !== -1) {
                    alert(result.msg);

                    $("#startlayerSelect_callout_line1").addClass("border-danger");
                    $("#startlayerSelect_callout_line2").addClass("border-danger");
                    $("#startlayerSelect_callout_line3").addClass("border-danger");
                    $("#startlayerSelect_callout_line4").addClass("border-danger");
                }
                else {
                    alert(result.msg);
                }

                return;
            }
            else {
                validate($("#compSelect_callout"));
                $('#calloutSettingModal').modal('hide');
                $('#calloutImportFomr').removeClass('was-validated');
            }
        });

}

function Invalid(element) {
    ele.addClass('border-danger');
}

function validate(element) {
    ele.removeClass('border-danger');
}

function importHud(jsonInput) {
    var str_input = JSON.stringify(jsonInput);
    const strEval = 'importBasicHud("' + importProjPath + '",\'' + str_input + '\',\'' + importProjName + '\')';
    ShowLoader();
    csInterface.evalScript(strEval
        , function (res) {
            HideLoader();
            var result = JSON.parse(res);
            if (result.err) {
                if (result.msg.indexOf('no Comp found', 0) !== -1 ||
                    result.msg.indexOf('no active comp found', 0) !== -1) {
                    alert("Wrong Comp selected!");
                    $("#compSelect_hud").addClass("border-danger");

                } else {
                    alert(result.msg);
                }

                reloadComps();
                return;
            }
            else {
                $('#hudSettingModal').modal('hide');
                $('#hudImportForm').removeClass('was-validated');
            }

        });
}

function importSizeline(jsonInput) {
    var str_input = JSON.stringify(jsonInput);
    const strEval = 'importBasicSizeline("' + importProjPath + '",\'' + str_input + '\',\'' + importProjName + '\', "' + sizetextFullPath + '" )';
    ShowLoader();
    csInterface.evalScript(strEval
        , function (res) {
            HideLoader();
            var result = JSON.parse(res);
            if (result.err) {
                alert(result.msg);
                reloadComps();
                return;
            }
            else {
                $('#sizelineSettingModal').modal('hide');
                $('#sizelineImportForm').removeClass('was-validated');
            }
        });
}



//function importPackage() {
//    const strEval = 'importNewPackage("' + packagesPath + '")';
//    csInterface.evalScript(strEval
//        , function (res) {
//            if (res !== "") {
//                $('#backtoHome')[0].click();
//            }
//        });
//}

function openUrl(url) {
    const strEval = 'openURL("' + url + '")';
    csInterface.evalScript(strEval);
}

function ShowLoader() {
    $('#Loader').fadeIn();
}

function HideLoader() {
    $('#Loader').fadeOut()
}

function addline() {
    if (callout_linecount < 4) {
        callout_linecount++;
        for (var i = 1; i <= callout_linecount; i++) {
            $('#div_startlayerSelect_callout_line' + i).removeClass('d-none');
        }
    }
}

function removeline() {
    $('#startlayerSelect_callout_line' + callout_linecount).val('');
    $('#div_startlayerSelect_callout_line' + callout_linecount).addClass('d-none');
    callout_linecount--;
}

function openHelp(key) {
    $.ajax({
        cache: false,
        url: helpjsonPath,
        success: function (helpResult) {
            var helpObj = JSON.parse(helpResult);
            Array.prototype.find.call(helpObj.texts, function (val, indx) {
                if (val.key === key) {
                    $('#helperGifContainer').css('background-image', 'url(./assets/help/' + key + '.gif)');
                    $('#helpText').text(val.text);
                    $('#helper').fadeIn();
                    return;
                }
            });
        }
    });
}

function closeHelp() {
    $('#helper').fadeOut();
}

function openRegistrationWindow() {
    $('#registerModal').fadeIn();
}

function openLogOutWindow() {
    $('#logoutAlert').fadeIn();
}

function register() {

    var pc = $("#txt_Activation_Code").val();

    if (pc.length > 0) {
        ShowLoader();
        var script = "registerRequest('" + pc.trim() + "')";
        csInterface.evalScript(script, function (res) {
            HideLoader();

            var result = JSON.parse(res);
            $("#txt_Activation_Code").removeClass("border-danger");
            if (result.err === false) {
                $('#registerModal').fadeOut();
                getFilesTree();
            } else {
                $('#txtregistererror').text(result.msg);
            }
        });
    } else {
        $("#txt_Activation_Code").addClass("border-danger");
    }
}

function logOut() {
    ShowLoader();
    var script = "logOut();";
    csInterface.evalScript(script, function (res) {
        HideLoader();
        var result = JSON.parse(res);

        if (result.err === true) {
            alert(result.msg);
        }
        $('#logoutAlert').fadeOut();
        getFilesTree();

    });
}
