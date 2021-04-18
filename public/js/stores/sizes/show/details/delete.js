function addDetailDeleteBtn(detail_id) {
    let detail_delete_btn = document.querySelector('#detail_delete_btn');
    if (detail_delete_btn) {
        detail_delete_btn.innerHTML = '';
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
                            function () {$('#mdl_detail_view').modal('hide')}
                        ]
                    }
                }).e
            );
        });
    };
};
window.addEventListener('load', function () {
    $('#mdl_detail_view').on('show.bs.modal', function (event) {addDetailDeleteBtn(event.relatedTarget.dataset.id)})
});