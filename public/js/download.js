function download(table, id) {
    let showWindow = null;
    showWindow = window.open(`/stores/${table}/${id}/download`,
                             `${table}_download_${id}`,
                             'width=600,height=600,resizeable=no,location=no');
};