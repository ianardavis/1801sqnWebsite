<?php
class Cadets {
	function permission($perm) {
		require_once 'session.php';
		$session = new Session;
		return $session->getPermission($perm);
	}
	public function rowCount() {
		require_once 'mySql.php';
		$mySQL = new mySQL();
		$result = $mySQL->COUNT('cadets');
		if ($result->num_rows == 1) {
			$row = $result->fetch_assoc();
			return array("success" => true, "count" => $row['COUNT(*)']);
		} else {
			return array("success" => false);
		}
	}
	public function selectRow($rowId) {
		require_once 'mySql.php';
		$mySQL = new mySQL();
		$result = $mySQL->SELECT_ROW('cadets', 
									array('user_id', '_bader', '_name', '_ini', '_rank', '_gender', '_status', '_reset', '_last_login'),
									'user_id',
									$rowId);
		if ($result->num_rows == 1) {
			$row = $result->fetch_assoc();
			return array("success" => true, "rowData" => json_encode($row));
		} else if ($result->num_rows > 1) {
			return array("success" => false, "reason" => "multiple");
		} else if ($result->num_rows == 0) {
			return array("success" => false, "reason" => "none");
		}
	}
	public function selectCadet($cadetId) {
		require_once 'mySql.php';
		$mySQL = new mySQL();
		$result = $mySQL->SELECT('cadets', 
								 array('user_id', '_bader', '_name', '_ini', '_rank', '_gender', '_status', '_reset', '_last_login'),
								 array(array('user_id', $cadetId, 'i')));
		if ($result->num_rows == 1) {
			$row = $result->fetch_assoc();
			return array("success" => true, "rowData" => json_encode($row));
		} else if ($result->num_rows > 1) {
			return array("success" => false, "reason" => "multiple");
		} else if ($result->num_rows == 0) {
			return array("success" => false, "reason" => "none");
		}
	}
	function hasOrders($cadetId) {
		require_once 'orders.php';
		$orders = new Orders();
		$result = $orders->rowCount($cadetId, 'user_id');
		if ($result == 0) {
			return false;
		} else {
			return true;
		}
	}
	function hasNotes($cadetId) {
		require_once 'notes.php';
		$notes = new Notes();
		$result = $notes->rowCount($cadetId);
		if ($result == 0) {
			return false;
		} else {
			return true;
		}
	}
	function hasIssues($cadetId) {
		require_once 'issues.php';
		$issues = new Issues();
		$result = $issues->rowCount($cadetId);
		if ($result == 0) {
			return false;
		} else {
			return true;
		}
	}
	function hasRequests($cadetId) {
		require_once 'requests.php';
		$requests = new Requests();
		$result = $requests->rowCount($cadetId);
		if ($result == 0) {
			return false;
		} else {
			return true;
		}
	}
	public function resetPW($cadetId) {
		if ($this->permission('cadets_password')) {
				require_once 'mySql.php';
				$mySQL = new mySQL();
				return $mySQL->UPDATE('cadets', 
									array('user_id', $cadetId, 'i'), 
									array(array('_reset', 1, 'i')));
			}
		}
	public function changePW($currentPW, $newPW) {
		if ($this->permission('cadets_password')) {
			require_once 'mySql.php';
			require_once 'session.php';
			$mySQL = new mySQL();
			$Session = new Session();
			$userId = $Session->getSessionUserId();
			$session = $Session->getSession();
			if ($session['success'] == true) {
				$result = $mySQL->SELECT('users_actions', 
										 array('action_id', '_action', '_target', '_expires', '_condition1'), 
										 array(array('user_id', $userId, 's'), array('_session_key', $session['key'], 's')), 
										 ' AND ');
				if ($result->num_rows == 1) {
					$row = $result->fetch_assoc();
					if (strtotime($row['_expires']) >= date("Y-m-d H:i:s")) {
						if ($row['_action'] == "changePW") {
							$user_id = $row['_target'];
							$actionId = $row['action_id'];
							if ($row['_condition1'] == false) {
								return $this->changePassword($user_id, $currentPW, $newPW, $actionId);
							} else {
								$result = $mySQL->SELECT('cadets', array('_salt'), array(array('user_id', $user_id, 's')), '');
								if ($result->num_rows == 1) {
									$row = $result->fetch_assoc();
									$oldSalt = $row['_salt'];
									require_once 'Encryption.php';
									$encryption = new Encryption();
									$checkpw = $encryption->hashString($currentPW, $oldSalt);
									$result = $mySQL->SELECT('cadets', array('_reset'), array(array('user_id', $user_id, 's'), array('_password', $checkpw, 's')), ' AND ');
									if ($result->num_rows == 1) {
										return $this->changePassword($user_id, $currentPW, $newPW, $actionId);
										
									} else {
										return array("success" => false, "reason" => 'current password');
									}
								} else if ($result->num_rows == 0) {
									return array("success" => false, "reason" => 'no user');
								} else {
									return array("success" => false, "reason" => 'multiple users');
								}
							}
						} else {
							return array("success" => false, "reason" => 'wrong action');
						}
					} else {
						return array("success" => false, "reason" => 'expired action');
					}
				} else {
					return array("success" => false, "reason" => 'no action');
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
		$result = $mySQL->SELECT('cadets', array('_salt'), array(array('user_id', $user_id, 's')), '');
		if ($result->num_rows == 1) {
			$row = $result->fetch_assoc();
			$oldSalt = $row['_salt'];
			require_once 'Encryption.php';
			$encryption = new Encryption();
			$checkPw = $encryption->hashString($newPW, $oldSalt);
			$result = $mySQL->SELECT('cadets', array('_salt'), array(array('user_id', $user_id, 's'), array('_password', $checkPw, 's')), ' AND ');
			if ($result->num_rows == 0) {
				$newSalt = $encryption->newSalt();
				$newPW = $encryption->hashString($newPW, $newSalt);
				$mySQL->UPDATE('cadets', array('user_id', $user_id, 's'), array(array('_salt', $newSalt, 's'), array('_password', $newPW, 's'), array('_reset', 0, 's')));
				$mySQL->DELETE('users_actions', 'action_id', $actionID);
				return array("success" => true);
			} else {
				return array("success" => false, "reason" => 'same');
			}
		} else if ($result->num_rows == 0) {
			return array("success" => false, "reason" => 'no user');
		} else {
			return array("success" => false, "reason" => 'multiple users');
		}
	}
	public function delete($cadetId) {
		if ($this->Permission('cadets_delete')) {
			if ($this->hasNotes($cadetId ) == false) {
				if ($this->hasOrders($cadetId ) == false) {
					if ($this->hasIssues($cadetId ) == false) {
						if ($this->hasRequests($cadetId ) == false) {
							require_once 'mySql.php';
							$mySQL = new mySQL();
							$result = $mySQL->DELETE('cadets', 'user_id', $cadetId);
							if ($result) {
								return array("success" => true);
							} else {
								return array("success" => false, "reason" => "delete");
							}
						} else {
							return array("success" => false, "reason" => "requests");
						}
					} else {
						return array("success" => false, "reason" => "issues");
					}
				} else {
					return array("success" => false, "reason" => "orders");
				}
			} else {
				return array("success" => false, "reason" => "notes");
			}
		} else {
			return array("success" => false, "reason" => "permission");
		}
	}
	public function status($cadetId, $status) {
		if ($this->permission('cadets_status')) {
			require_once 'mySql.php';
			$mySQL = new mySQL();
			$result = $mySQL->SELECT('items_issues', 
									array('issue_id'), 
									array(array('user_id', $cadetId, 's'), array('return_id', !null, 's')), 
									' AND ');
			if ($result->num_rows == 0) {
				$result = $mySQL->SELECT('items_orders', 
										array('order_id'), 
										array(array('user_id', $cadetId, 's'), array('receipt_id', !null, 's')), 
										' AND ');
				if ($result->num_rows == 0) {
					$result = $mySQL->SELECT('items_requests', 
											array('request_id'), 
											array(array('user_id', $cadetId, 's'), array('_approved_by', !null, 's')), 
											' AND ');
					if ($result->num_rows == 0) {
						$results = $mySQL->UPDATE('cadets', 
											array('user_id', $cadetId, 'i'), 
											array(array('_status', $status, 's')));
						return array("success" == true);
					} else {
						return array("success" => false, "reason" => "update");
					}
				} else{
					return array("success" => false, "reason" => "requests");
				}
			} else {
				return array("success" => false, "reason" => "orders");
			}
		} else {
			return array("success" => false, "reason" => "permission");
		}
	}
	public function add($details) {
		if ($this->permission('cadets_add')) {
			require_once 'mySql.php';
			$mySQL = new mySQL();
			$result = $mySQL->SELECT('cadets', 
									 array('_name'), 
									 array(array('_bader', $details['_bader'], 's')));
			if ($result->num_rows == 0) {
				require_once 'Encryption.php';
				$encryption = new Encryption();
				$details['_salt'] = $encryption->newSalt();
				$details['_password']= $encryption->hashString('Password1', $details['_salt']);
				$cadet = array();
				foreach ($details as $key => $value) {
					if ($key == '_reset') {
						$type = 'i';
					} else {
						$type = 's';
					}
					$cadet[] = array($key, $value, $type);
				}
				unset($value);
				unset($key);
				$result = $mySQL->INSERT('cadets',
										 $cadet);
				if ($result != 'failed') {
					return array("success" => true, "id" => $result);
				} else {
					return array("success" => false, "reason" => "insert");
				}
			} else {
				return array("success" => false, "reason" => "bader");
			}
		} else {
			return array("success" => false, "reason" => "permission");
		}
	}
	public function edit($details) {
		if ($this->permission('cadets_edit')) {
			require_once 'mySql.php';
			$mySQL = new mySQL();
			$result = $mySQL->SELECT('cadets', 
									 array('_name'), 
									 array(array('user_id', $details['user_id'], 'i')));
			if ($result->num_rows == 1) {
				$cadet = array();
				foreach ($details as $key => $value) {
					if ($key == 'user_id') {
						$where = array($key, $value, 'i');
					} else {
						$cadet[] = array($key, $value, 's');
					}
				}
				unset($value);
				unset($key);
				$result = $mySQL->UPDATE('cadets',
										 $where,
										 $cadet);
				if ($result == true) {
					return array("success" => true);
				} else {
					return array("success" => false, "reason" => "update");
				}
			} else {
				return array("success" => false, "reason" => "no cadet");
			}
		} else {
			return array("success" => false, "reason" => "permission");
		}
	}
	public function find($details) {
		if ($this->permission('cadets_search')) {
			require_once 'mySql.php';
			$mySQL = new mySQL();
			foreach ($details as $key => $value) {
				if ($key == 'user_id') {
					$where[] = array($key, $value, 'i');
				} else {
					$where[] = array($key, $value, 's');
				}
			}
			$result = $mySQL->FIND('cadets',
								   array('user_id', '_bader', '_name', '_ini', '_rank', '_gender'),
								   $where);
			if ($result->num_rows > 0) {
				$rows = array();
				while ($row = $result->fetch_assoc()) {
					$rows[] = $row;
				}
				return array("success" => true, "rows" => json_encode($rows));
			} else if ($result->num_rows == 0) {
				return array("success" => false, "reason" => "none");
			}
		} else {
			return array("success" => false, "reason" => "permission");
		}
	}
	public function openChangePW($user_id) {
		if ($this->permission('cadets_password')) {
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
		} else {
			return array("success" => false, "reason" => "permission");
		}
	}
}
?>
