function createSections() {
    clear('link_headings')
    .then(link_headings => {
        get({table: 'resource_link_headings'})
        .then(function ([result, options]) {
            if (result.resource_link_headings && result.resource_link_headings.length > 0){
                result.resource_link_headings.forEach(heading => {
                    link_headings.appendChild(new Link_Section(heading.value).e);
                    getLinks(heading.value)
                    .then(result => console.log(`${heading.value} loaded successfully`))
                    .catch(console.error);
                });
            };
        })
        .catch(console.error);
    });
};
function getLinks(heading) {
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
    createSections();
});