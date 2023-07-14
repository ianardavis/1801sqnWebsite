function create_sections() {
    clear('link_headings')
    .then(link_headings => {
        get({table: 'resource_link_headings'})
        .then(function ([headings, options]) {
            if (headings && headings.length > 0){
                headings.forEach(heading => {
                    link_headings.appendChild(new Link_Section(heading.value).e);
                    get_links(heading.value)
                    .then(result => console.log(`${heading.value} loaded successfully`))
                    .catch(err => console.error(err));
                });
            };
        })
        .catch(console.log);
    });
};
function get_links(heading) {
    return new Promise((resolve, reject) => {
        clear(`collapse${heading}`)
        .then(row => {
            get({
                table: 'resource_links',
                where: {heading: heading}
            })
            .then(function ([result, options]) {
                console.log(result);
                result.forEach(link => {
                    row.appendChild(new Card({
                        href:  link.href,
                        title: link.title,
                        text:  link.text || ''
                    }).e)
                });
            })
            .catch(console.log);
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