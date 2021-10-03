var contentTree = {};
var importProjPath = '';
var importProjName = '';
var setingNeede = null;
var textPath = 'assets/packages';
var linePath = 'assets/basicRequiers/line/line.aep';
var lineFullPath = '';
var packagesPath = '';
var ads = {};
var callout_linecount = 1;


(function () {
    'use strict';
    var path;
    path = location.href;
    var x = path.indexOf("index.html");
    if (x == -1) {
        x = path.indexOf("packageImport.html");
    }
    if (getOS() == "MAC") {
        linePath = path.substring(0, x) + linePath;
        path = path.substring(0, x) + textPath;
    }
    if (getOS() == "WIN") {
        linePath = path.substring(8, x) + linePath;
        path = path.substring(8, x) + textPath;
    }
    packagesPath = path;
    lineFullPath = linePath;
    getFilesTree(path);
}());


///-----------------create menu part ----
function getFilesTree(myPath) {
    const csInterface = new CSInterface();
    csInterface.evalScript('getMainDirectories("' + myPath + '")', function (res) {
        var result = JSON.parse(res);

        if (result.err) {
            alert(result.msg);
            return;
        }

        contentTree = result;
        if (contentTree.length > 0) {
            generateSideBar();
        }
    });
}

function generateSideBar() {
    $('#sidebarMenu').empty();
    contentTree.map((val, indx, arr) => {

        var child_li = '';

        val.subMenuNames.map((ch_val, ch_indx, ch_arr) => {
            child_li += '<li class="w-100 ps-2 mt-1" onclick="generateContentView(' + indx + ',' + ch_indx + ',this)">\n' +
                '           <a href="#" class="px-0 align-self-end text-light pkg"> ' +
                '<span class="d-inline">' + ch_val.subMenuName + '</span>\n' +
                '           </a>\n' +
                '       </li>\n';
        });

        $('#sidebarMenu').append('<li class="w-100 ">\n' +
            ' <a href="#submenu' + indx + '" data-bs-toggle="collapse" ' +
            'data-bs-target="#submenu' + indx + '" aria-expanded="false" class="px-0 align-middle text-light collapsed">\n' +
            '       <span class="ms-1 d-inline">' + val.menuName + '</span>\n' +
            ' </a>\n' +
            ' <ul class="ps-sm-2 collapse fade nav flex-column ms-1 list-group list-group-flush" id="submenu' + indx + '" data-bs-parent="#sidebarMenu">\n' +
            child_li + '\n' +
            ' </ul>\n' +
            '</li>'
        )
    });

    // $('#sidebarMenu').append('<a href="./packageImport.html" class="pt-2 align-self-end text-light">\n' +
    //     '      <div class="row "><i class="fa fa-file-import col-1"></i><p class="col">Import Package</p></div>\n' +
    //     ' </a>\n');

}

function generateContentView(menuIndex, subMenIndex, element) {
    $('#gridSystem').empty();
    $(".sideMenu-selected").parent().parent().removeClass(" border rounded-pill border-light ");
    $(".sideMenu-selected").removeClass("sideMenu-selected");
    $(element).find("span").addClass("sideMenu-selected");
    $(element).addClass(" border rounded-pill border-light ");
    var newelements = [];
    contentTree[menuIndex].subMenuNames[subMenIndex].subFiles.map((val, indx, arr) => {
        newelements.push($('<div class="shadow-fancy card bg-dark small-card" ' +
            '                       onclick="importFile(' + menuIndex + ',' + subMenIndex + ',' + indx + ')">\n' +
            '      <div class="card-body  h-100 m-0 p-0">\n' +
            '           <div class="card-img-top h-75">\n' +
            '               <img id="img' + indx + '" src="' + val.demoGifFilePath + '" class="card-img-top w-100 h-100" >' +
            '           </div>\n' +
            '           <div class="card-title bg-fancy h-25">\n' +
            '               <p class="card-title text-neon text-center ">' + val.fileName + '</p>\n' +
            '           </div>\n' +
            '    </div>\n' +
            '  </div>').hide().fadeIn(500));

    });
    $('#gridSystem').append(newelements);
}

function importFile(menuIndex, subMenuIndex, fileIndex) {
    var selected_file = contentTree[menuIndex].subMenuNames[subMenuIndex].subFiles[fileIndex];
    importProjPath = selected_file.projectPath;
    importProjName = selected_file.fileName
    var settingPath = selected_file.settingPath;
    const csInterface = new CSInterface();
    csInterface.evalScript('getAllComps()', function (res) {
        if (res !== "") {
            var allComps = JSON.parse(res);

            if (allComps.err) {
                alert(allComps.msg);
                return;
            }

            opneSetting(settingPath, allComps);

        }
    });
}

function reloadComps() {
    const csInterface = new CSInterface();
    csInterface.evalScript('getAllComps()', function (res) {
        if (res !== "") {
            var allComps = JSON.parse(res);
            if (allComps.err) {
                alert(allComps.msg);
                return;
            }

            $('#compSelect_hud').empty();
            $('#compSelect_callout').empty();
            $('#compSelect_witchEffect').empty();
            var items = '<option value="0" selected>Active Comp</option>\n';
            allComps.map((val, indx, arr) => {
                items += '<option value="' + val.compItemIndex + '">' + val.compName + '</option> \n';
            });
            $('#compSelect_hud').append(items);
            $('#compSelect_callout').append(items);
            $('#compSelect_witchEffect').append(items);
            compSelected(0);
        }
    });
}

async function opneSetting(settingPath, comps) {

    var settingResult = await $.ajax({
        cache: false,
        url: settingPath
    });

    setingNeede = JSON.parse(settingResult);
    rawModal();
    var items = '<option value="0" selected>Active Comp</option>\n';
    $('#compSelect_hud').empty();
    $('#compSelect_sizeline').empty();
    $('#compSelect_callout').empty();
    $('#compSelect_witchEffect').empty();

    comps.map((val, indx, arr) => {
        items += '<option value="' + val.compItemIndex + '">' + val.compName + '</option> \n';

    });

    $('#compSelect_hud').append(items);
    $('#compSelect_sizeline').append(items);
    $('#compSelect_callout').append(items);
    $('#compSelect_witchEffect').append(items);

    compSelected(0);

    var _setting = setingNeede.setting;

    if (setingNeede.type === "hud") {

        $('#hudSettingModal').modal('show');
    }
    if (setingNeede.type === "sizeline") {

        $('#sizelineSettingModal').modal('show');
    }
    else if (setingNeede.type === "WitchEffect") {

        $('#witchEffectSettingModal').modal('show');
    }
    else if (setingNeede.type === "Sample") {

        $('#SampleSettingModal').modal('show');
    }
    else if (setingNeede.type === "CallOut") {

        let lineCount = _setting.beam;

        $("#div_compSelect_callout").show();

        $('#div_textSticker_callout').show();
        if (lineCount > 0) {
            $("#div_lineSelect_callout").show();
            for (let i = 1; i <= lineCount; i++) {
                $("#div_startlayerSelect_callout_line" + i).show();
            }
        }
        if (_setting.time) {
            $("div .cti").show();
        }

        if (_setting.text.includes("main")) {
            $("#div_mainText_callout").show();
        }

        if (_setting.text.includes("sub")) {
            $("#div_subText_callout").show();
        }

        if (_setting.text.includes("desc")) {
            $("#div_descText_callout").show();
        }


        $('#calloutSettingModal').modal('show');
    }
}

function rawModal() {
    $("#stickyImportFomr>div.position-relative").hide();
    $("#calloutImportFomr>div.position-relative").hide();

    $('#compSelect_hud').empty();
    $('#compSelect_sizeline').empty();
    $('#compSelect_callout').empty();
    $('#compSelect_witchEffect').empty();

    $('#start_point_sizeline').empty();
    $('#end_point_sizeline').empty();

    $("#TextSourceInput_MainText_callout").val('');
    $("#TextSourceInput_SubText_callout").val('');
    $("#TextSourceInput_DescText_callout").val('');

    startTimeChangestickyImportFomr(false);
    $('#startTimeSwitch_hud')[0].checked = false;
    $('#select_3D_hud')[0].checked = false;

    $('#layerTextSticker_callout').empty();
    $('#startlayerSelect_callout_line1').empty();
    $('#startlayerSelect_callout_line2').empty();
    $('#startlayerSelect_callout_line3').empty();
    $('#startlayerSelect_callout_line4').empty();

    callout_linecount = 1;
    $('#startlayerSelect_callout_line2').val('');
    $('#div_startlayerSelect_callout_line2').addClass('d-none');

    $('#startlayerSelect_callout_line3' ).val('');
    $('#div_startlayerSelect_callout_line3').addClass('d-none');

    $('#startlayerSelect_callout_line4').val('');
    $('#div_startlayerSelect_callout_line4').addClass('d-none');

    $('#startTimeSwitch_callout')[0].checked = false;
}

function generateJsonSetting() {
    if (setingNeede !== null) {
        if (setingNeede.type === "hud") {
            let json_result = {};

            $('#stickyImportFomr').addClass('was-validated');

            let _setting = setingNeede.setting;
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

            if (_setting.thd) {
                json_result.thd = $('#select_3D_hud')[0].checked
            }

            importHud(json_result);
        }
        if (setingNeede.type === "sizeline") {
            let json_result = {};

            $('#sizelineImportForm').addClass('was-validated');

            let _setting = setingNeede.setting;
            if (!$('#compSelect_sizeline').find("option:selected").val()) {

                return;
            }

            json_result.comp = (!$('#compSelect_sizeline').find("option:selected").val() ? 0 : $('#compSelect_sizeline').find("option:selected").val());

            json_result.start = $('#start_point_sizeline').find("option:selected").val();
            json_result.end = $('#end_point_sizeline').find("option:selected").val();

            if (_setting.time) {

                json_result.cti = {
                    fromCti: (!$('#startTimeSwitch_sizeline')[0].checked),
                    startTime: (!$('#startTimeSpecificValue_sizeline')[0].value ? 0 : $('#startTimeSpecificValue_sizeline')[0].value),
                    endTime: (!$('#endTimeSpecificValue_sizeline')[0].value ? 0 : $('#endTimeSpecificValue_sizeline')[0].value),
                };
            }

            if (_setting.thd) {
                json_result.thd = $('#select_3D_sizeline')[0].checked
            }

            importSizeline(json_result);
        }
        else if (setingNeede.type === "WitchEffect") {
            let json_result = {};

            $('#witchEffectImportForm').addClass('was-validated');

            let _setting = setingNeede.setting;
            if (!$('#compSelect_witchEffect').find("option:selected").val()) {

                return;
            }

            json_result.comp = (!$('#compSelect_witchEffect').find("option:selected").val() ? 0 : $('#compSelect_witchEffect').find("option:selected").val());

            if (_setting.time) {

                json_result.cti = {
                    fromCti: (!$('#startTimeSwitch_witchEffect')[0].checked),
                    startTime: (!$('#startTimeSpecificValue_witchEffect')[0].value ? 0 : $('#startTimeSpecificValue_witchEffect')[0].value),
                    endTime: (!$('#endTimeSpecificValue_witchEffect')[0].value ? 0 : $('#endTimeSpecificValue_witchEffect')[0].value),
                };
            }

            importWitchEffect(json_result);
        }
        else if (setingNeede.type === "CallOut") {

            $('#calloutImportFomr').addClass('was-validated');

            let _setting = setingNeede.setting;
            let lineCount = _setting.beam;
            let json_result = {};
            if (!$('#compSelect_callout').find("option:selected").val()) {

                return;
            }
            json_result.comp = $('#compSelect_callout').find("option:selected").val();
            if (!$('#layerTextSticker_callout').find("option:selected").val() || $('#layerTextSticker_callout').find("option:selected").val() === 0) {

                return;
            }
            json_result.sticker = $('#layerTextSticker_callout').find("option:selected").val();

            let layers_selected = [];

            if (lineCount > 0) {

                for (let i = 1; i <= lineCount; i++) {
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

            if (_setting.text.includes("main")) {
                if ($('#TextSourceInput_MainText_callout').val() !== "") {
                    json_result.mainText = $('#TextSourceInput_MainText_callout').val();
                }
            }

            if (_setting.text.includes("sub")) {

                if ($('#TextSourceInput_SubText_callout').val() !== "") {
                    json_result.subText = $('#TextSourceInput_SubText_callout').val();
                }
            }

            if (_setting.text.includes("desc")) {

                if ($('#TextSourceInput_DescText_callout').val() !== "") {
                    json_result.descText = $('#TextSourceInput_DescText_callout').val();
                }
            }

            importCallOut(json_result);
        }
        else if (setingNeede.type === "Sample") {
            importSample();
        }
    }
}

function importHud(jsonInput) {
    var str_input = JSON.stringify(jsonInput);
    // if (compSelectvalue && startlayerSelectvalue !== 0 && endlayerSelectvalue !== 0) {
    const csInterface = new CSInterface();
    const strEval = 'importBasicHud("' + importProjPath + '",\'' + str_input + '\',\'' + importProjName + '\')';
    ShowLoader();
    csInterface.evalScript(strEval
        , function (res) {
            HideLoader();
            var result = JSON.parse(res);
            if (result.err) {
                alert(result.msg);
                return;
            }
            else {
                $('#hudSettingModal').modal('hide');
                $('#hudImportForm').removeClass('was-validated');
            }

        });
    //} else {

    //}
}

function importSizeline(jsonInput) {
    var str_input = JSON.stringify(jsonInput);
    // if (compSelectvalue && startlayerSelectvalue !== 0 && endlayerSelectvalue !== 0) {
    const csInterface = new CSInterface();
    const strEval = 'importBasicSizeline("' + importProjPath + '",\'' + str_input + '\',\'' + importProjName + '\')';
    ShowLoader();
    csInterface.evalScript(strEval
        , function (res) {
            HideLoader();
            var result = JSON.parse(res);
            if (result.err) {
                alert(result.msg);
                return;
            }
            else {
                $('#sizelineSettingModal').modal('hide');
                $('#sizelineImportForm').removeClass('was-validated');
            }
        });
    //} else {

    //}
}

function importWitchEffect(jsonInput) {
    var str_input = JSON.stringify(jsonInput);
    // if (compSelectvalue && startlayerSelectvalue !== 0 && endlayerSelectvalue !== 0) {
    const csInterface = new CSInterface();
    const strEval = 'importWithEffect("' + importProjPath + '",\'' + str_input + '\',\'' + importProjName + '\')';
    ShowLoader();
    csInterface.evalScript(strEval
        , function (res) {
            HideLoader();
            var result = JSON.parse(res);
            if (result.err) {
                alert(result.msg);
                return;
            }
            else {
                $('#witchEffectSettingModal').modal('hide');
                $('#witchEffectImportForm').removeClass('was-validated');
            }
        });
    //} else {

    //}
}

function importSample() {
    const csInterface = new CSInterface();
    const strEval = 'importSamples("' + importProjPath + '")';
    ShowLoader();
    csInterface.evalScript(strEval
        , function (res) {
            HideLoader();
            var result = JSON.parse(res);
            if (result.err) {
                alert(result.msg);
                return;
            }
            else {
                $('#SampleSettingModal').modal('hide');
            }
        });
    //} else {

    //}
}

function importCallOut(jsonInput) {
    var str_input = JSON.stringify(jsonInput);
    // if (compSelectvalue && startlayerSelectvalue !== 0 && endlayerSelectvalue !== 0) {
    const csInterface = new CSInterface();
    const strEval = 'importCallOut("' + importProjPath + '","' + lineFullPath + '",\'' + str_input + '\',\'' + importProjName + '\')';
    ShowLoader();
    csInterface.evalScript(strEval
        , function (res) {
            HideLoader();
            var result = JSON.parse(res);
            if (result.err) {
                alert(result.msg);
                return;
            }
            else {
                $('#calloutSettingModal').modal('hide');
                $('#calloutImportFomr').removeClass('was-validated');
            }
        });
    //} else {

    //}
}

function startTimeChangestickyImportFomr(value) {
    if (value === true) {
        $("#startTimeSwitchlabel_hud").text("from - to (Seconds - accept decimal)");
        $("#startTimeSpecificValue_hud").prop("disabled", false).parent().parent().css("opacity", "1");
        $("#endTimeSpecificValue_hud").prop("disabled", false).parent().parent().css("opacity", "1");

        $("#startTimeSwitchlabel_callout").text("from - to (Seconds - accept decimal)");
        $("#startTimeSpecificValue_callout").prop("disabled", false).parent().parent().css("opacity", "1");
        $("#endTimeSpecificValue_callout").prop("disabled", false).parent().parent().css("opacity", "1");

        $("#startTimeSwitchlabel_witchEffect").text("from - to (Seconds - accept decimal)");
        $("#startTimeSpecificValue_witchEffect").prop("disabled", false).parent().parent().css("opacity", "1");
        $("#endTimeSpecificValue_witchEffect").prop("disabled", false).parent().parent().css("opacity", "1");

        $("#startTimeSpecificValue_sizeline").text("from - to (Seconds - accept decimal)");
        $("#startTimeSpecificValue_sizeline").prop("disabled", false).parent().css("opacity", "1");
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

        $("#startTimeSwitchlabel_witchEffect").text("start from current CTI");
        $("#startTimeSpecificValue_witchEffect")[0].value = 0;
        $("#endTimeSpecificValue_witchEffect")[0].value = 0;
        $("#endTimeSpecificValue_witchEffect").prop("disabled", true).parent().parent().css("opacity", "0.2");
        $("#startTimeSpecificValue_witchEffect").prop("disabled", true).parent().parent().css("opacity", "0.2");

        $("#startTimeSpecificValue_sizeline").text("start from current CTI");
        $("#startTimeSpecificValue_sizeline")[0].value = 0;
        $("#endTimeSpecificValue_sizeline")[0].value = 0;
        $("#endTimeSpecificValue_sizeline").prop("disabled", true).parent().parent().css("opacity", "0.2");
        $("#startTimeSpecificValue_sizeline").prop("disabled", true).parent().css("opacity", "0.2");
    }
}

function compSelected(this_val) {
    const csInterface = new CSInterface();
    csInterface.evalScript('getAllLayersInComp(' + this_val + ')', function (res) {
        if (res !== "") {

            var layers = JSON.parse(res);
            if (layers.err) {
                alert(layers.msg);
                return;
            }

            var _layers = '';
            var _layers_first = '<option value="0" selected>Do not Stick</option> \n';
            var _layers_first_withNull = '<option value="" selected>Choose layer ...</option> \n';


            layers.map((val, indx, arr) => {
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

function getOS() {
    var userAgent = window.navigator.userAgent,
        platform = window.navigator.platform,
        macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
        windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
        os = null;

    if (macosPlatforms.indexOf(platform) != -1) {
        os = "MAC";
    } else if (windowsPlatforms.indexOf(platform) != -1) {
        os = "WIN";
    }
    return os;
}

function importPackage() {
    const csInterface = new CSInterface();
    const strEval = 'importNewPackage("' + packagesPath + '")';
    csInterface.evalScript(strEval
        , function (res) {
            if (res !== "") {
                $('#backtoHome')[0].click();
            }
        });
}

function openUrl(url) {
    const csInterface = new CSInterface();
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
        for (let i = 1; i <= callout_linecount; i++) {
            $('#div_startlayerSelect_callout_line' + i).removeClass('d-none');
        }
    }
}

function removeline() {
    $('#startlayerSelect_callout_line' + callout_linecount).val('');
    $('#div_startlayerSelect_callout_line' + callout_linecount).addClass('d-none');
    callout_linecount--;
}