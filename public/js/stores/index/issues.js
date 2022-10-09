window.addEventListener('load', function () {
    getCount('issues', 1, {text: 'Requested', colour: 'danger',  float: 'start'});
    getCount('issues', 2, {text: 'Approved',  colour: 'warning', float: 'end'});
});