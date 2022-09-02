window.addEventListener('load', function () {
	getCount('orders', 1, {text: 'Placed',   colour: 'danger',  float: 'start'});
	getCount('orders', 2, {text: 'Demanded', colour: 'warning', float: 'end'});
});