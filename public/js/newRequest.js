var addWindow = null;

function openAddWindow() {
    if (addWindow == null || addWindow.closed) {
        addWindow = window.open("/stores/itemSearch?c=request",
                                "itemSearch",
                                "width=600,height=840,resizeable=no,location=no");
    } else addWindow.focus();
};

function addSize(selected) {
    var selectedList = document.querySelector('#selectedItems'),
        newItem = document.createElement('p'),
        existingID = document.getElementById('id-' + selected.itemsize_id); //////
    if (typeof(existingID) === 'undefined' || 
        existingID !== null) {
        alert('Size already added!');
    } else {
        newItem.classList.add('row');
        newItem.classList.add('container');
        newItem.classList.add('mx-auto');
        newItem.id = 'id-' + selected.itemsize_id;
        
        let input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'selected[' + selected.itemsize_id + '][itemsize_id]';
        input.value = selected.itemsize_id;

        let divItem = document.createElement('div'),
            qty = document.createElement('input');
        divItem.classList.add('col-10');
        itemDescription = document.createElement('p');
        itemDescription.innerText = selected.description + ' - Size: ' + selected.size;
        qty.classList.add('form-control', 'form-control-sm');
        qty.type = 'number';
        qty.name = 'selected[' + selected.itemsize_id + '][qty]';
        qty.value = selected.qty;
        divItem.appendChild(itemDescription);
        divItem.appendChild(qty);

        let divDel = document.createElement('div');
        divDel.classList.add('my-auto', 'col-2');
        delBtn = document.createElement('a');
        delBtn.href='javascript:removeID("id-' + selected.itemsize_id + '")';
        delBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        delBtn.classList.add('btn', 'btn-sm', 'btn-danger');
        divDel.appendChild(delBtn);

        newItem.appendChild(input);
        newItem.appendChild(divItem);			
        newItem.appendChild(divDel);

        selectedList.appendChild(newItem);
    };
};
