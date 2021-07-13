function addDetailDeleteBtn(detail_id) {
    clear('detail_delete_btn')
    .then(detail_delete_btn => {
        get({
            table: 'detail',
            query: [`detail_id=${detail_id}`]
        })
        .then(function ([detail, options]) {
            detail_delete_btn.appendChild(
                new Delete_Button({
                    path: `/details/${detail.detail_id}`,
                    descriptor: 'detail',
                    options: {
                        onComplete: [
                            getDetails,
                            function () {modalHide('detail_view')}
                        ]
                    }
                }).e
            );
        });
    })
};
window.addEventListener('load', function () {
    modalOnShow('detail_view', function (event) {addDetailDeleteBtn(event.relatedTarget.dataset.id)});
});