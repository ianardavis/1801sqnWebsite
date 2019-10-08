<?php
class Orders {
	public function rowCount($id = null, $idColumn = null) {
		if (permission('access_notes')) {
			require_once 'mySql.php';
			$mySQL = new mySQL();
			if ($id == null) {
				$result = $mySQL->COUNT('orders');
			} else {
				$result = $mySQL->$mySQL->SELECT_ROW('orders',
													 array('order_id'),
													 $idColumn,
													 $id);
			}
			if ($result->num_rows == 1) {
				$row = $result->fetch_assoc();
				return array("success" => true, "count" => $row['COUNT(*)']);
			} else {
				return array("success" => true, "count" => 0);
			}
		} else {
			return array("success" => false, "reason" => 'permission');
		}
	}
}
?>
