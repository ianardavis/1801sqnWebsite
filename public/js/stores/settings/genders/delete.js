function genderDeleteBtn(gender_id) {
    let span_delete = document.querySelector('#gender_delete');
    if (span_delete) {
        span_delete.innerHTML = '';
        span_delete.appendChild(
            new Delete_Button({
                descriptor: 'gender',
                path:       `/genders/${gender_id}`,
                options: {
                    onComplete: [
                        getGenders,
                        function () {$('#mdl_gender_view').modal('hide')}
                    ]
                }
            }).e
        );
    };
};
window.addEventListener('load', function () {
    $('#mdl_gender_view').on('show.bs.modal', function (event) {genderDeleteBtn(event.relatedTarget.dataset.id)});
});