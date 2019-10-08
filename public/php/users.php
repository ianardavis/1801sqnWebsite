<?php
class Users {
		function permission($perm) {
		require_once 'session.php';
		$session = new Session;
		return $session->getPermission($perm);
	}
		public function changePW($currentPW, $newPW) {
		if ($this->permission('settings_users_password')) {
			require_once 'mySql.php';
			require_once 'session.php';
			$mySQL = new mySQL();
			$Session = new Session();
			$userId = $Session->getSessionUserId();
			$session = $Session->getSession();
			if ($session['success'] == true) {
				$result = $mySQL->SELECT('users_actions', array('_action', '_target', '_expires', '_condition1'), array(array('user_id', $userId, 's'), array('_session_key', $session['key'], 's')), ' AND ');
				if ($result->num_rows == 1) {
					$row = $result->fetch_assoc();
					if (strtotime($row['_expires']) >= date("Y-m-d H:i:s")) {
						if ($row['_action'] == "changePW") {
							$user_id = $row['_target'];
							$actionId = $row['action_id'];
							if ($row['_condition1'] == false) {
								return $this->changePassword($user_id, $currentPW, $newPW, $actionId);
							} else {
								$result = $mySQL->SELECT('users', array('_salt'), array(array('user_id', $user_id, 's')), '');
								if ($result->num_rows == 1) {
									$row = $result->fetch_assoc();
									$oldSalt = $row['_salt'];
									require_once 'Encryption.php';
									$encryption = new Encryption();
									$checkpw = $encryption->hashString($currentPW, $oldSalt);
									$result = $mySQL->SELECT('users', array('_salt'), array(array('user_id', $user_id, 's'), array('_password', $checkpw, 's')), ' AND ');
									if ($result->num_rows == 1) {
										return $this->changePassword($user_id, $currentPW, $newPW, $actionId);
									} else {
										return array("success" => false, "reason" => 'current');
									}
								} else {
								return array("success" => false, "reason" => 'user');
								}
							}
						} else {
							return array("success" => false, "reason" => 'wrong action');
						}
					} else {
						return array("success" => false, "reason" => 'expired action');
					}
				} else if ($result->num_rows == 0) {
					return array("success" => false, "reason" => 'no action');
				} else {
					return array("success" => false, "reason" => 'multiple actions');
				}
			} else {
				return array("success" => false, "reason" => 'session key');
			}
		} else {
			return array("success" => false, "reason" => 'permission');
		}
	}
	function changePassword($user_id, $currentPW, $newPW, $actionID) {
		require_once 'mySql.php';
		$mySQL = new mySQL();
		$result = $mySQL->SELECT('users', array('_salt'), array(array('cadet_id', $cadet_id, 's')), '');
		if ($result->num_rows == 1) {
			$row = $result->fetch_assoc();
			$oldSalt = $row['_salt'];
			require_once 'Encryption.php';
			$encryption = new Encryption();
			$checkPw = $encryption->hashString($newPW, $oldSalt);
			$result = $mySQL->SELECT('users', array('_salt'), array(array('user_id', $user_id, 's'), array('_password', $checkPw, 's')), ' AND ');
			if ($result->num_rows == 0) {
				$newSalt = $encryption->newSalt();
				$newPW = $encryption->hashString($newPW, $newSalt);
				$mySQL->UPDATE('users', array('user_id', $user_id, 's'), array(array('_salt', $newSalt, 's'), array('_password', $newPW, 's'), array('_reset', 0, 's')));
				$mySQL->DELETE('users_actions', 'action_id', $actionID);
				return array("success" => true);
			} else {
				return array("success" => false, "reason" => 'same');
			}
		} else {
			return array("success" => false, "reason" => 'user');
		}
	}
}
?>
