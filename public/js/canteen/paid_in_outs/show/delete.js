function deleteBtnStatus(status) {
    if (status === 1) enable_button('paid_in_out_cancel')
    else              disable_button('paid_in_out_cancel');
};
window.addEventListener('load', function () {
    addFormListener(
        'paid_in_out_cancel',
        'DELETE',
        `/paid_in_outs/${path[2]}`,
        {
            onComplete: [
                getActions,
                getPaidInOut
            ]
        }
    )
});