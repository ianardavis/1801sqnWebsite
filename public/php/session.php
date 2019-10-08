<?php
class Session {
	public function set() {
		$clientIp = $_SERVER['REMOTE_ADDR'];
		require_once 'mySql.php';
		$mySQL = new mySQL();
		$sessionId = bin2hex(openssl_random_pseudo_bytes(16));
		$result = $mySQL->SELECT('users_sessions', 
								 array('_date_started'), 
								 array(array('ip_address', $clientIp, 's')));
		if ($result->num_rows == 1) {
			$result = $mySQL->UPDATE('users_sessions', 
									 array('ip_address', $clientIp, 's'), 
									 array(array('_session_key', $sessionId, 's'), array('_date_started', date('y/m/d h:i:sa'), 's'), array('user_id', null, 's'))); 
		} else {
			$result = $mySQL->INSERT('users_sessions', 
									 array(array('ip_address', $clientIp, 's'), array('_session_key', $sessionId, 's'), array('_date_started', date('y/m/d h:i:sa'), 's')));
		}
		return array("success" => true, "sessionID" => $sessionId);
	}
	public function getSession () {
		$clientIp = $_SERVER['REMOTE_ADDR'];
		require_once 'mySql.php';
		$mySQL = new mySQL();
		$result = $mySQL->SELECT('users_sessions', 
								 array('_session_key'), 
								 array(array('ip_address', $clientIp, 's')));
		if ($result->num_rows == 1) {
			$row = $result->fetch_assoc();
			$sessionKey = $row['_session_key'];
			return array("success" => true, "key" => $sessionKey);
		} else {
			return array("success" => false, "key" => null);
		}
	}
	public function check ($clientIp) {
		
	}
	public function getPermission ($permission, $userId = null) {
		require_once 'mySql.php';
		$mySQL = new mySQL();
		if ($userId == null) {
			$userId = $this->getSessionUserId();
		}
		$result = $mySQL->SELECT('users_permissions', 
								 array($permission), 
								 array(array('user_id', $userId, 's')));
		if ($result->num_rows == 1) {
			$row = $result->fetch_assoc();
			return $row[$permission];
		} else {
			return false;
		}
	}
	public function clear ($clientIp) {
		$clientIp = $_SERVER['REMOTE_ADDR'];
		require_once 'mySql.php';
		$mySQL = new mySQL();
		$result = $mySQL->DELETE('users_sessions', 
								 'ip_address', 
								 $clientIp);
		return array("success" => true);
	}
	function getSessionUserId() {
		require_once 'mySql.php';
		$mySQL = new mySQL();
		$clientIp = $_SERVER['REMOTE_ADDR'];
		$result = $mySQL->SELECT('users_sessions', 
								 array('user_id'), 
								 array(array('ip_address', $clientIp, 's')));
		if ($result->num_rows == 1) {
			$row = $result->fetch_assoc();
			return $row['user_id'];
		} else {
			return null;
		}
	}
}
?>
