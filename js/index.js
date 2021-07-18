var contentTree = {};
var importProjPath = '';
var textPath = 'assets/packages';

(function () {
    'use strict';
    var path, slash;
    path = location.href;
    if (getOS() == "MAC") {
        var x = path.indexOf("index.html");
        path = path.substring(0, x) + textPath;
    }
    if (getOS() == "WIN") {
        var x = path.indexOf("index.html");
        path = path.substring(8, x) + textPath;
    }

    getFilesTree(path);
}());

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
                '           <a href="#" class="px-0 align-self-end text-light"> <spanclass="d-inline">' + ch_val.subMenuName + '</span>\n' +
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

}


function generateContentView(menuIndex, subMenIndex) {


    // $('#contentTitle').text(selectedNavMenu[subMenIndex].subMenuName);
    // $('.card-img-top').each(function (e) {
    //     $(e).unbind('mouseenter mouseleave');
    // });
    $('#gridSystem').empty();

    contentTree[menuIndex].subMenuNames[subMenIndex].subFiles.map((val, indx, arr) => {
        $('#gridSystem').append('<div class="border-dark border-5 card col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2 m-0 p-0" ' +
            '                       onclick="importFile(' + menuIndex + ',' + subMenIndex + ',' + indx + ')" ' +
            '                       style="max-height: 150px; max-width: 200px; min-width: 150px;">\n' +
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
                comPositionTree = JSON.parse(res);

                if (comPositionTree.error) {
                    return;
                }
                $('#compSelect').empty();
                $('#compSelect').append('<option value="0" selected>Active Comp</option>');
                comPositionTree.map((val, indx, arr) => {
                    $('#compSelect').append('<option value="' + val.compItemIndex + '">' + val.compName + '</option>');
                });

                compSelected(0);

                $('#stickySettingModal').modal('show');
            }
        });
    }
}

function importSticky() {
    var startlayerSelectvalue = $('#startlayerSelect').find("option:selected").val();
    var endlayerSelectvalue = $('#endlayerSelect').find("option:selected").val();
    var compSelectvalue = $('#compSelect').find("option:selected").val();
    var fromCti = (!$('#startTimeSwitch')[0].checked);
    var specificTime = $('#startTimeSpecificValue')[0].value;
    var stickyText = $('#stickyTextSourceInput').val();
    if (compSelectvalue && startlayerSelectvalue !== 0 && endlayerSelectvalue !== 0) {
        const csInterface = new CSInterface();
        const strEval = 'importStickyTextWithBeamEffect("' + importProjPath + '",'
            + compSelectvalue + ','
            + startlayerSelectvalue + ','
            + endlayerSelectvalue + ',"'
            + stickyText + '",'
            + fromCti + ','
            + specificTime + ')';
        csInterface.evalScript(strEval
            , function (res) {
                if (res !== "") {
                    $('#stickySettingModal').modal('hide');
                }
            });
    } else {

    }

}

function startTimeChangestickyImportFomr(value) {
    if (value === true) {
        $("#startTimeSwitchLabel").text("specific Seconds (accept decimal)");
        $("#startTimeSpecificValue").prop("disabled", false).parent().css("opacity", "1");
        $("#endTimeSpecificValue").prop("disabled", false).parent().css("opacity", "1");
    } else {
        $("#startTimeSwitchLabel").text("start from current CTI");
        $("#startTimeSpecificValue")[0].value = 0;
        $("#endTimeSpecificValue")[0].value = 0;
        $("#endTimeSpecificValue").prop("disabled", true).parent().css("opacity", "0.2");
        $("#startTimeSpecificValue").prop("disabled", true).parent().css("opacity", "0.2");
    }
}

function compSelected(this_val) {
    const csInterface = new CSInterface();
    csInterface.evalScript('getAllLayersInComp(' + this_val + ')', function (res) {
        if (res !== "") {
            var layers = JSON.parse(res);

            if (layers.error) {
                return;
            }
            $('#startlayerSelect').empty();
            $('#startlayerSelect').append('<option value="0" selected>Select "Start point" layer</option>');
            layers.map((val, indx, arr) => {
                $('#startlayerSelect').append('<option value="' + val.layerIndex + '">' + val.layerName + '</option>');
            });

            $('#endlayerSelect').empty();
            $('#endlayerSelect').append('<option value="0" selected>Select "End point" layer</option>');
            layers.map((val, indx, arr) => {
                $('#endlayerSelect').append('<option value="' + val.layerIndex + '">' + val.layerName + '</option>');
            });
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
