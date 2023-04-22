function linkDeleteBtn(resource_link_id) {
    clear('link_delete')
    .then(span_delete => {
        span_delete.appendChild(
            new Delete_Button({
                descriptor: 'link',
                path:       `/resource_links/${resource_link_id}`,
                options: {
                    onComplete: [
                        getLinks,
                        function () {modalHide('link_view')}
                    ]
                }
            }).e
        );
    });
};
window.addEventListener('load', function () {
    modalOnShow('link_view', function (event) {linkDeleteBtn(event.relatedTarget.dataset.id)});
});