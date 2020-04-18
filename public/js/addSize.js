function addSize(callType, id, queries = '') {
    let addWindow = null;
    addWindow = window.open("/stores/itemSearch?callType=" + callType + '&id=' + id + '&' + queries,
                            "addItem" + callType + id,
                            "width=600,height=840,resizeable=no,location=no");
};