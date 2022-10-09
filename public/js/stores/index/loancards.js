window.addEventListener('load', function () {
    getCount('loancards', 1, {text: 'Draft', colour: 'danger',  float: 'start'});
    getCount('loancards', 2, {text: 'Open',  colour: 'success', float: 'end'});
});