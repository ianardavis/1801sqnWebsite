function addLoancardOption(issue_id) {
    get({
        table: 'issue_loancard',
        query: [`issue_id=${issue_id}`]
    })
    .then(function ([line, options]) {
        let select = document.querySelector(`#issue_${issue_id}`);
        if (select && line.status === 1) select.appendChild(new Option({text: 'Remove from loancard', value: '-2'}).e);
    });
};
function loancardOptions() {
    clear(`issue_${this.dataset.id}_details`)
    .then(div_details => {
        if (this.value === '-2') {
            get({
                table: 'issue',
                query: [`issue_id=${this.dataset.id}`],
                index: this.dataset.index
            })
            .then(function ([issue, options]) {
                if (issue.status === 4) {
                    let stock_select = new Select({
                        small: true,
                        attributes: [
                            {field: 'name',     value: `issues[][${options.index}][stock_id]`},
                            {field: 'required', value: true}
                        ],
                        options: [{text: 'Return Location'}]
                    }).e;
                    div_details.appendChild(stock_select);
                    get({
                        table: 'stocks',
                        query: [`size_id=${issue.size_id}`],
                        index: options.index
                    })
                    .then(function ([stocks, options]) {
                        stocks.forEach(e => stock_select.appendChild(new Option({text: `${e.location.location} | Qty: ${e.qty}`, value: e.stock_id}).e));
                    });
                };
            });
        };
    });
};