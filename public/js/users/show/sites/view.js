function getUserSites() {
    clear('tbl_sites')
    .then(tbl_sites => {
        get({
            location: `sites/user/${path[2]}`,
            table: 'sites',
            func: getUserSites
        })
        .then(function ([results, options]) {
            setCount('site', results.length);
            results.forEach(site => {
                let row = tbl_sites.insertRow(-1);
                addCell(row, {text: site.name});
                addCell(row, {text: (site.site_users.is_default ? "Yes" : "")});
            });
        });
    });
};
window.addEventListener("load", function () {
    getUserSites();
});