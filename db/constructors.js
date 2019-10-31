var cn  = {},
    m   = require('./models');

cn.Returned = (returnedTo, location) => {
    this.returned_to = returnedTo;
    this.return_location = location;
    this._date_returned = Date.now();
};
cn.Issue = (issue, item, user_id) => {
    this.issued_to = issue.issued_to;
    this.stock_id = item.stock_id;
    this._qty = item.qty;
    this._date_issued = issue._date_issued;
    this._date_due = issue._date_due;
    this.issue_location = item.location_id;
    this.issued_by = user_id;
};
module.exports = cn;