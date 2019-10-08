<?php
class Notes {
	function permission($perm) {
		require_once 'session.php';
		$session = new Session;
		return $session->getPermission($perm);
	}
	public function get($linkTable, $linkValue, $sys) {
		if ($this->permission('access_notes')) {
			require_once 'mySql.php';
			$mySQL = new mySQL();
			$result = $mySQL->SELECT('notes', 
									array('note_id', '_date', '_system', '_note'), 
									array(array('_link_table', $linkTable, 's'), array('_link_value', $linkValue, 'i')), 
									' AND ');
			if ($result->num_rows > 0) {
				$rows = array();
				while ($row = $result->fetch_assoc()) {
					if ($sys == 'include'||
						$sys == 'only' && $row['_system'] == 1||
						$sys =='exclude' && $row['_system'] == 0) {
							$rows[] = $row;
					}
				}
				return array("success" => true, "rows" => json_encode($rows));
			} else {
				return array("success" => false, "reason" => "no rows");
			}
		} else {
			return array("success" => false, "reason" => "permission");
		}
	}
	public function rowCount($cadetId) {
		if (permission('access_notes')) {
			require_once 'mySql.php';
			$mySQL = new mySQL();
			$result = $mySQL->SELECT('notes', 
									array('note_id', '_date', '_system', '_note'), 
									array(array('_link_table', 'cadets', 's'), array('_link_value', $cadetId, 's')), 
									' AND ');
			return $result->num_rows;
		}
	}
}
?>
