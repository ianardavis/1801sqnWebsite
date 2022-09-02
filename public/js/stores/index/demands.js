window.addEventListener('load', function () {
    getCount('demands', 1, {text: 'Draft', colour: 'warning', float: 'start'});
    getCount('demands', 2, {text: 'Open',  colour: 'success', float: 'end'});
});