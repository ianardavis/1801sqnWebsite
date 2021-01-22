window.addEventListener( "load", function () {
    document.querySelector('#reload').addEventListener('click', setActions);
    addFormListener(
        'form_action',
        'PUT',
        `/stores/demand_lines/${path[3]}`,
        {
            onComplete: [
                getLines,
                setActions,
                function () {setLineButtons('demand')}
            ]
        }
    );
});