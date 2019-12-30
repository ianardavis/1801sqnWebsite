var issueDate = document.querySelector('#issueDate'),
    dueDate   = document.querySelector('#dueDate'),
    addWindow = null;

issueDate.value = TodaysDate();
dueDate.value   = TodaysDate(7);

function openAddWindow() {
    if (addWindow == null || addWindow.closed) {
        addWindow = window.open("/stores/itemSearch?c=issue",
                                "itemSearch",
                                "width=600,height=840,resizeable=no,location=no");
    } else addWindow.focus();
};

function TodaysDate(addYears = 0) {
    let today = new Date(),
        dd = String(today.getDate()).padStart(2, '0'),
        MM = String(today.getMonth() + 1).padStart(2, '0'), //January is 0
        yyyy = today.getFullYear() + addYears;
    today = yyyy + '-' + MM + '-' + dd;
    return today;
};

function addSize(selected, nsns = null, stocks = null) {
    let selectedList = document.querySelector('#selectedItems'),
        newItem = document.createElement('p'),
        existingID = document.getElementById('id-' + selected.itemsize_id);
    if (typeof(existingID) === 'undefined' || existingID !== null) alert('Size already added!');
    else {
        addClasses(newItem, ['row','container','mx-auto','bordered']);
        newItem.id = 'id-' + selected.itemsize_id;
        
        let input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'selected[' + selected.itemsize_id + ']';
        input.value = JSON.stringify(selected);

        newSpan = document.createElement('span');
        addClasses(newSpan, ['col-10']);
        newSpan.innerText = selected._description + ' | Size: ' + selected._size_text + ' | Qty: ' + selected.qty;
        if (nsns) {
            let newNSNs = document.createElement('select');
            newNSNs.name = 'selected[' + selected.itemsize_id + ']';
            addClasses(newNSNs, ['form-control','form-control-sm']);
            nsns.forEach(nsn => newNSNs.appendChild(newOption('{"nsn_id":' + nsn.nsn_id + '}', nsn._nsn)));
            if (selected.nsn_id) newNSNs.value = '{"nsn_id":' + selected.nsn_id + '}';
            newSpan.appendChild(newNSNs);
        };
        if (stocks) {
            let newStocks = document.createElement('select');
            newStocks.name = 'selected[' + selected.itemsize_id + ']';
            addClasses(newStocks, ['form-control','form-control-sm']);
            stocks.forEach(stock => newStocks.appendChild(newOption('{"stock_id":' + stock.stock_id + '}', stock._location)));
            if (selected.stock_id) newStocks.value = '{"stock_id":' + selected.stock_id + '}';
            newSpan.appendChild(newStocks);
        };

        delBtn = document.createElement('a');
        addClasses(delBtn, ['btn', 'btn-danger']);
        delBtn.href='javascript:removeSize("' + selected.itemsize_id + '")';
        delBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        addClasses(delBtn, ['col-2','my-auto']);
        
        newItem.appendChild(input);
        newItem.appendChild(newSpan);
        newItem.appendChild(delBtn);

        selectedList.appendChild(newItem);
    };
};
function newOption (value, innerText) {
    let option = document.createElement('option');
    option.value = value;
    option.innerText = innerText;
    return option;
};
function addClasses (element, classes) {classes.forEach(_class => element.classList.add(_class))};
function removeSize (itemsize_id)      {document.querySelector('#id-' + itemsize_id).remove()};