function create_sections() {
    clear('link_headings')
    .then(link_headings => {
        get({
            table: 'settings',
            where: {name: 'link_heading'}
        })
        .then(function ([result, options]) {
            result.settings.forEach(setting => {
                link_headings.appendChild(new Link_Section(setting.value).e);
                get_links(settings.value)
                .then(result => console.log(`${setting.value} loaded successfully`))
                .catch(err => console.error(err));
            });
        });
    });
};
function get_links(heading) {
    return new Promise((resolve, reject) => {
        clear(`row${heading}`)
        .then(row => {
            get({
                table: 'resource_links',
                where: {heading: heading}
            })
            .then(function ([result, options]) {
                result.forEach(link => {
                    row.appendChild(new Card({
                        href:  link.href,
                        title: link.title,
                        text:  link.text || ''
                    }).e)
                });
            });
            resolve(true);
        })
        .catch(reject);
    });
};
window.addEventListener('load', function () {
    create_sections();
    // get_links('Links');
    // get_links('Videos');
    // get_links('Publications');
    // get_links('Forms');
});