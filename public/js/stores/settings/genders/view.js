let genders_loaded = false;
function getGenders() {
    genders_loaded = false;
    let tbl_genders = document.querySelector('#tbl_genders');
    if (tbl_genders) {
        tbl_genders.innerHTML = '';
        get(
            function (genders, options) {
                genders.forEach(gender => {
                    let row = tbl_genders.insertRow(-1);
                    add_cell(row, {text: gender._gender});
                    add_cell(row, {classes: ['genders'], data: {field: 'id', value: gender.gender_id}});
                    add_cell(row, {append:
                        new Link({
                            modal: 'gender_view',
                            data: {
                                field: 'gender_id',
                                value: gender.gender_id
                            },
                            small: true
                        }).e
                    })
                });
                genders_loaded = true;
            },
            {
                table: 'genders',
                query: []
            }
        );
    };
};
window.addEventListener('load', function () {
    $('#mdl_gender_view').on('show.bs.modal', function (event) {
        get(
            function(gender, options) {
                set_innerText({id: '_gender',          text: gender._gender});
                set_innerText({id: 'user_gender',      text: print_user(gender.user)});
                set_innerText({id: 'createdAt_gender', text: print_date(gender.createdAt, true)});
                set_innerText({id: 'updatedAt_gender', text: print_date(gender.updatedAt, true)});
            },
            {
                table: 'gender',
                query: [`gender_id=${event.relatedTarget.dataset.gender_id}`]
            }
        );
    });
    document.querySelector('#reload').addEventListener('click', getGenders);
});