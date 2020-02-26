var addWindow = null;
function openAddItem(callType) {
    if (addWindow === null || addWindow.closed) {
        addWindow = window.open("/stores/itemSearch?callType=" + callType,
                                "itemSearch",
                                "width=600,height=840,resizeable=no,location=no");
    } else addWindow.focus();
};