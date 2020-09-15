changePassword = user_id => {
    let pwWindow = null;
    pwWindow = window.open('/stores/users/' + user_id + '/password?',
                      'changePassword' + user_id,
                      'width=600,height=630,resizeable=no,location=no');
};