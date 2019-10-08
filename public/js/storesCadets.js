function encrypt(data) {
	let encryption = new Encryption();
	return encryption.encrypt(data, sessionStorage.getItem("sessionID"));
}
function decrypt(data) {
	let encryption = new Encryption();
	return encryption.decrypt(data, sessionStorage.getItem("sessionID"));
}
//////////////////////////////////////////////////////////////////

function clear() {
	document.getElementById("user_id").value = "";
	document.getElementById("_bader").value = "";
	document.getElementById("_name").value = "";
	document.getElementById("_ini").value = "";
	document.getElementById("_rank").value = "";
	document.getElementById("_gender").value = "";
	document.getElementById("_status").value = "";
	document.getElementById("_reset").checked = false;
	document.getElementById("_last_login").value = "";
	showNotes(null);
}
function enable(bool) {
	document.getElementById("_bader").readOnly = !bool;
	document.getElementById("_name").readOnly = !bool;
	document.getElementById("_ini").readOnly = !bool;
	document.getElementById("_rank").disabled = !bool;
	document.getElementById("_gender").disabled = !bool;
}
function phpCall(dataString, onSuccess, passOn = null) {
	$(document).ready(function() {
		$.ajax({
			type: 'POST',
			url: 'assets/php/phpCaller.php',
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

function showCurrentCadet(cadetId = null) {
	if (sessionStorage.getItem("rowCadet") !== -1) {
		if (cadetId === null) {
			var dataString = '{"table":"cadets","function":"get","rowId":"' + sessionStorage.getItem("rowCadet") + '"}';
			phpCall(dataString, "showCurrentCadetSuccess");
		} else {
			var dataString = '{"table":"cadets","function":"select","user_id":"' + cadetId + '"}';
			phpCall(dataString, "showCurrentCadetSuccess");
		}
	} else {
		clear();
	}
}
function showCurrentCadetSuccess(result) {
	if (result.success) {
		var data = JSON.parse(result.rowData);
		var dataKeys = Object.keys(data);
		for (var i = 0; i < dataKeys.length; i++) {
			var key = dataKeys[i];
			if (key === "_reset") {
				if (data[key] === 1) {
					document.getElementById("_reset").checked = true;
				} else if (data[key] === 0){
					document.getElementById("_reset").checked = false;
				}
			} else { 
				document.getElementById(key).value = data[key];
			}
		}
		showNotes(data['user_id']);
	} else {
		clear();
	}
}

function showNotes(cadetId) {
	clearTable("notes");
	if (cadetId !== null) {
		var sys = document.getElementById("_system").value;
		var dataString = '{"table":"notes","function":"get","linkTable":"cadets","linkValue":"' + cadetId + '","sys":"' + sys + '"}';
		phpCall(dataString, "showNotesSuccess");
	}
}
function showNotesSuccess(result) {
	if (result.success) {
		var data = JSON.parse(result.rows);
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
		sessionStorage.setItem("rowCadet", 0);
		showCurrentCadet();
	}
}
function prev() {
	if (sessionStorage.getItem("action") === null) {
		if (sessionStorage.getItem("rowCadet") > 0) {
			sessionStorage.setItem("rowCadet", sessionStorage.getItem("rowCadet") - 1);
		}
		showCurrentCadet();
	}
}
function next() {
	if (sessionStorage.getItem("action") === null) {
		if (sessionStorage.getItem("rowCadet") < sessionStorage.getItem("rowCount") - 1) {
			sessionStorage.setItem("rowCadet", parseInt(sessionStorage.getItem("rowCadet")) + 1);
		}
		showCurrentCadet();
	}
}
function last() {
	if (sessionStorage.getItem("action") === null) {
		sessionStorage.setItem("rowCadet", sessionStorage.getItem("rowCount") - 1);
		showCurrentCadet();
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
		var opt = document.createElement('option');
		opt.value = "blank";
		opt.innerHTML = "";
		select.appendChild(opt);
		for (i = 0; i < Object.keys(data).length; i++) {
			var opt = document.createElement('option');
			opt.value = data[i]._option;
			opt.innerHTML = data[i]._option;
			select.appendChild(opt);
		}
	}
}

function add() {
	if (sessionStorage.getItem("action") === null) {
		editing(true, "add");
		clear();
		document.getElementById("_reset").checked = true;
		document.getElementById("_status").value = "Current";
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
	showSave(bool);
	showCancel(bool);
}
function showSave(bool) {
	document.getElementById("save").style.display = bool2disp(bool);
	document.getElementById("save").value = "SAVE";
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

function changeStatus() {
	if (sessionStorage.getItem("action") === null) {
		if (confirm("This function will not succeed unless this cadet has no items or orders outstanding\n\nContinue?")) {
			document.getElementById("_status").disabled = false;
			showSave(true);
			showCancel(true);
			sessionStorage.setItem("action", "status");
		}
	}
}
function del() {
	if (sessionStorage.getItem("action") === null) {
		if (confirm("This function will not succeed unless this cadet has no items or orders outstanding.\nThis function should only be used if this cadet was added in error!\notherwise use the discharge function.\n\nContinue?")) {
			var dataString = '{"table":"cadets","function":"delete","cadetId":"' + document.getElementById("user_id").value + '"}';
			phpCall(dataString, "delSuccess");
		}
	}
}
function delSuccess(result) {
	if (result.success) {
		sessionStorage.setItem("rowCadet", 0);
		showCurrentCadet();
	} else if (result.reason = "permission") {
		alert("Permission denied!");
	} else if (result.reason = "notes") {
		alert("Failed: cadet has notes!");
	}  else if (result.reason = "orders") {
		alert("Failed: cadet has open orders!");
	} else if (result.reason = "issues") {
		alert("Failed: cadet has issued items!");
	}  else if (result.reason = "requests") {
		alert("Failed: cadet has open requests!");
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
		document.getElementById("_status").disabled = false;
		document.getElementById("user_id").readOnly = false;
		document.getElementById("save").value = "FIND";
		document.getElementById("divFind").style.display = "block";
		document.getElementById("divNotes").style.display = "none";		
	}
}
function order() {
	if (sessionStorage.getItem("action") === null) {
		console.log("order");
	}
}
function pwChange() {
	if (sessionStorage.getItem("action") === null) {
		var dataString = '{"table":"cadets","function":"openChangePW","cadetId":"' + document.getElementById("user_id").value + '"}';
		phpCall(dataString, "pwChangeSuccess");
	}
}
function pwChangeSuccess(result) {
	if (result) {
		sessionStorage.setItem("nextPage", "cadets.html");
		sessionStorage.setItem("prevPage", "cadets.html");
		sessionStorage.setItem("username", document.getElementById("_rank").value + " " + document.getElementById("_name").value + ", " + document.getElementById("_ini").value);
		sessionStorage.setItem("table", "cadets");
		sessionStorage.setItem("confirm", false);
		window.location.assign("changePW.html");
	} else {
		alert("Unable to set action!");
	}
}
function pwReset() {
	if (sessionStorage.getItem("action") === null) {
		if (confirm("Force this cadet to change their password on next login?")) {
			var dataString = '{"table":"cadets","function":"resetPW","cadetId":"' + document.getElementById("user_id").value + '"}';
			phpCall(dataString, "pwResetSuccess");
		}
	}
}
function pwResetSuccess(result) {
	if (result) {
		alert("Reset flag set!\n\nCadet will be required to reset their password on next login.");
	} else {
		alert("Reset flag not set!\n\nFlag may already be set!");
	}
	showCurrentCadet();
}
function noteAdd() {
	if (sessionStorage.getItem("action") === null) {
		console.log("add note");
	}
}
function save() {
	if (sessionStorage.getItem("action") === "status") {
		var dataString = '{' + 
			'"table":"cadets",' + 
			'"function":"status",' + 
			'"status":"' + document.getElementById("_status").value + '",' + 
			'"cadetId":"' + document.getElementById("user_id").value + '"}';
		phpCall(dataString, "saveStatusSuccess");
	} else if (sessionStorage.getItem("action") === "add") {
		var text = cadetDetails(false);
		var dataString = '{"table":"cadets","function":"add","details":' + text + '}';
		phpCall(dataString, "saveAddSuccess");
	} else if (sessionStorage.getItem("action") === "edit") {
		var text = cadetDetails(true);
		var dataString = '{"table":"cadets","function":"edit","details":' + text + '}';
		phpCall(dataString, "saveEditSuccess");
	} else if (sessionStorage.getItem("action") === "find") {
		clearTable("findTable");
		var fields = ["user_id", "_bader", "_name", "_ini", "_rank", "_gender", "_status"];
		var conditions = [];
		fields.forEach(function (field, index, array) {
			if (document.getElementById(field).value !== "" && document.getElementById(field).value !== "blank") {
				conditions.push('"' + field + '":"' + document.getElementById(field).value + '"');
			}
		})
		if (conditions.length === 0) {
			alert("no search criteria entered!");
		} else {
			var dataString = '{"table":"cadets","function":"find","details":{' + conditions.join() + '}}';
			phpCall(dataString, "saveFindSuccess");
		}
	}
}
function checkValue(field, index, array) {
	if (document.getElementById(field).value !== "") {
		conditions.push('"' + field + '":"' + document.getElementById(field).value + '"');
	}
}
function cadetDetails (incId) {
	if (incId) {
		var Id = '"user_id":"' + document.getElementById("user_id").value + '",'
	} else {
		var Id = ''
	}
	var text = '{' + 
	Id + 
	'"_bader":"' + document.getElementById("_bader").value + '",' +
	'"_name":"' + document.getElementById("_name").value + '",' + 
	'"_ini":"' + document.getElementById("_ini").value + '",' +
	'"_rank":"' + document.getElementById("_rank").value + '",' +
	'"_gender":"' + document.getElementById("_gender").value + '"}';
	return text;
}
function saveStatusSuccess(result) {
	if (result) {
		alert("Status updated");
	} else if (result.reason = "permission") {
		alert("Failed: Permission denied!");
	} else if (result.reason = "orders") {
		alert("Failed: Cadet has open orders!");
	} else if (result.reason = "requests") {
		alert("Failed: Cadet has open requests!");
	} else if (result.reason = "update") {
		alert("Failed");
	}
	reset(true);
}
function saveAddSuccess(result) {
	setRowCount()
	if (result.success) {
		setRowCount()
		alert("Cadet added, ID: " + result.id);
	} else if (result.reason === 'permission') {
		alert("Failed: Permission denied");
	} else if (result.reason === 'bader') {
		alert("Failed: Bader number already exists");
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
		alert("Cadet edited");
	} else if (result.reason === 'permission') {
		alert("Failed: Permission denied");
	} else if (result.reason === 'no cadet') {
		alert("Failed: Cadet no longer exists");
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
			addFindRow(row["user_id"], row["_bader"], row["_name"], row["_ini"], row["_rank"], row["_gender"]);
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
function addFindRow(user_id, _bader, _name, _ini, _rank, _gender) {
	var table = document.getElementById("findTable");
	var tRow = table.insertRow(-1);
	Cell0 = tRow.insertCell(0);
	Cell1 = tRow.insertCell(1);
	Cell2 = tRow.insertCell(2);
	Cell3 = tRow.insertCell(3);
	Cell4 = tRow.insertCell(4);
	Cell5 = tRow.insertCell(5);
	Cell0.innerHTML = user_id;
	Cell1.innerHTML = _bader;
	Cell2.innerHTML = _name;
	Cell3.innerHTML = _ini;
	Cell4.innerHTML = _rank;
	Cell5.innerHTML = _gender;
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
						showCurrentCadet(id);
						reset(false)
					};
			};
		currentRow.onclick = clickHandler(id);
	}
}
function cancel() {
	reset(true);
}
function reset(showCadet) {
	editing(false);
	document.getElementById("_status").disabled = true;
	document.getElementById("user_id").readOnly = true;
	document.getElementById("divFind").style.display = "none";
	document.getElementById("divNotes").style.display = "block";
	if (showCadet == true) {showCurrentCadet()};
}

function backMainMenu() {
	if (sessionStorage.getItem("action") === null) {
		window.location.assign("storesMain.html");
	} else {
		if (confirm("You are currently performing an action on this page.\nReturning to the main menu will cancel this action without saving.\nContinue?")) {
			sessionStorage.removeItem("action");
			window.location.assign("storesMain.html");
		}
	}
}
function checkVariables() {
	if (sessionStorage.getItem("action") !== null) {
		sessionStorage.removeItem("action");
	}
	setRowCount();
	if (sessionStorage.getItem("rowCadet") === null) {
		if (sessionStorage.getItem("rowCount") === 0) {
			sessionStorage.setItem("rowCadet", 0);
		}
	}
	showCurrentCadet();
}
function setRowCount() {
	if (sessionStorage.getItem("rowCount") === null) {
		sessionStorage.setItem("rowCount", 0);
	}
	rowCount();
}
function rowCount() {
	var dataString = '{"table":"cadets","function":"count"}';
	phpCall(dataString, "rowCountSuccess");
}
function rowCountSuccess(result) {
	if (result.success) {
		sessionStorage.setItem("rowCount", result.count);
		if (result.count >= 0) {
			if (sessionStorage.getItem("rowCadet") === null || sessionStorage.getItem("rowCadet") === -1) {
				sessionStorage.setItem("rowCadet", 0);
			}
		} else {
			sessionStorage.setItem("rowCadet", -1);
		}
	} else {
		sessionStorage.setItem("rowCadet", -1);
		sessionStorage.setItem("rowCount", 0);
	}
}
////////////////////////////////////////////////////////////


if (sessionStorage.getItem("action") === null) {
	document.onkeydown = function(event) {
		if (event.ctrlKey && event.keyCode === 37) {
			event.preventDefault();
			document.getElementById("btnFirst").click();
		} else if (event.ctrlKey && event.keyCode === 39) {
			event.preventDefault();
			document.getElementById("btnLast").click();
		} else if (event.ctrlKey === false && event.keyCode === 37) {
			event.preventDefault();
			document.getElementById("btnPrev").click();
		} else if (event.ctrlKey === false && event.keyCode === 39) {
			event.preventDefault();
			document.getElementById("btnNext").click();
		}
	};
}
document.querySelector("#btnAdd").addEventListener("click", add);
document.querySelector("#btnEdit").addEventListener("click", edit);
document.querySelector("#btnStatus").addEventListener("click", changeStatus);
document.querySelector("#btnDel").addEventListener("click", del);
document.querySelector("#btnFind").addEventListener("click", find);
document.querySelector("#btnOrder").addEventListener("click", order);
document.querySelector("#btnPwChange").addEventListener("click", pwChange);
document.querySelector("#btnPwReset").addEventListener("click", pwReset);
document.querySelector("#btnNoteAdd").addEventListener("click", noteAdd);
document.querySelector("#btnFirst").addEventListener("click",first);
document.querySelector("#btnPrev").addEventListener("click", prev);
document.querySelector("#btnNext").addEventListener("click", next);
document.querySelector("#btnLast").addEventListener("click", last);
document.querySelector("#mainMenu").addEventListener("click",backMainMenu);
document.querySelector("#save").addEventListener("click", save);
document.querySelector("#cancel").addEventListener("click", cancel);


getOptions('_gender');
getOptions('_rank');
getOptions('_status');
checkVariables();
