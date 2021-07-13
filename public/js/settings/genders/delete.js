function genderDeleteBtn(gender_id) {
    clear('gender_delete')
    .then(span_delete => {
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
    });
};
window.addEventListener('load', function () {
    modalOnShow('gender_view', function (event) {genderDeleteBtn(event.relatedTarget.dataset.id)});
});