function removeID(id) {
    if (typeof(id) === 'string') document.querySelector('#' + id).remove();
    else id.remove();
};