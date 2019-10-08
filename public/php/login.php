<?php
class Login {
	public function process($username, $password, $UserType) {
		session_start();
		require_once 'mySql.php';
		$mySQL = new mySQL();
		$now = date('y/m/d H:i:s');
		$mySqlKey = '10981b9ac3b0e7ba7664567c09821b89';
		if ($UserType == 'User') {
			require_once 'Encryption.php';
			$encryption = new Encryption;
			$user_id = $encryption->hashString($username, $mySqlKey);
			$result = $mySQL->SELECT('users', 
									array('_salt'), 
									array(array('user_id', $user_id, 's')), 
									'');
			if ($result->num_rows == 1) {
				$row = $result->fetch_assoc();
				$result = $mySQL->SELECT('users', 
										array('_last_login','_reset'), 
										array(array('user_id', $user_id, 's'), array('_password', $encryption->hashString($password, $row['_salt']), 's')), 
										' AND ');
				if ($result->num_rows == 1) {
					require_once 'session.php';
					$session = new Session();
					$permission = $session->getPermission('account_enabled', $user_id);
					if ($permission == true) {
						$row = $result->fetch_assoc();
						$lastLogin = $row['_last_login'];
						$reset = $row['_reset'];
						$mySQL->UPDATE('users', 
									array('user_id', $user_id, 's'), 
									array(array('_last_login', $now, 's')));
						$mySQL->UPDATE('users_sessions', 
									array('ip_address', $_SERVER['REMOTE_ADDR'], 's'), 
									array(array('user_id', $user_id, 's')));
						return array("success" => true, "lastLogin" => $lastLogin, "reset" => $reset);
					} else {
						return array("success" => false, "reason" => "permission");
					}
				} else {
					return array("success" => false, "reason" => "un/pw");
				}
			} else {
				return array("success" => false, "reason" => "un/pw");
			}
		} else {
			return array("success" => false, "reason" => "cadet");
		}
	}
	public function openChangePW($user_id) {
		require_once 'session.php';
		$Session = new Session();
		$session = $Session->getSession();
		if ($session['success'] == true) {
			$time = new DateTime();
			$minAdd = 10;
			$time->add(new DateInterval('PT' . $minAdd . 'M'));
			$action = array();
			$action[] = array('user_id', $Session->getSessionUserId(), 's');
			$action[] = array('_session_key', $session['key'], 's');
			$action[] = array('_action', 'changePW', 's');
			$action[] = array('_target', $user_id, 'i');
			$action[] = array('_expires', $time->format('Y-m-d H:i:s'), 's');
			$action[] = array('_condition1', 0, 'i');
			require_once 'mySql.php';
			$mySQL = new mySQL();
			$result = $mySQL->INSERT('users_actions',
									 $action);
			if ($result != 'failed') {
				return array("success" => true);
			} else {
				return array("success" => false, "reason" => "insert");
			}
		} else {
			return array("success" => false, "reason" => "session");
		}
	}
}
?>
