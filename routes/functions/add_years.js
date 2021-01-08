module.exports = function(addYears = 0) {
    var newDate = new Date();
    var dd = String(newDate.getDate()).padStart(2, '0');
    var MM = String(newDate.getMonth() + 1).padStart(2, '0');
    var yyyy = newDate.getFullYear() + addYears;
    newDate = yyyy + '-' + MM + '-' + dd;
    return newDate;
};