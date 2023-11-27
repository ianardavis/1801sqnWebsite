function deleteBtnStatus(status) {
    if (status === 1) enableButton('paid_in_out_cancel')
    else              disableButton('paid_in_out_cancel');
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