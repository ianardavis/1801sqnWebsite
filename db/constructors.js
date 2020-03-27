var cn  = {};

function addYears (addYears = 0) {
    var newDate = new Date();
    var dd = String(newDate.getDate()).padStart(2, '0');
    var MM = String(newDate.getMonth() + 1).padStart(2, '0');
    var yyyy = newDate.getFullYear() + addYears;
    newDate = yyyy + '-' + MM + '-' + dd;
    return newDate;
};
cn.Returned = function (returnedTo, stock) {
    this.returned_to    = returnedTo;
    this.return_stock   = stock;
    this._date_returned = Date.now();
};
cn.Issue = function (issue, user_id) {
    this.issued_to = issue.issued_to;
    this.user_id   = user_id;
    this._date     = issue._date || Date.now();
    this._date_due = issue._date_due || addYears(7);
};
cn.IssueLine = function (issue_id, item, line) {
    this.issue_id  = issue_id;
    this._line     = line;
    this.nsn_id    = item.nsn_id    || null;
    this.serial_id = item.serial_id || null;
    this._qty      = item.qty       || 1;
    this.stock_id  = item.stock_id;
};

cn.Return = function (from, user_id) {
    this.from    = from;
    this.user_id = user_id;
    this._date   = Date.now();
};
cn.ReturnLine = function (return_id, line) {
    this.return_id = return_id;
    this.stock_id  = line.stock_id;
    this._qty      = line.qty;
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
cn.OrderLine = function (order_id, size_id, qty) {
    this.order_id = order_id;
    this.size_id  = size_id;
    this._qty     = qty;
};;

cn.Request = function (requested_by, requested_for) {
    this.user_id       = requested_by;
    this.requested_for = requested_for;
    this._date         = Date.now();
};
cn.RequestLine = function (request_id, size_id, qty) {
    this.request_id = request_id;
    this.size_id    = size_id;
    this._qty       = qty;
    this._status    = 'Pending';
};
cn.RequestStatus = function (line, user_id) {
    this._status = line._status;
    this._action = line._action || null;
    this._id     = line._id || null;
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

cn.Demand = function (supplier_id, user_id) {
    this.supplier_id = supplier_id;
    this._date       = Date.now();
    this._complete   = 0;
    this.user_id     = user_id;
};
cn.DemandLine = function (demand_id, size_id, qty) {
    this.demand_id = demand_id;
    this.size_id   = size_id;
    this._qty      = qty;
};

cn.Adjustment = function (stock_id, _type, qty, stock, user_id) {
    this.stock_id        = stock_id;
    this._type           = _type;
    this._qty            = qty;
    this._qty_difference = qty - stock;
    this._date           = Date.now();
    this.user_id         = user_id;
};

module.exports = cn;