var cn  = {};

cn.Returned = function (returnedTo, stock) {
    this.returned_to    = returnedTo;
    this.return_stock   = stock;
    this._date_returned = Date.now();
};

cn.Issue = function (issue, user_id) {
    this.issued_to = issue.issued_to;
    this.user_id   = user_id;
    this._date     = issue._date;
    this._date_due = issue._date_due;
};
cn.IssueLine = function (issue_id, item, line) {
    this.issue_id    = issue_id;
    this._line       = line;
    this.nsn_id      = item.nsn_id;
    this.itemsize_id = item.itemsize_id;
    this._qty        = item.qty;
    this.issue_stock = item.stock_id;
};

cn.Receipt = function (supplier_id, user_id) {
    this.supplier_id = supplier_id;
    this._date       = Date.now();
    this.user_id     = user_id;
};
cn.ReceiptLine = function (stock_id, qty, receipt_id) {
    this.stock_id   = stock_id;
    this._qty       = qty;
    this.receipt_id = receipt_id;
};

cn.Order = function (ordered_for, ordered_by) {
    this.ordered_for = Number(ordered_for);
    this.user_id     = Number(ordered_by);
    this._date       = Date.now();
    this._complete   = 0;
};
cn.OrderLine = function (order_id, item) {
    this.order_id    = order_id;
    this.itemsize_id = item.itemsize_id;
    this._qty        = item.qty;
};;

cn.Request = function (requested_by, requested_for) {
    this.user_id       = requested_by;
    this.requested_for = requested_for;
    this._date         = Date.now();
};
cn.RequestLine = function (request_id, item) {
    this.request_id  = request_id;
    this.itemsize_id = item.itemsize_id;
    this._qty        = item.qty;
};
cn.RequestStatus = function (line, user_id) {
    this._status = line._status;
    this._action = line._action || null;
    this._date   = Date.now();
    this.user_id = user_id;
};

cn.Note = function (_table, _id, _note, _system, user_id) {
    this._table  = _table;
    this._id     = _id;
    this._note   = _note;
    this._system = _system;
    this._date   = Date.now();
    this.user_id = user_id;
};

cn.Demand = function (supplier_id, file, user_id) {
    this.supplier_id = supplier_id;
    this._date       = Date.now();
    this._complete   = 0;
    this._filename   = file;
    this.user_id     = user_id;
};
cn.DemandLine = function (demand_id, itemsize_id, qty) {
    this.demand_id   = demand_id;
    this.itemsize_id = itemsize_id;
    this._qty        = qty;
};

module.exports = cn;