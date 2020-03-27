var downloadWindow = null;
function download_file(file) {
    if (downloadWindow === null || downloadWindow.closed) {
        downloadWindow = window.open("/stores/download?file=" + file,
                                "Downloads",
                                "width=600,height=840,resizeable=no,location=no");
    } else downloadWindow.focus();
};