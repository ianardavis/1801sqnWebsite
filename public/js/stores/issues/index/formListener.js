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
            }
        }
    );
    addFormListener(
        'lines_2',
        'PUT',
        '/stores/issues',
        {
            onComplete: function () {
                getIssues('0');
                getIssues('2');
                getIssues('3');
                getIssues('4');
            }
        }
    );
    addFormListener(
        'lines_3',
        'PUT',
        '/stores/issues',
        {
            onComplete: function () {
                getIssues('3');
                getIssues('4');
                getIssues('5');
            }
        }
    );
    addFormListener(
        'lines_4',
        'PUT',
        '/stores/issues',
        {
            onComplete: function () {
                getIssues('4');
                getIssues('5');
            }
        }
    );
});