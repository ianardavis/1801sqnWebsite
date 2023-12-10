function linkDeleteBtn(event) {
    setAttribute('link_id_delete', 'value', event.relatedTarget.dataset.id);
};
function linkHeadingDeleteBtn(event) {
    setAttribute('link_heading_id_delete', 'value', event.relatedTarget.dataset.id);
};
window.addEventListener('load', function () {
    addFormListener(
        'link_heading_delete',
        'DELETE',
        '/resource_link_headings',
        {
            onComplete: [
                getHeadings,
                function () {modalHide('link_heading_view')}
            ]
        }
    );
    addFormListener(
        'link_delete',
        'DELETE',
        '/resource_link_headings',
        {
            onComplete: [
                getLinks,
                function () {modalHide('link_view')}
            ]
        }
    );
    enableButton('link_heading_delete');
    enableButton('link_delete');
    modalOnShow('link_view',         linkDeleteBtn);
    modalOnShow('link_heading_view', linkHeadingDeleteBtn);
});