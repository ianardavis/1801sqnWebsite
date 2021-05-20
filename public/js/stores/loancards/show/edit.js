function setCompleteButton(status) {
    if (status === 1) enable_button('complete');
};
window.addEventListener( "load", function () {
    addFormListener(
        'complete',
        'PUT',
        `/loancards/${path[2]}`,
        {
            onComplete: [
                getLoancard,
                function () {if (typeof getLines === 'function') getLines()}
            ]
        }
    );
});