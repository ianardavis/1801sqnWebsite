<?php
class Options {
	public function get($field) {
		require_once 'mySql.php';
		$mySQL = new mySQL();
		$result = $mySQL->SELECT('options', 
								array('_option'), 
								array(array('_combo', $field, 's')), 
								'');
		if ($result->num_rows > 0) {
		$rows = array();
			while ($row = $result->fetch_assoc()) {
				$rows[] = $row;
			}
			return array("success" => true, "rows" => json_encode($rows));
		} else {
			return array("success" => false, "rows" => null);
		}
	}
}
?>
