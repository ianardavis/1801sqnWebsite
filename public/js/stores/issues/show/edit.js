function set_mark_as_options(status) {
    if (status >= 0 && status <= 5) {
        for (let i=0; i<=5 ; i++) {
            if (status !== i) enable_button(`mark_${i}`);
        };
        enable_button('mark_as');
    };
};
function check_issue_status([issue, options]) {
    return new Promise((resolve, reject) => {
        if ([1, 2].includes(Number(issue.status))) {
            resolve(issue);

        } else {
            reject(new Error('Not an editable status'));

        };
    });
};
window.addEventListener('load', function () {
    addFormListener(
        'mark_as',
        'PUT',
        `/issues/${path[2]}/mark`,
        {
            onComplete: [
                getIssue,
                getActions
            ]
        }
    );
});