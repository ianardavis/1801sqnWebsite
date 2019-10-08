class Encryption {
hashKey(key, salt) {
	return CryptoJS.PBKDF2(key, salt, {'hasher': CryptoJS.algo.SHA512, 'keySize': 8, 'iterations': 999});
}
	
encrypt(decrypted) {
	var iv = CryptoJS.lib.WordArray.random(16);
	var key = sessionStorage.getItem("sessionID");
	var salt = CryptoJS.lib.WordArray.random(256);
	var hashkey = this.hashKey(key, salt);
	var encrypted = CryptoJS.AES.encrypt(decrypted, hashkey, {'mode': CryptoJS.mode.CBC, 'iv': iv});
	var encryptedString = CryptoJS.enc.Base64.stringify(encrypted.ciphertext);
	
	var output = {
		encrypted: encryptedString, 
		salt: CryptoJS.enc.Hex.stringify(salt), 
		iv: CryptoJS.enc.Hex.stringify(iv)};

	return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(JSON.stringify(output)));		
}
decrypt(encrypted) {
	var json = JSON.parse(CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(encrypted)));
	var key = sessionStorage.getItem("sessionID");
	var salt = CryptoJS.enc.Hex.parse(json.salt);
	var iv = CryptoJS.enc.Hex.parse(json.iv);
	var cipherText = json.encrypted;
	
	var hashkey = this.hashKey(key, salt);
	
	var decrypted = CryptoJS.AES.decrypt(cipherText, hashkey, {'mode': CryptoJS.mode.CBC, 'iv': iv});
	
	return decrypted.toString(CryptoJS.enc.Utf8);
}
}
