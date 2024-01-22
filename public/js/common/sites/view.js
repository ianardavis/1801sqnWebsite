function getSitesDD() {
    clear('dd_sites_list')
    .then(dd_sites_list => {
        get({location: 'sites/own'})
        .then(function ([sites, options]) {
            sites.forEach(site => {
                dd_sites_list.appendChild(new Site_Button(site).e);
                addFormListener(
                    `site_${site.site_id}`,
                    'PUT',
                    `/sites/switch/${site.site_id}`,
                    {onComplete: function() {location.reload()}}
                );
            });
        })
        .then(getCurrentSite);
    });
};
function getCurrentSite() {
    clear('dd_sites')
    .then(dd_sites => {
        get({location: 'site/current'})
        .then(function ([site, options]) {
            dd_sites.innerText = site.name;
        })
    })
};
window.addEventListener('load', function () {
    getSitesDD();
});

function Site_Button(site) {
    this.e = document.createElement('li');
    let form = document.createElement('form');
    form.setAttribute('id', `form_site_${site.site_id}`);
    let btn = document.createElement('input');
    btn.setAttribute('type', 'submit');
    btn.setAttribute('value', site.name);
    btn.classList.add('dropdown-item');
    form.appendChild(btn);
    this.e.appendChild(form);
};