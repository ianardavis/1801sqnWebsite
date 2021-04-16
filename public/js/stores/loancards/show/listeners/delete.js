window.addEventListener( "load", function () {
    remove_attribute({id: 'btn_delete', attribute: 'disabled'});
    addFormListener(
        'delete',
        'DELETE',
        `/stores/loancards/${path[2]}`,
        {
            onComplete: [
                getLoancard,
                function () {if (typeof getLines === 'function') getLines()}
            ]
        }
    );
});