var issueDate = document.querySelector('#issueDate'),
    dueDate   = document.querySelector('#dueDate'),
    addWindow = null;

issueDate.value = TodaysDate();
dueDate.value   = TodaysDate(7);

function TodaysDate(addYears = 0) {
    let today = new Date(),
        dd = String(today.getDate()).padStart(2, '0'),
        MM = String(today.getMonth() + 1).padStart(2, '0'), //January is 0
        yyyy = today.getFullYear() + addYears;
    today = yyyy + '-' + MM + '-' + dd;
    return today;
};

function addSize(item) {
    let selectedList = document.querySelector('#selectedItems'),
        existingID   = document.querySelector('#id-' + item.itemsize_id);
    if (typeof(existingID) === 'undefined' || existingID !== null) alert('Size already added!');
    else selectedList.appendChild(NewItemCard(item));
};