function listStatuses(selected = '') {
    get(
        function (statuses, options) {
            let selects = document.querySelectorAll('.statuses');
            selects.forEach(e => e.innerHTML = '');
            selects.forEach(e => {e.appendChild(new Option({selected: (selected === '')}).e)});
            statuses.forEach(status => {
                selects.forEach(e => {
                    e.appendChild(new Option({
                        value: status.status_id,
                        text: status._status,
                        selected: (selected === status.status_id)
                    }).e);
                });
            });
            statuses_loaded = true;
        },
        {
            db: 'users',
            table: 'statuses',
            query: []
        }
    );
};
window.addEventListener( "load", function () {
    document.querySelector(`#reload`).addEventListener("click", listStatuses);
});