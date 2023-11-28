function getGenders() {
    clear('tbl_genders')
    .then(tbl_genders => {
        get({
            table: 'genders'
        })
        .then(function ([results, options]) {
            results.genders.forEach(gender => {
                let row = tbl_genders.insertRow(-1);
                addCell(row, {text: gender.gender});
                addCell(row, {append:
                    new Modal_Button(
                        _search(),
                        'gender_view',
                        [{
                            field: 'id',
                            value: gender.gender_id
                        }]
                    ).e
                })
            });
            if (typeof gendersEditBtns === 'function') gendersEditBtns();
        });
    });
};
function viewGender(gender_id) {
    get({
        table: 'gender',
        where: {gender_id: gender_id}
    })
    .then(function([gender, options]) {
        setInnerText('gender_id',        gender.gender_id);
        setInnerText('gender_gender',    gender.gender);
        setInnerText('gender_user',      printUser(gender.user));
        setInnerText('gender_createdAt', printDate(gender.createdAt, true));
        setInnerText('gender_updatedAt', printDate(gender.updatedAt, true));
    });
};
window.addEventListener('load', function () {
    addListener('reload', getGenders);
    modalOnShow('gender_view', function (event) {viewGender(event.relatedTarget.dataset.id)});
    addSortListeners('genders', getGenders);
    getGenders();
});