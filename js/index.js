var contentTree = {};
var mainPageItems = {};
var textPath = 'assets/files/Texts';

(function () {
    'use strict';
    var path, slash;
    path = location.href;
    if (getOS() == "MAC") {
        path = path.substring(0, path.length - 10) + textPath;
    }
    if (getOS() == "WIN") {
        slash = "/";
        path = path.substring(8, path.length - 10) + textPath;
    }

    getFilesTree(path);
}());

function getFilesTree(myPath) {
    const csInterface = new CSInterface();
    csInterface.evalScript('getCategiries("' + myPath + '")', function (res) {
        contentTree = JSON.parse(res);
        if (contentTree.length > 0) {
            generateSideBar();
        }
    });
}

function generateSideBar() {
    $('#gridSystem').empty();
    contentTree.map((val, indx, arr) => {
        // $('#gridSystem').append('<div class="col-xxsm-12 col-xsm-6 col-6 col-sm-4 col-md-3 col-lg-2 col-xl-2 p-1 ">\n' +
        //     '            <div class="card-body bg-dark h-100 m-0 p-3 small-card background-folder-card">\n' +
        //     '                <a href="./TextsComponent.html?catIndex=' + val.CatIndex + '">\n' +
        //     '                    <div class="position-relative bg-dark small-card-image-container ">\n' +
        //     '                        <img id="imgText" src="'+ val.demo +'" class="card-img-top w-100 ">\n' +
        //     '                        <div class="w-100 h-auto description-over-image bg-dark">\n' +
        //     '                            <p class="text-light p-0 m-0 w-100 text-center">'+val.CatName+'</p>\n' +
        //     '                        </div>\n' +
        //     '                    </div>\n' +
        //     '                </a>\n' +
        //     '            </div>\n' +
        //     '        </div>'
        // )
    });
}

function generateContainer() {
    //$('#gridSystem').empty();
    contentTree.map((val, indx, arr) => {
        // $('#gridSystem').append('<div class="col-xxsm-12 col-xsm-6 col-6 col-sm-4 col-md-3 col-lg-2 col-xl-2 p-1 ">\n' +
        //     '            <div class="card-body bg-dark h-100 m-0 p-3 small-card background-folder-card">\n' +
        //     '                <a href="./TextsComponent.html?catIndex=' + val.CatIndex + '">\n' +
        //     '                    <div class="position-relative bg-dark small-card-image-container ">\n' +
        //     '                        <img id="imgText" src="'+ val.demo +'" class="card-img-top w-100 ">\n' +
        //     '                        <div class="w-100 h-auto description-over-image bg-dark">\n' +
        //     '                            <p class="text-light p-0 m-0 w-100 text-center">'+val.CatName+'</p>\n' +
        //     '                        </div>\n' +
        //     '                    </div>\n' +
        //     '                </a>\n' +
        //     '            </div>\n' +
        //     '        </div>'
        // )
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
