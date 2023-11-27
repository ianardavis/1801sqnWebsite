function linkEditBtn(resource_link_id) {
    set_attribute('btn_link_edit', 'data-resource_link_id', resource_link_id);
};
function linkHeadingEditBtn(resource_link_heading_id) {
    set_attribute('btn_link_heading_edit', 'data-resource_link_heading_id', resource_link_heading_id);
};

function viewLinkHeadingEdit(resource_link_heading_id) {
    modalHide('link_view');
    get({
        table: 'resource_link_heading',
        where: {resource_link_heading_id: resource_link_heading_id}
    })
    .then(function([heading, options]) {
        set_attribute('resource_link_heading_id_edit', 'value', heading.resource_link_heading_id);
        setValue('link_heading_edit', heading.heading);
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
        setValue('link_heading_edit', link.heading);
        setValue('link_title_edit',   link.title);
        setValue('link_text_edit',    link.text);
        setValue('link_href_edit',    link.href);
    });
};
window.addEventListener('load', function () {
    enableButton('link_heading_edit');
    enableButton('link_edit');

    addFormListener(
        'link_heading_edit',
        'PUT',
        '/resource_link_headings',
        {
            onComplete: [
                getHeadings,
                function () {modalHide('link_heading_edit')}
            ]
        }
    );
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
    modalOnShow('link_heading_view', function (event) {linkHeadingEditBtn(event.relatedTarget.dataset.id)});
    modalOnShow('link_view', function (event) {linkEditBtn(event.relatedTarget.dataset.id)});
});