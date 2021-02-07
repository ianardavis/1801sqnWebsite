function getGenders() {
    let tbl_genders = document.querySelector('#tbl_genders');
    if (tbl_genders) {
        tbl_genders.innerHTML = '';
        get(
            {
                table: 'genders',
                query: []
            },
            function (genders, options) {
                genders.forEach(gender => {
                    let row = tbl_genders.insertRow(-1);
                    add_cell(row, {text: gender._gender});
                    add_cell(row, {append:
                        new Link({
                            modal: 'gender_view',
                            data: {
                                field: 'id',
                                value: gender.gender_id
                            },
                            small: true
                        }).e
                    })
                });
                if (typeof gendersEditBtns === 'function') gendersEditBtns();
            }
        );
    };
};
function viewGender(gender_id) {
    get(
        {
            table: 'gender',
            query: [`gender_id=${gender_id}`]
        },
        function(gender, options) {
            set_innerText({id: 'gender_gender',    text: gender._gender});
            set_innerText({id: 'gender_user',      text: print_user(gender.user)});
            set_innerText({id: 'gender_createdAt', text: print_date(gender.createdAt, true)});
            set_innerText({id: 'gender_updatedAt', text: print_date(gender.updatedAt, true)});
        }
    );
};
window.addEventListener('load', function () {
    $('#mdl_gender_view').on('show.bs.modal', function (event) {viewGender(event.relatedTarget.dataset.id)});
    document.querySelector('#reload').addEventListener('click', getGenders);
});