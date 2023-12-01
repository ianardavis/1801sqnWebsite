function createSections() {
    clear('link_headings')
    .then(link_headings => {
        get({table: 'resource_link_headings'})
        .then(function ([result, options]) {
            if (result.resource_link_headings && result.resource_link_headings.length > 0){
                result.resource_link_headings.forEach(heading => {
                    console.log(heading);
                    link_headings.appendChild(new Link_Section(heading.resource_link_heading_id, heading.heading).e);
                    getLinks(heading.resource_link_heading_id)
                    .then(result => console.log(`${heading.heading} loaded successfully`))
                    .catch(console.error);
                });
            };
        })
        .catch(console.error);
    });
};
function getLinks(resource_link_heading_id) {
    return new Promise((resolve, reject) => {
        clear(`collapse_${resource_link_heading_id}`)
        .then(row => {
            get({
                table: 'resource_links',
                where: {resource_link_heading_id: resource_link_heading_id}
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