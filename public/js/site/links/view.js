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
                    .catch(console.error);
                });
            };
        })
        .catch(console.error);
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
                result.resource_links.forEach(link => {
                    row.appendChild(new Card({
                        href:  link.href,
                        title: link.title,
                        text:  link.text || ''
                    }).e);
                });
            })
            .catch(console.error);
            resolve(true);
        })
        .catch(reject);
    });
};
window.addEventListener('load', function () {
    create_sections();
});