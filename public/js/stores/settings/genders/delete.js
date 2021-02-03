window.addEventListener('load', function () {
    $('#mdl_gender_view').on('show.bs.modal', function (event) {
        let span_delete = document.querySelector('#gender_delete');
        if (span_delete) {
            span_delete.innerHTML = '';
            span_delete.appendChild(
                new Delete_Button({
                    descriptor: 'gender',
                    path:       `/stores/genders/${event.relatedTarget.dataset.gender_id}`,
                    options: {
                        onComplete: [
                            getGenders,
                            function () {
                                if (typeof loadGendersEdit === 'function') loadGendersEdit();
                                $('#mdl_gender_view').modal('hide')
                            }
                        ]
                    }
                }).e
            );
        };
    });
});