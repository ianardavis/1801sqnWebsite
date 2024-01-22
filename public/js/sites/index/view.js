function getSites() {
    clear('tbl_sites')
    .then(tbl_sites => {
        function addLine(site) {
            let row = tbl_sites.insertRow(-1);
            addCell(row, {text: site.name});
            addCell(row, {text: (site.is_admin ? 'Yes' : '')});
            addCell(row, {append: new Link(`/items/${site.site_id}`).e});
        };
        get({
            table: 'sites',
            like: filterSite(),
            func: getSites
        })
        .then(function ([result, options]) {
            result.sites.forEach(addLine);
        });
    });
};
window.addEventListener('load', function () {
    addListener('reload', getSites);
    addListener('filter_site_name', getSites, 'input');
    addSortListeners('sites', getSites);
    getSites();
});