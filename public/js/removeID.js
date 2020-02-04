function removeID(id) {
    console.log(typeof(id));
    if (typeof(id) === 'string') document.querySelector('#' + id).remove();
    else id.remove();
};