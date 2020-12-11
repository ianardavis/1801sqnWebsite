function getSizeEdit() {
    get(
        function (size, options) {
            for (let [id, value] of Object.entries(size)) {
                try {
                    let element = document.querySelector(`#${id}_edit`);
                    if (element) element.value = value;
                } catch (error) {console.log(error)};
            };
        },
        {
            table: 'size',
            query: [`size_id=${path[3]}`]
        }
    );
};
window.addEventListener('load', function () {
    addFormListener(
        'form_edit_size',
        'PUT',
        `/stores/sizes/${path[3]}`,
        {
            onComplete: [
                getSize,
                getSizeEdit
            ]
        }
    );
});
document.querySelector('#reload').addEventListener('click', getSizeEdit);