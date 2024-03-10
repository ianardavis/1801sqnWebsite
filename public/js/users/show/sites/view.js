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
                addCell(row, (site.site_users.is_default ? {text: "Yes"} : {append: setDefaultSiteButton(site.site_id)}));
                if (!site.site_users.is_default) {
                    addFormListener(
                        `site_default_${site.site_id}`,
                        'PUT',
                        '/users/site/default',
                        {onComplete: getUserSites}
                    );
                };
            });
            if (typeof enableSetDefaultSiteBtns === 'function') enableSetDefaultSiteBtns();
        });
    });
};
function setDefaultSiteButton(_site_id) {
    const form = new Form({
        attributes: [{field: 'id', value: `form_site_default_${_site_id}`}],
        append: [
            new Button({
                noType: true,
                text: 'Set',
                colour: 'success',
                small: true,
                attributes: [{field: 'disabled', value: true}],
                classes: ['set_default_site_btn']
            }).e,
            new Hidden_Input({
                attributes: [
                    {field: 'name', value: 'site_id'},
                    {field: 'value', value: _site_id}
                ]
            }).e,
            new Hidden_Input({
                attributes: [
                    {field: 'name', value: 'user_id'},
                    {field: 'value', value: path[2]}
                ]
            }).e
        ]
    });
    return form.e;
};
window.addEventListener("load", function () {
    getUserSites();
});