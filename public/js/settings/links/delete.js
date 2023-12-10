function linkDeleteBtn(resource_link_id) {
    setAttribute('form_link_delete', 'action', `/resource_links/${resource_link_id}`);
    // clear('link_delete')
    // .then(span_delete => {
    //     span_delete.appendChild(
    //         new Delete_Button({
    //             descriptor: 'link',
    //             path:       `/resource_links/${resource_link_id}`,
    //             options: {
    //                 onComplete: [
    //                     getLinks,
    //                     function () {modalHide('link_view')}
    //                 ]
    //             }
    //         }).e
    //     );
    // });
};
function linkHeadingDeleteBtn(resource_link_heading_id) {
    setAttribute('form_link_heading_delete', 'action', `/resource_link_headings/${resource_link_heading_id}`);
};
window.addEventListener('load', function () {
    enableButton('link_heading_delete');
    enableButton('link_delete');
    modalOnShow('link_heading_view', function (event) {linkHeadingDeleteBtn(event.relatedTarget.dataset.id)});
    modalOnShow('link_view', function (event) {linkDeleteBtn(event.relatedTarget.dataset.id)});
});