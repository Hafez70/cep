var contentTree = {};
var comPositionTree = {};
var selectedNavMenu = {};
var textPath = 'assets/files/Texts';
var importProjPath = '';
var categoryIndex = 0;

// window.addEventListener('beforeunload', function (e) {
//     localStorage.setItem("first_time","0");
// });

(function () {
    'use strict';
    var path, slash;
    path = location.href;
    if (getOS() == "MAC") {
        var x = path.indexOf("TextsComponent.html");
        path = path.substring(0, x) + textPath;
    }
    if (getOS() == "WIN") {
        slash = "/";
        var x = path.indexOf("TextsComponent.html");
        path = path.substring(8, x) + textPath;
    }


    var urlObject = new URL(document.location.href);
    var params = urlObject.search;

    categoryIndex = getParameterByName("catIndex");

    generatePreview(path);
}());

function generatePreview(myPath) {
    const csInterface = new CSInterface();
    csInterface.evalScript('getMainDirectories("' + myPath + '",' + categoryIndex + ')', function (res) {
        contentTree = JSON.parse(res);
        $('#btnOffCanvas').hide();
        if (contentTree.length > 0) {
            generateSliderCardsView();
        }
    });
}

function generateSliderCardsView() {
    selectedNavMenu = contentTree[0].subMenuNames;

    //$('#btnOffCanvas').show();
    // $('#sideMenuItems').empty();
    // $('#sideMenuItems').append('<div class="offcanvas offcanvas-start w-auto" tabindex="-1" id="offcanvasWithBackdrop" aria-labelledby="offcanvasWithBackdropLabel">\n' +
    //     '            <div class="offcanvas-header">\n' +
    //     '                <h5 class="offcanvas-title text-dark" id="offcanvasWithBackdropLabel">' + contentTree[0].menuName + '</h5>\n' +
    //     '                <button type="button"  id="offcanvasBtnClose" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>\n' +
    //     '            </div>\n' +
    //     '            <div class="offcanvas-body">\n' +
    //     '                <ul class="nav nav-pills flex-column mb-auto mb-1 align-items-start" id="offcanvasMenu">\n' +
    //     '                </ul>\n' +
    //     '            </div>\n' +
    //     '        </div>');


    $('.card-carousel').empty();
    selectedNavMenu.map((val, indx, arr) => {
        var activeClass = 'active';
        if(indx == 1){
            activeClass = 'next'
        }else
        {
            activeClass = '';
        }
        $('.card-carousel').append('<div class="my-card  justify-content-center ' + activeClass+'>\n' +
            '      <div class="col-lg-4 col-md-6" onclick="generateContentView('+indx+')">\n' +
            '          <div class="card-body bg-dark h-100 m-0 p-3 multi-slider-small-Items background-folder-card">\n' +
            '               <div class="position-relative bg-dark multi-slider-small-Items-image-container ">\n' +
            '                   <img src="'+val.demo+'" class="card-img-top w-100 ">\n' +
            '                        <div class="w-100 h-auto description-over-image bg-dark">\n' +
            '                            <p class="text-light p-0 m-0 w-100 text-center">'+val.subMenuName+'</p>\n' +
            '                        </div>\n' +
            '                </div>\n' +
            '           </div>\n' +
            '       </div>\n' +
            ' </div>');
    });

    if (selectedNavMenu.length > 0) {
        settingSlider(selectedNavMenu.length);
        generateContentView(0);
    }
}

function settingSlider(cardCount){
    var num = cardCount;
    var even = num / 2;
    var odd = (num + 1) / 2;

    //if (num % 2 == 0) {
        $('.my-card:first-child').addClass('active');
    //     $('.my-card:nth-child(' + even + ')').prev().addClass('prev');
         $('.my-card:first-child').next().addClass('next');
    // } else {
    //     $('.my-card:nth-child(' + odd + ')').addClass('active');
    //     $('.my-card:nth-child(' + odd + ')').prev().addClass('prev');
    //     $('.my-card:nth-child(' + odd + ')').next().addClass('next');
    // }

    $('.my-card').on({
        click: function() {
            var slide = $('div.my-card.justify-content-center.active').width();

            if ($(this).hasClass('next')) {
                $('.card-carousel').stop(false, true).animate({left: '-=' + slide}, 250, "swing", function () {
                    $('.card-carousel').css("left", "0px");
                });
            } else if ($(this).hasClass('prev')) {
                $('.card-carousel').stop(false, true).animate({left: '+=' + slide}, 250, "swing", function () {
                    $('.card-carousel').css("left", "0px");
                });
            }

            $(this).removeClass('prev next');
            $(this).siblings().removeClass('prev active next');

            $(this).addClass('active');
            $(this).prev().addClass('prev');
            $(this).next().addClass('next');
        }
    });

}

function generateContentView(subMenIndex) {

    $('#offcanvasBtnClose').click();
    $('#contentTitle').text(selectedNavMenu[subMenIndex].subMenuName);
    $('.card-img-top').each(function (e) {
        $(e).unbind('mouseenter mouseleave');
    });
    $('#gridSystem').empty();

    selectedNavMenu[subMenIndex].subFiles.map((val, indx, arr) => {
        $('#gridSystem').append('<div class="card col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2 m-1 p-0" ' +
            '                       onclick="importFile(\'' + val.projectPath + '\',\'' + val.settingPath + '\')" ' +
            '                       style="max-height: 150px; max-width: 200px; min-width: 150px;">\n' +
            '      <div class="card-body bg-dark h-100 m-0 p-1">\n' +
            '           <div class="card-img-top bg-dark h-75">\n' +
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


function importFile(projPath, settingPath) {
    importProjPath = projPath;
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
        $("#startTimeSpecificValue").prop("disabled", false);
    } else {
        $("#startTimeSwitchLabel").text("start from current CTI");
        $("#startTimeSpecificValue")[0].value = 0;
        $("#startTimeSpecificValue").prop("disabled", true);
    }
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

function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
