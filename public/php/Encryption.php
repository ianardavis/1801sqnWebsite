<?php
class Encryption {
	function getSession() {
		require_once 'session.php';
		$Session = new session();
		return $Session->getSession();
	}
	public function hashString($password, $salt){
		return hash('sha512', $password . $salt, false);
	}
	public function newSalt() {
		$salt = bin2hex(openssl_random_pseudo_bytes(128));
		return $salt;
	}

	public function decrypt($encryptedString) {
		$session = $this->getSession();
		if ($session['success'] == 1) {
			$json = json_decode(base64_decode($encryptedString), true);
			try {
				$salt = hex2bin($json['salt']);
				$iv = hex2bin($json['iv']);
			} catch (Exception $e) {
				return null;
			}
			$cipherText = base64_decode($json['encrypted']);			
			$hashkey = $this->hashKey($session['key'], $salt);
			unset($json, $salt);			
			$decrypted = openssl_decrypt($cipherText, 'AES-256-CBC', hex2bin($hashkey), OPENSSL_RAW_DATA, $iv);
			unset($cipherText, $json, $iv);
			return $decrypted;
		} else {
			error_log('error getting session for decryption');
			return null;
		}
	}
	public function encrypt($decrypted) {
		$session = $this->getSession();
		if ($session['success'] == 1) {
			$ivLength = openssl_cipher_iv_length('AES-256-CBC');
			$iv = openssl_random_pseudo_bytes($ivLength);			
			$salt = openssl_random_pseudo_bytes(256);			
			$hashkey = $this->hashKey($session['key'], $salt);			
			$encrypted = openssl_encrypt($decrypted, 'AES-256-CBC', hex2bin($hashkey), OPENSSL_RAW_DATA, $iv);			
			$encrypted = base64_encode($encrypted);
			unset($hashkey);			
			$output = ['encrypted' => $encrypted, 'iv' => bin2hex($iv), 'salt' => bin2hex($salt)];
			unset($encrypted, $iv, $ivlength, $salt);			
			return base64_encode(json_encode($output));
		} else {
			return null;
		}
	}
	function hashKey($key, $salt) {
		return hash_pbkdf2('sha512', $key, $salt, 999, 64);
	}
}
?>
