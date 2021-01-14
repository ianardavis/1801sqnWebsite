window.addEventListener('load', function () {
    addFormListener(
        'lines_1',
        'PUT',
        '/stores/issues',
        {
            onComplete: function () {
                getIssues('0');
                getIssues('1');
                getIssues('2');
                getIssues('3');
            }
        }
    );
});