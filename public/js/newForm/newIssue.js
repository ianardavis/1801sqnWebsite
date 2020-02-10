document.querySelector('#issueDate').value = TodaysDate();
document.querySelector('#dueDate').value   = TodaysDate(7);

function TodaysDate(addYears = 0) {
    let today = new Date(),
        dd = String(today.getDate()).padStart(2, '0'),
        MM = String(today.getMonth() + 1).padStart(2, '0'), //January is 0
        yyyy = today.getFullYear() + addYears;
    today = yyyy + '-' + MM + '-' + dd;
    return today;
};
