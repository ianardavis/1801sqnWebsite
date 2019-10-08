// function encrypt(data) {
// 	let encryption = new Encryption();
// 	return encryption.encrypt(data);
// }
// function decrypt(data) {
// 	let encryption = new Encryption();
// 	return encryption.decrypt(data);
// }
function processLogin() {
	if (document.getElementById("username").value == '' || document.getElementById("password").value == '') {
		alert('Enter username and password');
	} else {
		$(document).ready(function() {
			var username = document.getElementById("username").value;
			var password = document.getElementById("password").value;
			var loginType = $("input[name=loginType]:checked").val();
			var datastring = '{"table":"login","function":"process","username":"' + username + '","password":"' + password + '","loginType":"' + loginType + '"}';
			$.ajax({
				type: 'POST',
				url: '/php/phpCaller.php',
				dataType: 'text',
				data: 'request=' + datastring, //data: 'request=' + encrypt(datastring),
				cache: false,
				success: function(result) {
					var resultD = JSON.parse(result); //var resultD = JSON.parse(decrypt(result));
					if (resultD.success) {
						alert("Last successful login: " + resultD.lastLogin)
						if (resultD.reset == 1) {
							var dataString = '{"table":"login","function":"openChangePW","userId":"' + document.getElementById("username").value + '"}';
							$.ajax({
								type: 'POST',
								url: '/php/phpCaller.php',
								dataType: 'text',
								data: 'request=' + datastring, //data: 'request=' + encrypt(datastring),
								cache: false,
								success: function(result) {
									var resultD = JSON.parse(result); // var resultD = JSON.parse(decrypt(result));
									sessionStorage.setItem("nextPage", "main.html");
									sessionStorage.setItem("prevPage", "login.html");
									sessionStorage.setItem("username", username);
									sessionStorage.setItem("currentPW", password);
									sessionStorage.setItem("table", "users");
									window.location.assign("changePassword.html");
								}})
						} else {
							window.location.assign("storesMain.html");
						}
					} else if (resultD.reason == "un/pw") {
						alert("Incorrect username or password");
					} else if (resultD.reason == "permission") {
						alert("Your account is disabled!");
					} else if (resultD.reason == "session") {
						alert("Error getting session!");
					} else if (resultD.reason == "cadet") {
						alert("cadet user code");
					}
				},
				error: function(xhr, status, error) {
					alert("login error");
				}
			});
		});
	}
	return false;
}
function getSession() {
	var datastring = 'request=newSession';
	$(document).ready(function() {
		$.ajax({
			type: 'POST',
			url: '/php/phpCaller.php',
			dataType: 'json',
			data: datastring,
			cache: false,
			success: function(result) {
				if (result.success) {
					sessionStorage.setItem("sessionID", result.sessionID);
				} else {
					alert("Unable to set session");
				}
			}
		});
	});
}
getSession();
var input = document.getElementById("password");
input.addEventListener("keyup", function(event) {
	if (event.keyCode === 13) {
		event.preventDefault();
		document.getElementById("login").click();
	}
})
