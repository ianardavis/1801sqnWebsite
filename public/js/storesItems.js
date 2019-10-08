function encrypt(data) {
	let encryption = new Encryption();
	return encryption.encrypt(data, sessionStorage.getItem("sessionID"));
}
function decrypt(data) {
	let encryption = new Encryption();
	return encryption.decrypt(data, sessionStorage.getItem("sessionID"));
}
//////////////////////////////////////////////////////////////////
function openNav() {
	if (sessionStorage.getItem("action") === null) {
		document.getElementById("navSide").style.width = "250px";
	}
}
function closeNav() {
	document.getElementById("navSide").style.width = "0";
}
function clear() {
	clearDetails();
	clearStock();
	clearOrdering();
	clearList("locations");
	clearList("stocknums");
	clearTable("notes");
}
function clearDetails() {
	document.getElementById("item_id").value = "";
	document.getElementById("_description").value = "";
	document.getElementById("_size").value = "";
	document.getElementById("_gender").value = "";
	document.getElementById("_category").value = "";
	document.getElementById("_type").value = "";
	document.getElementById("_sub_type").value = "";
	showNotes(null);
}
function clearStock() {
	document.getElementById("_qty_stock").value = "";
	document.getElementById("_qty_order").value = "";
	document.getElementById("_qty_issued").value = "";
}
function clearOrdering() {
	document.getElementById("supplier_id").value = "";
	document.getElementById("_demand_page").value = "";
	document.getElementById("_cell").value = "";
	document.getElementById("_details").value = "";
}
function clearList (_list) {
	document.getElementById(_list).innerHTML = "";
}
function enable(bool) {
	document.getElementById("_description").readOnly = !bool;
	document.getElementById("_size").readOnly = !bool;
	document.getElementById("_gender").disabled = !bool;
	document.getElementById("_category").disabled = !bool;
	document.getElementById("_type").disabled = !bool;
	document.getElementById("_sub_type").disabled = !bool;
	document.getElementById("supplier_id").disabled = !bool;
	document.getElementById("_demand_page").disabled = !bool;
	document.getElementById("_cell").readOnly = !bool;
	document.getElementById("_details").readOnly = !bool;
}
function phpCall(dataString, onSuccess, passOn = null) {
	$(document).ready(function() {
		$.ajax({
			type: 'POST',
			url: 'resources/phpCaller.php',
			dataType: 'text',
			data: 'request=' + dataString, //			data: 'request=' + encrypt(dataString),
			cache: false,
			success: function(result) {
				var resultD = JSON.parse(result); // var resultD = JSON.parse(decrypt(result));
				if (resultD.success === false && resultD.reason === 'no request') {
					alert("Failed: No request")
				} else {
					goTo = window[onSuccess];
					goTo(resultD, passOn);
				}
			},
			error: function() {
				alert("Error making request");
				reset(true)
			}
		});
	});
}

function getItemDetail(itemId = null) {
	if (sessionStorage.getItem("rowItem") !== -1) {
		if (itemId === null) {
			var dataString = '{"table":"items","function":"get","rowId":"' + sessionStorage.getItem("rowItem") + '"}';
			phpCall(dataString, "getItemSuccess");
		} else {
			var dataString = '{"table":"items","function":"select","item_id":"' + itemId + '"}';
			phpCall(dataString, "getItemSuccess");
		}
	} else {
		clear();
	}
}
function getItemSuccess(result) {
	clear();
	if (result.success) {
		var data = JSON.parse(result.rowData);
		clearList("stocknums");
		clearList("locations");
		showDetails(result);
		showNotes(data['item_id']);
	}
}
function showDetails (result) {
	var data = JSON.parse(result.rowData);
	var dataKeys = Object.keys(data);
	for (var i = 0; i < dataKeys.length; i++) {
		var key = dataKeys[i];
		if (data[key] != null) {
			if (key == "stocknums") {
				showStocknums(key, data[key]);
			} else if (key == "locations") {
				showLocations(key, data[key]);
			} else {
				showItem(data[key])
			}
		}
	}
}
function showStocknums(_list, _data) {
	var data = JSON.parse(_data);
	var dataKeys = Object.keys(data);
	for (var i = 0; i < dataKeys.length; i++) {
		var key = dataKeys[i];
		if (data[key] != null) {
			addListRow(_list, data[key]["_stocknum"]);
		}
	}
}
function showLocations(_list, _data) {
	var data = JSON.parse(_data);
	var dataKeys = Object.keys(data);
	for (var i = 0; i < dataKeys.length; i++) {
		var key = dataKeys[i];
		if (data[key] != null) {
			addListRow(_list, data[key]["_location"]);
		}
	}
}
function showItem(_data) {
	var data = JSON.parse(_data);
	var dataKeys = Object.keys(data);
	for (var i = 0; i < dataKeys.length; i++) {
		var key = dataKeys[i];
		if (data[key] != null) {
			document.getElementById(key).value = data[key];
		}
	}
}
function addListRow(_list, _value) {
	var node = document.createElement("LI");
	var listItem = document.createTextNode(_value);
	node.appendChild(listItem);
	document.getElementById(_list).appendChild(node);
}

function showNotes(itemId) {
	clearTable("notes");
	if (itemId !== null) {
		var sys = document.getElementById("_system").value;
		var dataString = '{"table":"notes","function":"get","linkTable":"items","linkValue":"' + itemId + '","sys":"' + sys + '"}';
		phpCall(dataString, "showNotesSuccess");
	}
}
function showNotesSuccess(result) {
	if (result.success) {
		var data = JSON.parse(result.rows);
		console.log(data);
		for (i = 0; i < Object.keys(data).length; i++) {
			var row = data[i];
			addNoteRow(row["note_id"], row["_date"], Boolean(row["_system"]), row["_note"]);
		}
	} else {
		if (result.reason === "permission"){
			addNoteRow("", "", "", "permission denied");
		}
	}
	addNoteRow("", "", "", "");
}
function clearTable (table) {
	var table = document.getElementById(table);
	for (var i = table.rows.length - 1; i > 0; i--)
	{
		table.deleteRow(i);
	}
}
function addNoteRow(_id, _date, _system, _note) {
	var table = document.getElementById("notes");
	var tRow = table.insertRow(-1);
	Cell0 = tRow.insertCell(0);
	Cell1 = tRow.insertCell(1);
	Cell2 = tRow.insertCell(2);
	Cell3 = tRow.insertCell(3);
	Cell0.innerHTML = _id;
	Cell1.innerHTML = _date;
	Cell2.innerHTML = _system;
	Cell3.innerHTML = _note;
}

function first() {
	if (sessionStorage.getItem("action") === null) {
		sessionStorage.setItem("rowItem", 0);
		getItemDetail();
	}
}
function prev() {
	if (sessionStorage.getItem("action") === null) {
		if (sessionStorage.getItem("rowItem") > 0) {
			sessionStorage.setItem("rowItem", sessionStorage.getItem("rowItem") - 1);
		}
		getItemDetail();
	}
}
function next() {
	if (sessionStorage.getItem("action") === null) {
		if (sessionStorage.getItem("rowItem") < sessionStorage.getItem("rowCount") - 1) {
			sessionStorage.setItem("rowItem", parseInt(sessionStorage.getItem("rowItem")) + 1);
		}
		getItemDetail();
	}
}
function last() {
	if (sessionStorage.getItem("action") === null) {
		sessionStorage.setItem("rowItem", sessionStorage.getItem("rowCount") - 1);
		getItemDetail();
	}
}

function add() {
	if (sessionStorage.getItem("action") === null) {
		editing(true, "add");
		clear();
	}
}
function edit() {
	if (sessionStorage.getItem("action") === null) {
		editing(true, "edit");
	}
}
function editing(bool, action = null) {
	enable(bool);
	if (action === null) {
		sessionStorage.removeItem("action");
	} else {
		sessionStorage.setItem("action", action);
	}
	if (bool === true) {
		closeNav();
	}
	closeNav();
	showSave(bool);
	showCancel(bool);
}
function showSave(bool) {
	document.getElementById("save").style.display = bool2disp(bool);
	document.getElementById("save").value = "Save";
}
function showCancel(bool) {
	document.getElementById("cancel").style.display = bool2disp(bool);
}
function bool2disp(bool) {
	if (bool === true) {
		return "block";
	} else {
		return "none";
	}
}
function del() {
	if (sessionStorage.getItem("action") === null) {
		if (confirm("This function will not succeed unless this item has no notes, issues, requests or orders outstanding.\nThis function should only be used if this item was added in error!\n\nContinue?")) {
			var dataString = '{"table":"items","function":"delete","itemId":"' + document.getElementById("item_id").value + '"}';
			phpCall(dataString, "delSuccess");
		}
	}
}
function delSuccess(result) {
	if (result.success) {
		sessionStorage.setItem("rowItem", 0);
		getItemDetail();
	} else if (result.reason = "permission") {
		alert("Permission denied!");
	} else if (result.reason = "notes") {
		alert("Failed: item has notes!");
	}  else if (result.reason = "orders") {
		alert("Failed: item has open orders!");
	} else if (result.reason = "issues") {
		alert("Failed: item has issued items!");
	}  else if (result.reason = "requests") {
		alert("Failed: item has open requests!");
	} else if (result.reason = "delete") {
		alert("Failed!");
	}
	setRowCount;
}
function find() {
	if (sessionStorage.getItem("action") === null) {
		clearTable("findTable");
		editing(true, "find");
		clear();
		document.getElementById("item_id").readOnly = false;
		document.getElementById("save").value = "Find";
		document.getElementById("divFind").style.display = "block";
		document.getElementById("divNotes").style.display = "none";		
	}
}
function order() {
	if (sessionStorage.getItem("action") === null) {
		console.log("order");
	}
}
function receive() {
	if (sessionStorage.getItem("action") === null) {
		console.log("receive");
	}
}
function count() {
	if (sessionStorage.getItem("action") === null) {
		console.log("count");
	}
}
function scrap() {
	if (sessionStorage.getItem("action") === null) {
		console.log("scrap");
	}
}
function noteAdd() {
	if (sessionStorage.getItem("action") === null) {
		console.log("add note");
	}
}
function save() {
	if (sessionStorage.getItem("action") === "add") {
		var text = itemDetails(false);
		var dataString = '{"table":"items","function":"add","details":' + text + '}';
		phpCall(dataString, "saveAddSuccess");
	} else if (sessionStorage.getItem("action") === "edit") {
		var detailText = itemDetails(true);
		var dataString = '{"table":"items","function":"editDetails","details":' + detailText + '}';
		phpCall(dataString, "saveEditSuccess");
		var orderingText = itemOrdering();
		var dataString = '{"table":"items","function":"editOrdering","details":' + orderingText + '}';
		phpCall(dataString, "saveEditSuccess");
	} else if (sessionStorage.getItem("action") === "find") {
		clearTable("findTable");
		var fields = ["item_id", "_description", "_size", "_gender", "_category", "_type", "_sub_type"];
		var conditions = [];
		fields.forEach(function (field, index, array) {
			if (document.getElementById(field).value !== "" && document.getElementById(field).value !== "blank") {
				conditions.push('"' + field + '":"' + document.getElementById(field).value + '"');
			}
		})
		if (conditions.length === 0) {
			alert("no search criteria entered!");
		} else {
			var dataString = '{"table":"items","function":"find","details":{' + conditions.join() + '}}';
			phpCall(dataString, "saveFindSuccess");
		}
	}
}
function checkValue(field, index, array) {
	if (document.getElementById(field).value !== "") {
		conditions.push('"' + field + '":"' + document.getElementById(field).value + '"');
	}
}
function itemDetails (incId) {
	if (incId) {
		var Id = '"item_id":"' + document.getElementById("item_id").value + '",'
	} else {
		var Id = ''
	}
	var text = '{' + 
	Id + 
	'"_description":"' + document.getElementById("_description").value + '",' +
	'"_size":"' + document.getElementById("_size").value + '",' + 
	'"_gender":"' + document.getElementById("_gender").value + '",' +
	'"_category":"' + document.getElementById("_category").value + '",' +
	'"_type":"' + document.getElementById("_type").value + '",' +
	'"_sub_type":"' + document.getElementById("_sub_type").value + '"}';
	return text;
}
function itemOrdering () {
	var text = '{"item_id":"' + document.getElementById("item_id").value + '",' +
	'"supplier_id":"' + document.getElementById("supplier_id").value + '",' +
	'"_demand_page":"' + document.getElementById("_demand_page").value + '",' + 
	'"_cell":"' + document.getElementById("_cell").value + '",' +
	'"_details":"' + document.getElementById("_details").value + '"}';
	return text;
}
function saveStatusSuccess(result) {
	if (result) {
		alert("Status updated");
	} else if (result.reason = "permission") {
		alert("Failed: Permission denied!");
	} else if (result.reason = "orders") {
		alert("Failed: item has open orders!");
	} else if (result.reason = "requests") {
		alert("Failed: item has open requests!");
	} else if (result.reason = "update") {
		alert("Failed");
	}
	reset(true);
}
function saveAddSuccess(result) {
	setRowCount()
	if (result.success) {
		setRowCount()
		alert("Item added, ID: " + result.id);
	} else if (result.reason === 'permission') {
		alert("Failed: Permission denied");
	} else if (result.reason === 'insert') {
		alert("Failed: Insert error");
	} else {
		alert("Failed");
	}
	last();
	reset(true);
}
function saveEditSuccess(result) {
	if (result.success) {
		setRowCount()
		alert("Item edited");
	} else if (result.reason === 'permission') {
		alert("Failed: Permission denied");
	} else if (result.reason === 'no item') {
		alert("Failed: Item no longer exists");
	} else if (result.reason === 'update') {
		alert("Failed: Update error");
	} else {
		alert("Failed");
	}
	reset(true);
}
function saveFindSuccess(result) {
	if (result.success) {
		var data = JSON.parse(result.rows);
		for (i = 0; i < Object.keys(data).length; i++) {
			var row = data[i];
			addFindRow(row["item_id"], row["_description"], row["_size"], row["_gender"], row["_category"], row["_type"], row["_sub_type"]);
		}
		addRowHandlers();
	} else {
		if (result.reason === "none") {
			alert("No results found!");
		} else {
			alert("fail - more code");
		}
		
	}
}
function addFindRow(item_id, _description, _size, _gender, _category, _type, _sub_type) {
	var table = document.getElementById("findTable");
	var tRow = table.insertRow(-1);
	Cell0 = tRow.insertCell(0);
	Cell1 = tRow.insertCell(1);
	Cell2 = tRow.insertCell(2);
	Cell3 = tRow.insertCell(3);
	Cell4 = tRow.insertCell(4);
	Cell5 = tRow.insertCell(5);
	Cell6 = tRow.insertCell(6);
	Cell0.innerHTML = item_id;
	Cell1.innerHTML = _description;
	Cell2.innerHTML = _size;
	Cell3.innerHTML = _gender;
	Cell4.innerHTML = _category;
	Cell5.innerHTML = _type;
	Cell6.innerHTML = _sub_type;
}
function addRowHandlers() {
	var table = document.getElementById("findTable");
	var rows = table.getElementsByTagName("tr");
	for (i = 1; i < rows.length; i++) {
		var currentRow = table.rows[i];
		var id = currentRow.getElementsByTagName("td")[0].innerHTML;
		var clickHandler = 
			function(id) {
					return function() {
						getItemDetail(id);
						reset(false)
					};
			};
		currentRow.onclick = clickHandler(id);
	}
}
function cancel() {
	reset(true);
}
function reset(showItem) {
	editing(false);
	document.getElementById("item_id").readOnly = true;
	document.getElementById("divFind").style.display = "none";
	document.getElementById("divNotes").style.display = "block";
	if (showItem == true) {getItemDetail()};
}

function backMainMenu() {
	if (sessionStorage.getItem("action") === null) {
		window.location.assign("main.html");
	} else {
		if (confirm("You are currently performing an action on this page.\nReturning to the main menu will cancel this action without saving.\nContinue?")) {
			sessionStorage.removeItem("action");
			window.location.assign("main.html");
		}
	}
}
function checkVariables() {
	if (sessionStorage.getItem("action") !== null) {
		sessionStorage.removeItem("action");
	}
	setRowCount();
	if (sessionStorage.getItem("rowItem") === null) {
		if (sessionStorage.getItem("rowCount") === 0) {
			sessionStorage.setItem("rowItem", 0);
		}
	}
	getItemDetail();
}
function setRowCount() {
	if (sessionStorage.getItem("rowCount") === null) {
		sessionStorage.setItem("rowCount", 0);
	}
	rowCount();
}
function rowCount() {
	var dataString = '{"table":"items","function":"count"}';
	phpCall(dataString, "rowCountSuccess");
}
function rowCountSuccess(result) {
	if (result.success) {
		sessionStorage.setItem("rowCount", result.count);
		if (result.count >= 0) {
			if (sessionStorage.getItem("rowItem") === null || sessionStorage.getItem("rowItem") === -1) {
				sessionStorage.setItem("rowItem", 0);
			}
		} else {
			sessionStorage.setItem("rowItem", -1);
		}
	} else {
		sessionStorage.setItem("rowItem", -1);
		sessionStorage.setItem("rowCount", 0);
	}
}
function getOptions(field) {
	var dataString = '{"table":"options","function":"get","combo":"' + field + '"}';
	phpCall(dataString, "getOptionsSuccess", field);
}
function getOptionsSuccess(result, field) {
	if (result.success) {
		var data = JSON.parse(result.rows);
		var select = document.getElementById(field);
		select.appendChild(createOption("blank", ""));
		for (i = 0; i < Object.keys(data).length; i++) {
			select.appendChild(createOption(data[i]._option, data[i]._option));
		}
	}
}
function loadSuppliers(result) {
	if (result.success) {
		var data = JSON.parse(result.rows);
		var select = document.getElementById("supplier_id");
		select.appendChild(createOption("blank", ""));
		for (i = 0; i < Object.keys(data).length; i++) {
						var supplier = JSON.parse(data[i])
			var opt = document.createElement('option');
			opt.value = supplier.supplier_id;
			opt.innerHTML = supplier.supplier_id + " - " + supplier._name;
			select.appendChild(opt);
		}
	}
}
function createOption(value, inner) {
	var opt = document.createElement('option');
	opt.value = value;
	opt.innerHTML = inner;
	return opt;
}
////////////////////////////////////////////////////////////
getOptions('_gender');
getOptions('_category');
getOptions('_type');
getOptions('_sub_type');
getOptions('_demand_page');
var dataString = '{"table":"suppliers","function":"getIdNames"}';
phpCall(dataString, "loadSuppliers");
checkVariables();
