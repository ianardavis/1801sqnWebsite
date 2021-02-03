function GendersEdit() {
    document.querySelectorAll('.genders').forEach(e => {
        get(
            function(gender, options) {
                e.appendChild(
                    new Link({
                        modal: 'gender_edit',
                        small: true,
                        type: 'edit',
                        data:  {field: 'gender_id', value: gender.gender_id}
                    }).e
                );
                e.removeAttribute('data-id');
                e.removeAttribute('class');
            },
            {
                table: 'gender',
                query: [`gender_id=${e.dataset.id}`]
            }
        );
    });
};
function loadGendersEdit() {
    let get_interval = window.setInterval(
        function () {
            if (genders_loaded === true) {
                GendersEdit();
                clearInterval(get_interval);
            };
        },
        200
    );
};
window.addEventListener('load', function () {
    addFormListener(
        'gender_edit',
        'PUT',
        '/stores/genders',
        {
            onComplete: [
                getGenders,
                loadGendersEdit,
                function () {$('#mdl_gender_edit').modal('hide')}
            ]
        }
    );
    $('#mdl_gender_edit').on('show.bs.modal', function (event) {
        get(
            function(gender, options) {
                set_attribute({id: 'gender_id_edit', attribute: 'value', value: gender.gender_id});
                set_value({id: '_gender_edit', value: gender._gender});
            },
            {
                table: 'gender',
                query: [`gender_id=${event.relatedTarget.dataset.gender_id}`]
            }
        );
    });
    document.querySelector('#reload').addEventListener('click', loadGendersEdit);
});