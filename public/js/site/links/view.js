function get_links(heading) {
    clear(`row${heading}`)
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
                }).e)
            });
        });
    });
};
window.addEventListener('load', function () {
    get_links('Links');
    get_links('Videos');
    get_links('Publications');
    get_links('Forms');
});