var addWindow = null;
function openAddItem(callType) {
    if (addWindow === null || addWindow.closed) {
        addWindow = window.open("/stores/itemSearch?c=" + callType,
                                "itemSearch",
                                "width=600,height=840,resizeable=no,location=no");
    } else addWindow.focus();
};

///////FOR RECEIPT
// function openAddWindow() {
//     if (addWindow == null || addWindow.closed) {
//         addWindow = window.open("/stores/itemSearch?c=receipt&s=<%= supplier.supplier_id %>",
//                                 "itemSearch",
//                                 "width=600,height=840,resizeable=no,location=no");
//     } else {
//         addWindow.focus();
//     };