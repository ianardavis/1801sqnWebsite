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
                        function () {modalHide('gender_view')}
                    ]
                }
            }).e
        );
    };
};
window.addEventListener('load', function () {
    modalOnShow('gender_view', function (event) {genderDeleteBtn(event.relatedTarget.dataset.id)});
});