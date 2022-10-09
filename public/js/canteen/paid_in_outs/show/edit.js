function editBtnStatus(status) {
    if (status === 1) enable_button('paid_in_out_complete')
    else              disable_button('paid_in_out_complete');
};
window.addEventListener('load', function () {
    addFormListener(
        'paid_in_out_complete',
        'PUT',
        `/paid_in_outs/${path[2]}`,
        {
            onComplete: [
                getActions,
                getPaidInOut
            ]
        }
    )
});