function listLinkHeadings() {
    clear('link_heading_add')
    .then(link_heading_add => {
        get({
            table: 'resource_link_headings'
        })
        .then(function ([results, options]) {
            results.resource_link_headings.forEach(heading => {
                link_heading_add.appendChild(
                    new Option({
                        text:  heading.heading,
                        value: heading.resource_link_heading_id
                    }).e
                )
            });
        });
    })
};
window.addEventListener('load', function () {
    modalOnShow('link_add', listLinkHeadings);
    modalOnShow('link_heading_add', () => setValue('link_heading_heading_add'));
    enableButton('link_heading_add');
    enableButton('link_add');
    addFormListener(
        'link_add',
        'POST',
        '/resource_links',
        {
            onComplete: [
                getLinks,
                function () {modalHide('link_add')}
            ]
        }
    );
    addFormListener(
        'link_heading_add',
        'POST',
        '/resource_link_headings',
        {
            onComplete: [
                listLinkHeadings,
                getHeadings,
                function () {modalHide('link_heading_add')}
            ]
        }
    );
});