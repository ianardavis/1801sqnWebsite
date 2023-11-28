function getFileDetailNames() {
    clear('file_detail_names')
    .then(list => {
        get({
            table: 'settings',
            where: {name: 'file_detail'}
        })
        .then(function ([detail_names, options]) {
            detail_names.forEach(detail => {
                list.appendChild(new Option({value: detail.value}).e);
            });
        });
    });
};
window.addEventListener('load', function () {
    enableButton('file_add');
    addFormListener(
        'file_detail_add',
        'POST',
        '/file_details',
        {
            onComplete: function () {
                let file_id = document.querySelector('#file_id');
                if (file_id) viewDetails(file_id.innerText);
                setValue('file_detail_name_add');
                setValue('file_detail_value_add');
            }
        }
    );
    modalOnShow('file_view', function (event) {
        getFileDetailNames();
        setAttribute('file_id_detail_add', 'value', event.relatedTarget.dataset.id);
    });
});