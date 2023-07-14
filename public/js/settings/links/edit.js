function linkEditBtn(resource_link_id) {
    clear('link_edit')
    .then(span_edit => {
        span_edit.appendChild(
            new Modal_Button(
                _edit(),
                'link_edit',
                [{field: 'id', value: resource_link_id}],
                false
            ).e
        );

    });
};
function viewLinkEdit(resource_link_id) {
    modalHide('link_view');
    get({
        table: 'resource_link',
        where: {resource_link_id: resource_link_id}
    })
    .then(function([link, options]) {
        set_attribute('resource_link_id_edit', 'value', link.resource_link_id);
        set_value('link_heading_edit', link.heading);
        set_value('link_title_edit', link.title);
        set_value('link_text_edit', link.text);
        set_value('link_href_edit', link.href);
    });
};
window.addEventListener('load', function () {
    addFormListener(
        'link_edit',
        'PUT',
        '/resource_links',
        {
            onComplete: [
                getLinks,
                function () {modalHide('link_edit')}
            ]
        }
    );
    modalOnShow('link_edit', function (event) {
        listHeadings({select: 'link_heading_edit'})
        .then(viewLinkEdit(event.relatedTarget.dataset.id));
    });
    modalOnShow('link_view', function (event) {linkEditBtn(event.relatedTarget.dataset.id)});
});