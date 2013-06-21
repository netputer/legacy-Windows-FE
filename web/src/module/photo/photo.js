/**
 * Photo Module
 *
 * @author jingfeng@wandoujia.com
 */
wonder.addModule('photo', function (W) {
    W.namespace('wonder.photo');

    var locale = i18n.photo;
    var currentPage = null;
    var currentType = W.photo.PhotoCollection.type.PHONE;
    var currentContent = null;
    var phoneCheckedBoxDelegate = null;
    var libraryCheckedBoxDelegate = null;
    var photoCollection = new W.photo.PhotoCollection ();
    var player = null;
    var toolbar = null;
    var phoneContent = null;
    var libraryContent = null;
    var maxCountInOnePage = 60;
    var setToolbarStatus = null;
    var progressBar = new W.ui.ProgressMonitor ();
    var loadingProcess = new W.ui.status.Process ();
    var loadingView = new W.ui.status.ProcessView (loadingProcess);
    var progressWin = new W.ui.Progress ();
    var phoneUnbuildThread = [];
    var libraryUnbuildThread = [];
    var photoSize = {
        width : 136,
        height : 100
    };
    var photoOuterSize = {
        width : 154,
        height : 118
    };
    var threadTitleHeight = 34;
    var photoTipHeight = 24;
    var contentWrapper;
    var globalCheckboxStatus = false;
    var photoInfo;

    W.photo.loadingProcess = loadingProcess;
    W.photo.progressBar = progressBar;
    W.photo.progressWin = progressWin;
    W.photo.photoCollection = photoCollection;

});
wonder.useModule('photo');
