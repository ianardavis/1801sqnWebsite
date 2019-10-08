<?php
class Suppliers {
	public function get_name($supplier_id) {
		require_once 'mySql.php';
		$mySQL = new mySQL();
		$result = $mySQL->SELECT('suppliers', 
								array('_name'), 
								array(array('supplier_id', $supplier_id, 's')), 
								'');
		if ($result->num_rows == 1) {
			$rows = array();
			$row = $result->fetch_assoc();
			return array("success" => true, "_name" => $row['_name']);
		} else if ($result->num_rows > 1){
			return array("success" => false, "reason" => 'multiple');
		} else {
			return array("success" => false, "reason" => 'none');
		}
	}
	public function get_all_id_name() {
		require_once 'mySql.php';
		$mySQL = new mySQL();
		$result = $mySQL->SELECT('suppliers', 
								array('supplier_id', '_name'));
		if ($result->num_rows > 0) {
			$rows = array();
			while ($row = $result->fetch_assoc()) {
				$rows[] = json_encode($row);
			}
			return array("success" => true, "rows" => json_encode($rows));
		} else if ($result->num_rows == 0){
			return array("success" => false, "reason" => 'none');
		}
	}
}
?>
