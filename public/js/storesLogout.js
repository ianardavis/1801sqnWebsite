function encrypt(data) {
	let encryption = new Encryption();
	return encryption.encrypt(data);
}
function decrypt(data) {
	let encryption = new Encryption();
	return encryption.decrypt(data);
}
var datastring = '{"table":"session","function":"clear"}';
$(document).ready(function() {
	$.ajax({
		type: 'POST',
		url: 'resources/phpCaller.php',
		dataType: 'text',
		data: 'request=' + encrypt(datastring),
		cache: false,
		success: function(result) {
			try {
				var resultD = JSON.parse(decrypt(result));
				if (resultD.success === false) {
					alert("Possible error logging out!\nReturning to login screen");
				}
			} catch (err) {
				alert("Error decrypting server request!\nIf you have already logged out this is expected\nReturning to login screen");
			}
			sessionStorage.clear();
			window.location.assign("login.html");
		},
		error: function() {
			sessionStorage.clear();
			alert("Possible error logging out!\nReturning to login screen");
			window.location.assign("login.html");
		}
	});
});
