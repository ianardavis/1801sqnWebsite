window.addEventListener('load', function () {
    listHeadings('link_heading_add');
    enable_button('link_add');
    addFormListener(
        'link_add',
        'POST',
        '/links',
        {
            onComplete: [
                getLinks,
                function () {modalHide('link_add')}
            ]
        }
    );
});