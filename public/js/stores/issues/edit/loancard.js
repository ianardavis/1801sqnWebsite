function addLoancardOption(issue_id) {
    get({
        table: 'issue_loancard',
        query: [`issue_id=${issue_id}`]
    })
    .then(function ([line, options]) {
        let select = document.querySelector(`#issue_${issue_id}`);
        if (select) {
            if (line.status === 1) select.appendChild(new Option({text: 'Remove from loancard', value: '-2'}).e)
            // else if (line.status === 2) select.appendChild(new Option({text: 'Return', value: '5'}).e)
        };
    });
};