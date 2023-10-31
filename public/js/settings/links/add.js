function listLinkHeadings() {
    clear('link_heading_add')
    .then(link_heading_add => {
        get({
            table: 'resource_link_headings'
        })
        .then(function ([results, options]) {
            console.log(results);
        })
    })
};
window.addEventListener('load', function () {
    modalOnShow('link_add', listLinkHeadings);
    enable_button('link_add');
    addFormListener(
        'link_add',
        'POST',
        '/resource_links',
        {
            onComplete: [
                get_links,
                function () {modalHide('link_add')}
            ]
        }
    );
    addFormListener(
        'form_link_heading_add',
        'POST',
        '/resource_link_headings',
        {
            onComplete: listLinkHeadings
        }
    );
});