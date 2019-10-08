<?php
function decrypt($encrypted) {
	require_once 'Encryption.php';
	$encryption = new Encryption;
	return $encryption->decrypt($encrypted);
}
function encrypt($decrypted) {
	require_once 'Encryption.php';
	$encryption = new Encryption;
	return $encryption->encrypt($decrypted);
}

$clientIp = $_SERVER['REMOTE_ADDR'];
if ($_POST['request'] == 'newSession') {
	require_once 'session.php';
	$Session = new Session;
	$data = $Session->set($clientIp);
	echo json_encode($data);
} else {
	try {
		#$request = json_decode(decrypt($_POST['request']), true);
		$request = json_decode($_POST['request'], true);
		$table = $request['table'];
		$function = $request['function'];
		#error_log("table: " . $table . " - function: " . $function);
		if ($table == 'login') {
			require_once 'login.php';
			$Login = new Login;
			if ($function == 'process') {
				$data = $Login->process($request['username'], $request['password'], $request['loginType']);
			} else if ($function == 'openChangePW') {
				$data = $Login->openChangePW($request['userId']);
			} else {
				error_log("No request - table: " . $table . " - function: " . $function);
				$data = array("success" => false, "reason" => "no request");
			}
		} else if ($table == 'session') {
			require_once 'session.php';
			$Session = new Session;
			if ($function == 'set') {
				$data = $Session->set($clientIp);
			} else if ($function == 'check') {
				$data = $Session->check($clientIp);
			} else if ($function == 'clear') {
				$data = $Session->clear($clientIp);
			} else if ($function == 'get') {
				$data = $Session->getSession();
			} else if ($function == 'permission') {
				$data = $Session->getPermission($request['permission']);
			} else {
				error_log("No request - table: " . $table . " - function: " . $function);
				$data = array("success" => false, "reason" => "no request");
			}
		} else if ($table == 'notes'){
			require_once 'notes.php';
			$Notes = new Notes;
			if ($function == 'get') {
				$data = $Notes->get($request['linkTable'], $request['linkValue'], $request['sys']);
			} else {
				error_log("No request - table: " . $table . " - function: " . $function);
				$data = array("success" => false, "reason" => "no request");
			}
		} else if ($table == 'options') {
			require_once 'options.php';
			$Options = new Options;
			if ($function == 'get') {
				$data = $Options->get($request['combo']);
			} else {
				error_log("No request - table: " . $table . " - function: " . $function);
				$data = array("success" => false, "reason" => "no request");
			}
		} else if ($table == 'cadets') {
			require_once 'cadets.php';
			$Cadets = new Cadets();
			if ($function == 'count') {
				$data = $Cadets->rowCount();
			} else if ($function == 'get'){
				$data = $Cadets->selectRow($request['rowId']);
			} else if ($function == 'select'){
				$data = $Cadets->selectCadet($request['cadet_id']);
			} else if ($function == 'resetPW'){
				$data = $Cadets->resetPW($request['cadetId']);
			} else if ($function == 'changePW'){
				$data = $Cadets->changePW($request['currentPW'], $request['newPW']);
			} else if ($function == 'delete'){
				$data = $Cadets->delete($request['cadetId']);
			} else if ($function == 'status'){
				$data = $Cadets->status($request['cadetId'], $request['status']);
			} else if ($function == 'add'){
				$data = $Cadets->add($request['details']);
			} else if ($function == 'edit'){
				$data = $Cadets->edit($request['details']);
			} else if ($function == 'find'){
				$data = $Cadets->find($request['details']);
			} else if ($function == 'openChangePW'){
				$data = $Cadets->openChangePW($request['cadetId']);
			} else {
				error_log("No request - table: " . $table . " - function: " . $function);
				$data = array("success" => false, "reason" => "no request");
			}
		} else if ($table == 'items') {
			require_once 'items.php';
			$Items = new Items();
			if ($function == 'count') {
				$data = $Items->rowCount();
			} else if ($function == 'get'){
				$data = $Items->selectRow($request['rowId']);
			} else if ($function == 'select'){
				$data = $Items->selectItem($request['item_id']);
			} else if ($function == 'delete'){
				$data = $Items->delete($request['itemId']);
			} else if ($function == 'add'){
				$data = $Items->add($request['details']);
			} else if ($function == 'editDetails'){
				$data = $Items->edit($request['details'], 'items');
			} else if ($function == 'editOrdering'){
				$data = $Items->edit($request['details'], 'items_ordering');
			} else if ($function == 'find'){
				$data = $Items->find($request['details']);
			} else {
				error_log("No request - table: " . $table . " - function: " . $function);
				$data = array("success" => false, "reason" => "no request");
			}
		} else if ($table == 'users') {
			require_once 'users.php';
			$Users = new Users;
			if ($function == 'changePW'){
				$data = $Users->changePW($request['currentPW'], $request['newPW']);
			} else {
				error_log("No request - table: " . $table . " - function: " . $function);
				$data = array("success" => false, "reason" => "no request");
			}
		} else if ($table == 'suppliers') {
			require_once 'suppliers.php';
			$Suppliers = new Suppliers;
			if ($function == 'getIdNames'){
				$data = $Suppliers->get_all_id_name();
			} else {
				error_log("No request - table: " . $table . " - function: " . $function);
				$data = array("success" => false, "reason" => "no request");
			}
		} else {
			error_log("No request - table: " . $table . " - function: " . $function);
			$data = array("success" => false, "reason" => "no request");
		}
	} catch (Exception $e) {
		error_log("phpCaller exception: " . $e->getMessage());
		$data = array("success" => false, "reason" => 'unknown');
	}
	#echo encrypt(json_encode($data));
	echo json_encode($data);
}
?>
