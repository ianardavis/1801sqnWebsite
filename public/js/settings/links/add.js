window.addEventListener('load', function () {
    modalOnShow('link_add', function (event) {listHeadings({select: 'link_heading_add'})});
    enable_button('link_add');
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
});