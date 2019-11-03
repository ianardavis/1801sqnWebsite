var cn  = {};

function Returned (returnedTo, location) {
    this.returned_to = returnedTo;
    this.return_location = location;
    this._date_returned = Date.now();
};
cn.Returned = Returned;

function Issue (issue, item, user_id) {
    this.issued_to = issue.issued_to;
    this.stock_id = item.stock_id;
    this._qty = item.qty;
    this._date = issue._date;
    this._date_due = issue._date_due;
    this.issue_location = item.location_id;
    this.issued_by = user_id;
};
cn.Issue = Issue;

function Order (ordered_for, item, user_id) {
    this.ordered_for = ordered_for;
    this.stock_id = item.stock_id;
    this._qty = item.qty;
    this._date = Date.now();
    this.ordered_by = user_id;
};
cn.Order = Order;

function Request (requested_for, item, user_id) {
    this.requested_for = requested_for;
    this.stock_id = item.stock_id;
    this._qty = item.qty;
    this._date = Date.now();
    this._status = 'Pending';
    this.requested_by = user_id;
};
cn.Request = Request;
module.exports = cn;