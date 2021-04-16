window.addEventListener( "load", function () {
    document.querySelector('#reload').addEventListener('click', setActions);
    addFormListener(
        'action',
        'PUT',
        '/stores/loancard_lines',
        {
            onComplete: [
                getLines,
                setActions,
                setLineButtons
            ]
        }
    );
});