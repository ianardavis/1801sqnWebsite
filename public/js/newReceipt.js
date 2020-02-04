var addWindow = null;

function addSize(selected) {
    var selectedList = document.querySelector('#selectedItems'),
        newItem      = document.createElement('p'),
        existingID   = document.querySelector('#id-' + selected.stock_id);
    if (typeof(existingID) === 'undefined' || 
        existingID !== null) {
        alert('Location already added!');
    } else {
        newItem.classList.add('row', 'container', 'mx-auto');
        newItem.id = 'id-' + selected.stock_id;
        
        let input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'selected[' + selected.stock_id + '][stock_id]';
        input.value = selected.stock_id;

        let divItem = document.createElement('div'),
            qty = document.createElement('input');
        divItem.classList.add('col-10');
        itemDescription = document.createElement('p');
        itemDescription.innerText = selected.description + ' - Size: ' + selected.size;
        qty.classList.add('form-control', 'form-control-sm');
        qty.type = 'number';
        qty.name = 'selected[' + selected.stock_id + '][qty]';
        qty.value = selected.qty;
        divItem.appendChild(itemDescription);
        divItem.appendChild(qty);

        let divDel = document.createElement('div');
        divDel.classList.add('my-auto', 'col-2');
        delBtn = document.createElement('a');
        delBtn.href='javascript:removeID("id-' + selected.stock_id + '")';
        delBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        delBtn.classList.add('btn', 'btn-sm', 'btn-danger');
        divDel.appendChild(delBtn);

        newItem.appendChild(input);
        newItem.appendChild(divItem);			
        newItem.appendChild(divDel);

        selectedList.appendChild(newItem);
    };
};