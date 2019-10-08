<?php
class Items {
	function permission($perm) {
		require_once 'session.php';
		$session = new Session;
		return $session->getPermission($perm);
	}
	public function rowCount() {
		require_once 'mySql.php';
		$mySQL = new mySQL();
		$result = $mySQL->COUNT('items');
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
		$result = $mySQL->SELECT_ROW('items', 
									array('item_id', '_description', '_size', '_gender', '_category', '_type', '_sub_type'),
									'item_id',
									$rowId);
		if ($result->num_rows == 1) {
			$item = $result->fetch_assoc();
			$itemDetails = array("item"=>json_encode($item));
			$stock = $this->getStock($item['item_id']);
			$ordering = $this->getOrdering($item['item_id']);
			$locations = $this->getLocations($item['item_id']);
			$stocknums = $this->getStocknums($item['item_id']);
			return array("success" => true, "rowData" => json_encode(array_merge($itemDetails, $stock, $ordering, $locations, $stocknums)));
		} else if ($result->num_rows > 1) {
			return array("success" => false, "reason" => "multiple");
		} else if ($result->num_rows == 0) {
			return array("success" => false, "reason" => "none");
		}
	}
	public function selectItem($itemId) {
		require_once 'mySql.php';
		$mySQL = new mySQL();
		$result = $mySQL->SELECT('items', 
								 array('item_id', '_description', '_size', '_gender', '_category', '_type', '_sub_type'),
								 array(array('item_id', $itemId, 'i')));
		if ($result->num_rows == 1) {
			$item = $result->fetch_assoc();
			$itemDetails = array("item"=>json_encode($item));
			$stock = $this->getStock($item['item_id']);
			$ordering = $this->getOrdering($item['item_id']);
			$locations = $this->getLocations($item['item_id']);
			$stocknums = $this->getStocknums($item['item_id']);
			return array("success" => true, "rowData" => json_encode(array_merge($itemDetails, $stock, $ordering, $locations, $stocknums)));
		} else if ($result->num_rows > 1) {
			return array("success" => false, "reason" => "multiple");
		} else if ($result->num_rows == 0) {
			return array("success" => false, "reason" => "none");
		}
	}
	public function getStock($itemId) {
		require_once 'mySql.php';
		$mySQL = new mySQL();
		$result = $mySQL->SELECT('items_stock', 
								 array('_qty_stock', '_qty_order', '_qty_issued'),
								 array(array('item_id', $itemId, 'i')));
		if ($result->num_rows == 1) {
			$row = $result->fetch_assoc();
			return array("stock"=>json_encode($row));
		} else {
			return array("s"=>null);
		}
	}
	public function getOrdering($itemId) {
		require_once 'mySql.php';
		$mySQL = new mySQL();
		$result = $mySQL->SELECT('items_ordering', 
								 array('supplier_id', '_demand_page', '_cell', '_details'),
								 array(array('item_id', $itemId, 'i')));
		if ($result->num_rows == 1) {
			$row = $result->fetch_assoc();
			return array("ordering"=>json_encode($row));
		} else {
			return array("ordering"=>null);
		}
	}
	public function getLocations($itemId) {
		require_once 'mySql.php';
		$mySQL = new mySQL();
		$result = $mySQL->SELECT('items_locations', 
								 array('_location'),
								 array(array('item_id', $itemId, 'i')));
		if ($result->num_rows > 0) {
			while ($row = $result->fetch_assoc()) {$rows[] = $row;}
			return array("locations"=>json_encode($rows));
		} else if ($result->num_rows == 0) {
			return array("locations"=>null);
		}
	}
	public function getStocknums($itemId) {
		require_once 'mySql.php';
		$mySQL = new mySQL();
		$result = $mySQL->SELECT('items_stocknum', 
								 array('_stocknum'),
								 array(array('item_id', $itemId, 'i')));
		if ($result->num_rows > 0) {
			while ($row = $result->fetch_assoc()) {$rows[] = $row;}
			return array("stocknums"=>json_encode($rows));
		} else if ($result->num_rows == 0) {
			return array("stocknums"=>null);
		}
	}
	function hasOrders($itemId) {
		require_once 'orders.php';
		$orders = new Orders();
		$result = $orders->rowCount($itemId);
		if ($result == 0) {
			return false;
		} else {
			return true;
		}
	}
	function hasNotes($itemId) {
		require_once 'notes.php';
		$notes = new Notes();
		$result = $notes->rowCount($itemId);
		if ($result == 0) {
			return false;
		} else {
			return true;
		}
	}
	function hasIssues($itemId) {
		require_once 'issues.php';
		$issues = new Issues();
		$result = $issues->rowCount($itemId);
		if ($result == 0) {
			return false;
		} else {
			return true;
		}
	}
	function hasRequests($itemId) {
		require_once 'requests.php';
		$requests = new Requests();
		$result = $requests->rowCount($itemId);
		if ($result == 0) {
			return false;
		} else {
			return true;
		}
	}
	public function delete($itemId) {
		if ($this->Permission('items_delete')) {
			if ($this->hasNotes($itemId ) == false) {
				if ($this->hasOrders($itemId ) == false) {
					if ($this->hasIssues($itemId ) == false) {
						if ($this->hasRequests($itemId ) == false) {
							require_once 'mySql.php';
							$mySQL = new mySQL();
							$result = $mySQL->DELETE('items', 'item_id', $itemId);
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
	public function add($details) {
		if ($this->permission('items_add')) {
			require_once 'mySql.php';
			$mySQL = new mySQL();
			$result = $mySQL->SELECT('items', 
									 array('_description'), 
									 array(array('_description', $details['_description'], 's'), array('_size', $details['_size'], 's')));
			if ($result->num_rows == 0) {
				$item = array();
				foreach ($details as $key => $value) {
					$item[] = array($key, $value, 's');
				}
				unset($value);
				unset($key);
				$result = $mySQL->INSERT('items',
										 $item);
				if ($result != 'failed') {
					return array("success" => true, "id" => $result);
				} else {
					return array("success" => false, "reason" => "insert");
				} 
			} else {
				return array("success" => false, "reason" => "description/size");
			}
		} else {
			return array("success" => false, "reason" => "permission");
		}
	}
	public function edit($details, $table) {
		if ($this->permission('items_edit')) {
			require_once 'mySql.php';
			$mySQL = new mySQL();
			$result = $mySQL->SELECT($table, 
									 array('item_id'), 
									 array(array('item_id', $details['item_id'], 'i')));
			if ($result->num_rows == 1) {
				$item = array();
				foreach ($details as $key => $value) {
					if ($key == 'item_id') {
						$where = array($key, $value, 'i');
					} else {
						$item[] = array($key, $value, 's');
					}
				}
				unset($value);
				unset($key);
				$result = $mySQL->UPDATE($table,
										 $where,
										 $item);
				if ($result == true) {
					return array("success" => true);
				} else {
					return array("success" => false, "reason" => "update");
				}
			} else {
				return array("success" => false, "reason" => "no item");
			}
		} else {
			return array("success" => false, "reason" => "permission");
		}
	}
	public function find($details) {
		if ($this->permission('items_search')) {
			require_once 'mySql.php';
			$mySQL = new mySQL();
			foreach ($details as $key => $value) {
				if ($key == 'item_id') {
					$where[] = array($key, $value, 'i');
				} else {
					$where[] = array($key, $value, 's');
				}
			}
			$result = $mySQL->FIND('items',
								   array('item_id', '_description', '_size', '_gender', '_category', '_type', '_sub_type'),
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
}
?>
