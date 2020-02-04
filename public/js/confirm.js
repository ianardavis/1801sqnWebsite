var Tags = document.querySelectorAll('.confirm');
var confirmIt = function (e) {
    if (!confirm('Are you sure?')) e.preventDefault();
};
for (var i = 0, l = Tags.length; i < l; i++) {
    Tags[i].addEventListener('click', confirmIt, false);
};