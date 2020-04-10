function changePassword(user_id) {
    let pwWindow = null;
    pwWindow = window.open('/stores/users/' + user_id + '/password?',
                      'chengePassword' + user_id,
                      'width=600,height=320,resizeable=no,location=no');
};