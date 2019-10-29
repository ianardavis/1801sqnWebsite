var issueDate = document.querySelector('#issueDate'),
    dueDate    = document.querySelector('#dueDate');

issueDate.value = TodaysDate();
dueDate.value   = TodaysDate(7);

function TodaysDate(addYears = 0) {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var MM = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear() + addYears;

    today = yyyy + '-' + MM + '-' + dd;
    return today;
};
function loadSizes(sizes) {
    var sizeSelect = document.querySelector('#sizeTable'),
        locationSelect = document.querySelector('#locationTable');
    sizeSelect.innerHTML = '';
    locationSelect.innerHTML = '';
    if (sizes) {
        sizes = JSON.parse(sizes.replace("[object", ""));
        sizes.forEach((size) => {
            var opt = document.createElement('option');
            opt.value = JSON.stringify(size);
            opt.innerText = size.size._text;
            sizeSelect.appendChild(opt);
        });
    };
};
function loadNSNs(size) {
    var nsnSelect = document.querySelector('#nsnTable');
    nsnSelect.innerHTML = '';
    if (size) {
        size = JSON.parse(size.replace("[object", ""));
        size.forEach((size) => {
            var opt = document.createElement('option');
            opt.value = JSON.stringify(size);
            opt.innerText = size.nsns._nsn;
            nsnSelect.appendChild(opt);
        });
    };
};
function loadLocations(size) {
    var locationSelect = document.querySelector('#locationTable');
    locationSelect.innerHTML = '';
    if (size) {
        size = JSON.parse(size.replace("[object", ""));
        size.locations.forEach((location) => {
            var opt = document.createElement('option');
            opt.value = JSON.stringify(location);
            opt.innerText = location._location + ", Qty: " + location._qty;
            locationSelect.appendChild(opt);
        });
        loadNSNs(size);
    };
};

function addSize() {
    var Item = document.querySelector('#itemsTable'),
        Size = document.querySelector('#sizeTable'),
        Location = document.querySelector('#locationTable'),
        _qty = document.querySelector('#qty');
    if (Item.selectedIndex === -1 || 
        Size.selectedIndex === -1 || 
        Location.selectedIndex === -1 || 
        _qty.value === '0') {
        alert('No item, size, location or quantity selected!');
    } else {
        var selectedList = document.querySelector('#selectedItems'),
            newItem = document.createElement('p'),
            sizeSelected = JSON.parse(Size[Size.selectedIndex].value),
            locationSelected = JSON.parse(Location[Location.selectedIndex].value),
            existingID = document.getElementById('id-' + sizeSelected.stock_id);
        if (typeof(existingID) === 'undefined' || 
            existingID !== null) {
                
            alert('Size already added!');
        } else {
            newItem.classList.add('row');
            newItem.classList.add('container');
            newItem.classList.add('mx-auto');
            newItem.id = 'id-' + sizeSelected.stock_id;
            
            var input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'selected[]';
            input.value = JSON.stringify({
                stock_id: sizeSelected.stock_id, 
                qty: Number(_qty.value),
                location_id: locationSelected.location_id,
                location_qty: locationSelected._qty - _qty.value
            });

            newSpan = document.createElement('span');
            newSpan.classList.add('form-control');
            newSpan.classList.add('col-10');
            newSpan.innerText = Item[Item.selectedIndex].innerText + ' - Size: ' + Size[Size.selectedIndex].innerText + ' - Qty: ' + _qty.value;
            
            delBtn = document.createElement('a');
            delBtn.href='javascript:removeSize("id-' + sizeSelected.stock_id + '")';
            delBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
            delBtn.classList.add('col-2');
            
            newItem.appendChild(input);
            newItem.appendChild(newSpan);			
            newItem.appendChild(delBtn);

            selectedList.appendChild(newItem);
        }
    }
}

function removeSize(stock_id) {
    var selectedList = document.querySelector('#' + stock_id);
    selectedList.remove();
}