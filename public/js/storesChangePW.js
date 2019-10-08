function encrypt(data) {
	let encryption = new Encryption();
	return encryption.encrypt(data, sessionStorage.getItem("sessionID"));
}
function decrypt(data) {
	let encryption = new Encryption();
	return encryption.decrypt(data, sessionStorage.getItem("sessionID"));
}
function hasNumbers(str) {
	return /\d/.test(str);
}
function hasLowerCase(str) {
	return str.toUpperCase() != str;
}
function hasUpperCase(str) {
	return str.toLowerCase() != str;
}
function loadChangePassword()  {

}
function changePassword() {
	if (document.getElementById("newPW").value == "" || document.getElementById("confirmPW").value == "") {
		alert("Enter a password in the new and confirmed fields");
	} else if (document.getElementById("currentPW").value == "" && sessionStorage.getItem("confirm") == true) {
		alert("Enter your current password!");
	} else if (document.getElementById("newPW").value !== document.getElementById("confirmPW").value) {
		alert("New and confirmed passwords do not match!");
	} else {
		var str = document.getElementById("newPW").value;
		var n = str.length;
		if (hasLowerCase(str) && hasUpperCase(str) && hasNumbers(str) && n >= 8) {
			var dataString = '{"table":"' + sessionStorage.getItem("table") + 
							'","function":"changePW' + 
							'","currentPW":"' + document.getElementById("currentPW").value + 
							'","newPW":"' + document.getElementById("newPW").value + '"}';
			$(document).ready(function() {
				$.ajax({
					type: 'POST',
					url: 'resources/phpCaller.php',
					dataType: 'text',
					data: 'request=' + encrypt(dataString),
					cache: false,
					success: function(result) {
						var resultD = JSON.parse(decrypt(result));
						if (resultD.success) {
							alert("password changed")
							if (sessionStorage.getItem("nextPage") === null) {
								var nextPage = "main.html";	
							} else {
								var nextPage = sessionStorage.getItem("nextPage");
							}
							sessionStorage.removeItem("nextPage");
							sessionStorage.removeItem("table");
							sessionStorage.removeItem("currentPW");
							sessionStorage.removeItem("username");
							sessionStorage.removeItem("currentPW");
							window.location.assign(nextPage);
						} else {
							if (resultD.reason == 'same') {
								alert("New password must be different to the old password!");
							} else {
								alert(resultD.reason);
							}
						}
					}
				});
			});
		} else {
			alert("Password must be at least 8 characters long, contain upper and lower case letters and a number!");
		}
	}
}


function cancelChange() {
	sessionStorage.clear();
	window.location.assign(sessionStorage.getItem("prevPage"));
}

document.getElementById("username").value = sessionStorage.getItem("username");
if (sessionStorage.getItem("confirm") === true) {
	document.getElementById("currentPW").value = decrypt(sessionStorage.getItem("currentPW"));
	document.getElementById("currentPW").style.display = "block";
	document.getElementById("currentPWlbl").style.display = "block";
} else {
	document.getElementById("currentPW").style.display = "none";
	document.getElementById("currentPWlbl").style.display = "none";
}
