function addDetailDeleteBtns() {
    document.querySelectorAll('.file_details_delete').forEach(e => {
        get({
            table: 'file_detail',
            where: {file_detail_id: e.dataset.id}
        })
        .then(function ([detail, options]) {
            e.appendChild(
                new Delete_Button({
                    descriptor: 'detail',
                    path:       `/file_details/${detail.file_detail_id}`,
                    small:      true,
                    options: {
                        onComplete: function () {viewDetails(detail.file_id)}
                    }
                }).e
            );
        });
    });
};