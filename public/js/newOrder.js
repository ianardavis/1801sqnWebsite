var addWindow = null;

function openAddWindow() {
    if (addWindow == null || addWindow.closed) {
        addWindow = window.open("/stores/itemSearch?callType=order",
                                "itemSearch",
                                "width=600,height=840,resizeable=no,location=no");
    } else {
        addWindow.focus();
    };
};

function addSize(selected) {
    var selectedList = document.querySelector('#selectedItems'),
        newItem = document.createElement('p'),
        existingID = document.getElementById('id-' + selected.stock_id); //////
    if (typeof(existingID) === 'undefined' || 
        existingID !== null) {
        alert('Size already added!');
    } else {
        newItem.classList.add('row');
        newItem.classList.add('container');
        newItem.classList.add('mx-auto');
        newItem.id = 'id-' + selected.stock_id;
        
        var input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'selected[]';
        input.value = JSON.stringify({
            stock_id: selected.stock_id, 
            qty: selected._qty
        });

        newSpan = document.createElement('span');
        newSpan.classList.add('form-control');
        newSpan.classList.add('col-10');
        newSpan.innerText = selected._description + ' - Size: ' + selected._size_text + ' - Qty: ' + selected._qty;
        
        delBtn = document.createElement('a');
        delBtn.href='javascript:removeSize("id-' + selected.stock_id + '")';
        delBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        delBtn.classList.add('col-2');
        
        newItem.appendChild(input);
        newItem.appendChild(newSpan);			
        newItem.appendChild(delBtn);

        selectedList.appendChild(newItem);
    };
};

function removeSize(stock_id) {
    var selectedList = document.querySelector('#' + stock_id);
    selectedList.remove();
};