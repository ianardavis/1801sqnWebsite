<?php
class BindParam{
	private $values = array(), $types = '';
	
	public function add( $type, &$value ){
		$this->values[] = &$value;
		$this->types .= $type;
	}
	public function get(){
		return array_merge(array($this->types), $this->values);
	}
}
class mySQL {
	function Connection(){
		$serverName = 'localhost';
		$username = 'StoresUser';
		$password = 'Password1';
		$database = 'stores';
		$conn = new mysqli($serverName, $username, $password, $database);
		if ($conn->connect_error) {
		die('Connection failed: ' . $conn->connect_error);
		}
		return $conn;
	}
	public function INSERT($table, $dataIn){
		$bindParam = new BindParam();
		$args = count($dataIn);
		$inserts = array();
		$columns = array();
		$a_params = & $types;
		for ($n = 0; $n < $args; $n++) {
			$inserts[] = "?";
			$columns[] = $dataIn[$n][0];
			$bindParam->add($dataIn[$n][2], $dataIn[$n][1]);
		}	
		$conn = $this->Connection();
		$insertq = implode(", ", $inserts);
		$column = implode(", ", $columns);
		$query = 'INSERT INTO ' . $table . ' (' . $column . ') VALUES (' . $insertq . ') ';
		$sql = $conn->prepare($query);
		call_user_func_array(array($sql, 'bind_param'), $bindParam->get());
		$sql->execute();
		$conn->close();
		if ($sql->affected_rows === 1) {
			return $sql->insert_id;
		} else {
			return "failed";
		}
	}
	public function SELECT($table, $selectColumns, $wheres = null, $whereGlue = ''){
		$selects = implode(', ', $selectColumns);
		$bindParam = new BindParam();
		$x = count($wheres);
		$whereColumns = '';
		if ($x > 0) {
			$where = array();
			$whereColumns = ' WHERE ';
			for ($n = 0; $n < $x; $n++) {
				$bindParam->add($wheres[$n][2], $wheres[$n][1]);
				$where[] = $wheres[$n][0] . ' = ?';
			}
			$whereColumns .= implode($whereGlue, $where);
		}
		$conn = $this->Connection();
		$query = 'SELECT ' . $selects . ' FROM ' . $table . $whereColumns;
		$sql = $conn->prepare($query);
		if ($x > 0) {
			call_user_func_array(array($sql, 'bind_param'), $bindParam->get());
		}
		$sql->execute();
		$result = $sql->get_result();
		return $result;
		$conn->close();
	}
	public function SELECT_ROW($table, $selectColumns, $id, $row){
		$selects = implode(', ', $selectColumns);		
		$conn = $this->Connection();
		$query = 'SELECT ' . $selects . ' FROM ' . $table . ' ORDER BY ' . $id . ' LIMIT ?, 1';
		$sql = $conn->prepare($query);
		$sql->bind_param('i', $row);
		$sql->execute();
		$result = $sql->get_result();
		return $result;
		$conn->close();
	}
	public function UPDATE($table, $where, $dataIn){
		$bindParam = new BindParam();
		$x = count($dataIn);
		for ($n = 0; $n < $x; $n++) {
			$bindParam->add($dataIn[$n][2], $dataIn[$n][1]);
			$column[] = $dataIn[$n][0] . ' = ?';
		}
		$bindParam->add($where[2], $where[1]);
		$columns = implode(', ', $column);
		$conn = $this->Connection();
		$query = 'UPDATE ' . $table . ' SET ' . $columns . ' WHERE ' . $where[0] . ' = ?';
		$sql = $conn->prepare($query);
		call_user_func_array(array($sql, 'bind_param'), $bindParam->get());
		$sql->execute();
		if ($sql->affected_rows === 1) {
			return true;
		} else {
			return false;
		}
		$conn->close();
	}
	public function DELETE($table, $idColumn, $idValue){
		$conn = $this->Connection();
		$sql = $conn->prepare('DELETE FROM ' . $table . ' WHERE ' . $idColumn . ' = ?');
		$sql->bind_param('s', $idValue);
		$sql->execute();
		if ($sql->affected_rows === 1) {
			return true;
		} else {
			return false;
		}
		$conn->close();
	}
	public function COUNT($table){
		$conn = $this->Connection();
		$query = 'SELECT COUNT(*) FROM ' . $table;
		$sql = $conn->prepare($query);
		$sql->execute();
		$result = $sql->get_result();
		return $result;
		$conn->close();
	}
	public function FIND($table, $selectColumns, $wheres, $whereGlue = ' AND '){
		$selects = implode(', ', $selectColumns);
		$bindParam = new BindParam();
		$x = count($wheres);
		for ($n = 0; $n < $x; $n++) {
			$bindParam->add($wheres[$n][2], $wheres[$n][1]);
			$where[] = $wheres[$n][0] . " LIKE CONCAT('%',?,'%')";
		}
		$whereColumns = implode($whereGlue, $where);
		$conn = $this->Connection();
		$query = 'SELECT ' . $selects . ' FROM ' . $table . ' WHERE ' . $whereColumns;
		$sql = $conn->prepare($query);
		call_user_func_array(array($sql, 'bind_param'), $bindParam->get());
		$sql->execute();
		$result = $sql->get_result();
		return $result;
		$conn->close();
	}
}
?>
