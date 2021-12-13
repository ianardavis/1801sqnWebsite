function getGenders() {
    clear('tbl_genders')
    .then(tbl_genders => {
        get({
            table: 'genders',
            ...sort_query(tbl_genders)
        })
        .then(function ([genders, options]) {
            genders.forEach(gender => {
                let row = tbl_genders.insertRow(-1);
                add_cell(row, {text: gender.gender});
                add_cell(row, {append:
                    new Button({
                        modal: 'gender_view',
                        data: [{
                            field: 'id',
                            value: gender.gender_id
                        }],
                        small: true
                    }).e
                })
            });
            if (typeof gendersEditBtns === 'function') gendersEditBtns();
        });
    });
};
function viewGender(gender_id) {
    get({
        table: 'gender',
        query: [`"gender_id":"${gender_id}"`]
    })
    .then(function([gender, options]) {
        set_innerText('gender_id',        gender.gender_id);
        set_innerText('gender_gender',    gender.gender);
        set_innerText('gender_user',      print_user(gender.user));
        set_innerText('gender_createdAt', print_date(gender.createdAt, true));
        set_innerText('gender_updatedAt', print_date(gender.updatedAt, true));
    });
};
addReloadListener(getGenders)
window.addEventListener('load', function () {
    modalOnShow('gender_view', function (event) {viewGender(event.relatedTarget.dataset.id)});
});