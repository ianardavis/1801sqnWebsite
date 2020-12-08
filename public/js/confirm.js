var deleteTags = document.querySelectorAll('.confirm');
var confirmIt = e => {
    if (!confirm('Are you sure?')) e.preventDefault();
};
for (var i = 0, l = deleteTags.length; i < l; i++) {
    deleteTags[i].addEventListener('click', confirmIt, false);
};