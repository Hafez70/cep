var contentTree = {};
var importProjPath = '';
var importProjName = '';
var setingNeede = null;
var textPath = 'assets/packages';
var packagesPath = '';

(function () {
    'use strict';
    var path, slash;
    path = location.href;
    var x = path.indexOf("index.html");
    if (x == -1) {
        x = path.indexOf("packageImport.html");
    }
    if (getOS() == "MAC") {
        path = path.substring(0, x) + textPath;
    }
    if (getOS() == "WIN") {
        path = path.substring(8, x) + textPath;
    }
    packagesPath = path;
    getFilesTree(path);
}());

///-----------------create menu part ----
function getFilesTree(myPath) {
    const csInterface = new CSInterface();
    csInterface.evalScript('getMainDirectories("' + myPath + '")', function (res) {
        contentTree = JSON.parse(res);
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
            child_li += '<li class="w-100" onclick="generateContentView(' + indx + ',' + ch_indx + ')">\n' +
                '           <a href="#" class="px-0 align-self-end text-light pkg"> <spanclass="d-inline">' + ch_val.subMenuName + '</span>\n' +
                '           </a>\n' +
                '       </li>\n';
        });

        $('#sidebarMenu').append('<li class="w-100 ">\n' +
            ' <a href="#submenu' + indx + '" data-bs-toggle="collapse" data-bs-target="#submenu' + indx + '" aria-expanded="false" class="px-0 align-middle text-light collapsed">\n' +
            '       <span class="ms-1 d-inline">' + val.menuName + '</span>\n' +
            ' </a>\n' +
            ' <ul class="ps-5 ps-sm-3 collapse fade nav flex-column ms-1 list-group list-group-flush" id="submenu' + indx + '" data-bs-parent="#sidebarMenu">\n' +
            child_li + '\n' +
            ' </ul>\n' +
            '</li>'
        )
    });

    $('#sidebarMenu').append('<hr/> <a href="./packageImport.html" class="pt-2 align-self-end text-light">\n' +
        '       <p >Import Package</p>\n' +
        ' </a>\n');

}

function generateContentView(menuIndex, subMenIndex) {


    // $('#contentTitle').text(selectedNavMenu[subMenIndex].subMenuName);
    // $('.card-img-top').each(function (e) {
    //     $(e).unbind('mouseenter mouseleave');
    // });
    $('#gridSystem').empty();

    contentTree[menuIndex].subMenuNames[subMenIndex].subFiles.map((val, indx, arr) => {
        $('#gridSystem').append('<div class="border-dark border-5 card col-4 col-xxsm-12 col-xsm-6 col-sm-4 col-md-4 col-lg-3 col-xl-2 m-0 small-card" ' +
            '                       onclick="importFile(' + menuIndex + ',' + subMenIndex + ',' + indx + ')">\n' +
            '      <div class="card-body  h-100 m-0 p-0">\n' +
            '           <div class="card-img-top h-75">\n' +
            '               <img id="img' + indx + '" src="' + val.demoGifFilePath + '" class="card-img-top w-100 h-100" >' +
            '           </div>\n' +
            '           <div class="card-title bg-dark h-25">\n' +
            '               <p class="card-title text-light text-center ">' + val.fileName + '</p>\n' +
            '           </div>\n' +
            '    </div>\n' +
            '  </div>');
        // $("#gridSystem").on({
        //     mouseenter: function (e) {
        //         var src = this.src;
        //         $(this).attr('src', src.replace('png', 'gif'));
        //     },
        //     // mouseleave: function (e) {
        //     //     var src = this.src;
        //     //     $(this).attr('src', src.replace('gif', 'png'));
        //     // }
        // }, "img");
    });
}

function importFile(menuIndex, subMenuIndex, fileIndex) {
    var selected_file = contentTree[menuIndex].subMenuNames[subMenuIndex].subFiles[fileIndex];
    importProjPath = selected_file.projectPath;
    importProjName = selected_file.fileName
    var settingPath = selected_file.settingPath;
    const csInterface = new CSInterface();
    if (settingPath === '') {
        csInterface.evalScript('ImportFile("' + projPath + '")', function (res) {
            var CepResult = JSON.parse(res);
            if (CepResult.result === true) {
                $('#toastText').text('successfully added');
                $('#toastText').removeClass('text-danger');
                $('#toastText').addClass('text-success');
                var myToastEl = document.getElementById('toastElement');
                var myToast = bootstrap.Toast.getOrCreateInstance(myToastEl);
                myToast.show();
            } else {
                $('#toastText').text('Something is Wrong');
                $('#toastText').removeClass('text-success')
                $('#toastText').addClass('text-danger');
                var myToastEl = document.getElementById('toastElement');
                var myToast = bootstrap.Toast.getOrCreateInstance(myToastEl);
                myToast.show();
            }
        });
    } else {
        csInterface.evalScript('getAllComps()', function (res) {
            if (res !== "") {
                var allComps = JSON.parse(res);

                if (allComps.error) {
                    return;
                }

                opneSetting(settingPath, allComps);

            }
        });
    }
}

async function opneSetting(settingPath, comps) {

    var settingResult = await $.ajax({
        cache: false,
        url: settingPath
    });

    setingNeede = JSON.parse(settingResult);
    rawModal();
    var items = '<option value="0" selected>Active Comp</option>\n';
    $('#compSelect').empty();
    $('#compSelect_hud').empty();
    $('#compSelect_callout').empty();

    comps.map((val, indx, arr) => {
        items += '<option value="' + val.compItemIndex + '">' + val.compName + '</option> \n';

    });

    $('#compSelect').append(items);
    $('#compSelect_hud').append(items);
    $('#compSelect_callout').append(items);

    compSelected(0);

    var _setting = setingNeede.setting;

    if (setingNeede.type === "BeamText") {

        let lineCount = _setting.beam;

        $("#div_compSelect").show();

        $('#div_textSticker').show();

        for (let i = 1; i <= lineCount; i++) {
            $("#div_startlayerSelect_line" + i).show();
        }

        if (_setting.time) {
            $("div .cti").show();
        }

        if (_setting.text.includes("main")) {
            $("#div_mainText").show();
        }

        if (_setting.text.includes("sub")) {
            $("#div_subText").show();
        }
        $('#stickySettingModal').modal('show');

    }
    else if (setingNeede.type === "hud") {

        $('#hudSettingModal').modal('show');
    }
    else if (setingNeede.type === "CallOut") {

        let lineCount = _setting.beam;

        $("#div_compSelect_callout").show();

        $('#div_textSticker_callout').show();

        for (let i = 1; i <= lineCount; i++) {
            $("#div_startlayerSelect_callout_line" + i).show();
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

    $('#compSelect').empty();
    $('#compSelect_hud').empty();
    $('#compSelect_callout').empty();

    $("#stickyTextSourceInput_MainText").val('');
    $("#stickyTextSourceInput_SubText").val('');

    $("#TextSourceInput_MainText_callout").val('');
    $("#TextSourceInput_SubText_callout").val('');
    $("#TextSourceInput_DescText_callout").val('');

    startTimeChangestickyImportFomr(false);
    $('#startTimeSwitch')[0].checked = false;
    $('#startTimeSwitch_hud')[0].checked = false;
    $('#select_3D_hud')[0].checked = false;

    $('#layerTextSticker').empty();
    $('#startlayerSelect_line1').empty();
    $('#startlayerSelect_line2').empty();
    $('#startlayerSelect_line3').empty();

    $('#layerTextSticker_callout').empty();
    $('#startlayerSelect_callout_line1').empty();
    $('#startlayerSelect_callout_line2').empty();
    $('#startlayerSelect_callout_line3').empty();
}

function generateJsonSetting() {
    if (setingNeede !== null) {
        if (setingNeede.type === "BeamText") {

            $('#stickyImportFomr').addClass('was-validated');

            let _setting = setingNeede.setting;
            let lineCount = _setting.beam;
            let json_result = {};
            if (!$('#compSelect').find("option:selected").val()) {

                return;
            }
            json_result.comp = $('#compSelect').find("option:selected").val();
            if (!$('#layerTextSticker').find("option:selected").val() || $('#layerTextSticker').find("option:selected").val() === 0) {

                return;
            }
            json_result.sticker = $('#layerTextSticker').find("option:selected").val();

            let layers_selected = [];

            for (let i = 1; i <= lineCount; i++) {
                if (!$('#startlayerSelect_line' + i).find("option:selected").val()
                    || $('#startlayerSelect_line' + i).find("option:selected").val() == 0) {
                    return;
                }
                layers_selected.push({
                    start: $('#startlayerSelect_line' + i).find("option:selected").val(),
                    end: json_result.sticker
                });
            }
            json_result.layers = layers_selected;
            if (_setting.time) {
                json_result.cti = {
                    fromCti: (!$('#startTimeSwitch')[0].checked),
                    startTime: (!$('#startTimeSpecificValue')[0].value ? 0 : $('#startTimeSpecificValue')[0].value),
                    endTime: (!$('#endTimeSpecificValue')[0].value ? 0 : $('#endTimeSpecificValue')[0].value),
                };
            }

            if (_setting.text.includes("main")) {
                if ($('#stickyTextSourceInput_MainText').val() !== "") {
                    json_result.mainText = $('#stickyTextSourceInput_MainText').val();
                }
            }

            if (_setting.text.includes("sub")) {

                if ($('#stickyTextSourceInput_SubText').val() !== "") {
                    json_result.subText = $('#stickyTextSourceInput_SubText').val();
                }
            }

            importBeamText(json_result);
        }
        else if (setingNeede.type === "hud") {
            let json_result = {};

            $('#stickyImportFomr').addClass('hudImportForm');

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

            for (let i = 1; i <= lineCount; i++) {
                if (!$('#startlayerSelect_callout_line' + i).find("option:selected").val()
                    || $('#startlayerSelect_callout_line' + i).find("option:selected").val() == 0) {
                    return;
                }
                layers_selected.push({
                    start: $('#startlayerSelect_callout_line' + i).find("option:selected").val(),
                    end: json_result.sticker
                });
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
    }
}

function importBeamText(jsonInput) {
    var str_input = JSON.stringify(jsonInput);
    // if (compSelectvalue && startlayerSelectvalue !== 0 && endlayerSelectvalue !== 0) {
    const csInterface = new CSInterface();
    const strEval = 'importStickyTextWithBeamEffect("' + importProjPath + '",\'' + str_input + '\')';
    csInterface.evalScript(strEval
        , function (res) {
            if (res !== "") {
                $('#stickySettingModal').modal('hide');
                $('#stickyImportFomr').removeClass('was-validated');
            }
        });
    //} else {

    //}
}

function importHud(jsonInput) {
    var str_input = JSON.stringify(jsonInput);
    // if (compSelectvalue && startlayerSelectvalue !== 0 && endlayerSelectvalue !== 0) {
    const csInterface = new CSInterface();
    const strEval = 'importBasicHud("' + importProjPath + '",\'' + str_input + '\',\'' + importProjName + '\')';
    csInterface.evalScript(strEval
        , function (res) {
            $('#hudSettingModal').modal('hide');
            $('#hudImportForm').removeClass('was-validated');
        });
    //} else {

    //}
}

function importCallOut(jsonInput) {
    var str_input = JSON.stringify(jsonInput);
    // if (compSelectvalue && startlayerSelectvalue !== 0 && endlayerSelectvalue !== 0) {
    const csInterface = new CSInterface();
    const strEval = 'importCallOut("' + importProjPath + '",\'' + str_input + '\',\'' + importProjName + '\')';
    csInterface.evalScript(strEval
        , function (res) {
            if (res !== "") {
                $('#calloutSettingModal').modal('hide');
                $('#calloutImportFomr').removeClass('was-validated');
            }
        });
    //} else {

    //}
}

function startTimeChangestickyImportFomr(value) {
    if (value === true) {
        $("#startTimeSwitchLabel").text("specific Seconds (accept decimal)");
        $("#startTimeSpecificValue").prop("disabled", false).parent().css("opacity", "1");
        $("#endTimeSpecificValue").prop("disabled", false).parent().css("opacity", "1");

        $("#startTimeSwitchlabel_hud").text("specific Seconds (accept decimal)");
        $("#startTimeSpecificValue_hud").prop("disabled", false).parent().parent().css("opacity", "1");
        $("#endTimeSpecificValue_hud").prop("disabled", false).parent().css("opacity", "1");

        $("#startTimeSwitchlabel_callout").text("specific Seconds (accept decimal)");
        $("#startTimeSpecificValue_callout").prop("disabled", false).parent().parent().css("opacity", "1");
        $("#endTimeSpecificValue_callout").prop("disabled", false).parent().css("opacity", "1");
    } else {
        $("#startTimeSwitchLabel").text("start from current CTI");
        $("#startTimeSpecificValue")[0].value = 0;
        $("#endTimeSpecificValue")[0].value = 0;
        $("#endTimeSpecificValue").prop("disabled", true).parent().css("opacity", "0.2");
        $("#startTimeSpecificValue").prop("disabled", true).parent().css("opacity", "0.2");

        $("#startTimeSwitchlabel_hud").text("start from current CTI");
        $("#startTimeSpecificValue_hud")[0].value = 0;
        $("#endTimeSpecificValue_hud")[0].value = 0;
        $("#endTimeSpecificValue_hud").prop("disabled", true).parent().css("opacity", "0.2");
        $("#startTimeSpecificValue_hud").prop("disabled", true).parent().parent().css("opacity", "0.2");

        $("#startTimeSwitchlabel_callout").text("start from current CTI");
        $("#startTimeSpecificValue_callout")[0].value = 0;
        $("#endTimeSpecificValue_callout")[0].value = 0;
        $("#endTimeSpecificValue_callout").prop("disabled", true).parent().css("opacity", "0.2");
        $("#startTimeSpecificValue_callout").prop("disabled", true).parent().parent().css("opacity", "0.2");
    }
}

function compSelected(this_val) {
    const csInterface = new CSInterface();
    csInterface.evalScript('getAllLayersInComp(' + this_val + ')', function (res) {
        if (res !== "") {
            var layers = JSON.parse(res);
            var _layers = '<option value="0" selected>Do not Stick</option> \n';
            if (layers.error) {
                return;
            }

            layers.map((val, indx, arr) => {
                _layers += '<option value="' + val.layerIndex + '">' + val.layerName + '</option> \n'
            });

            $('#layerTextSticker').empty();
            $('#layerTextSticker').append(_layers);

            $('#layerTextSticker_callout').empty();
            $('#layerTextSticker_callout').append(_layers);

            $('#startlayerSelect_line1').empty();
            $('#startlayerSelect_line1').append(_layers);

            $('#startlayerSelect_line2').empty();
            $('#startlayerSelect_line2').append(_layers);

            $('#startlayerSelect_line3').empty();
            $('#startlayerSelect_line3').append(_layers);

            $('#layerTextSticker_callout').empty();
            $('#layerTextSticker_callout').append(_layers);

            $('#startlayerSelect_callout_line1').empty();
            $('#startlayerSelect_callout_line1').append(_layers);

            $('#startlayerSelect_callout_line2').empty();
            $('#startlayerSelect_callout_line2').append(_layers);

            $('#startlayerSelect_callout_line3').empty();
            $('#startlayerSelect_callout_line3').append(_layers);

            $('#layerSticker_hud').empty();
            $('#layerSticker_hud').append(_layers);
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
    const strEval = 'importNewPackage("'+ packagesPath + '")';
    csInterface.evalScript(strEval
        , function (res) {
            if (res !== "") {
                $('#backtoHome')[0].click();
            }
        });
}