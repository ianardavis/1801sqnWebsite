// function encrypt(data) {
//     let encryption = new Encryption();
//     return encryption.encrypt(data, sessionStorage.getItem("sessionID"));
// }
// function decrypt(data) {
//     let encryption = new Encryption();
//     return encryption.decrypt(data, sessionStorage.getItem("sessionID"));
    
// }
function openPage(page, permission) {
    $(document).ready(function() {
        var dataString = '{"table":"session","function":"permission","permission":"' + permission + '"}';
        $.ajax({
            type: 'POST',
            url: 'php/phpCaller.php',
            dataType: 'text',
            data: 'request=' + dataString, //data: 'request=' + encrypt(dataString),
            cache: false,
            success: function(result) {
                if (result) { //if (decrypt(result)) {
                    window.location.assign(page + ".html");
                } else {
                    alert("Permission denied!");
                }
            }
        })
    })
}
        
document.getElementById("cadets").addEventListener("click", function() {openPage("storesCadets", "access_cadets")});
