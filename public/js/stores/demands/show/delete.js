window.addEventListener( "load", function () {
    addFormListener(
        'form_delete',
        'DELETE',
        `/stores/demands/${path[3]}`,
        {
            onComplete: [
                getDemand,
                function () {if (typeof getLines === 'function') getLines('demand')}
            ]
        }
    );
});