window.addEventListener( "load", function () {
    addListener('selectedSize_link', selectSize)
    enable_button('issue_add');
    addFormListener(
        'issue_add',
        'POST',
        '/issues',
        {onComplete: getIssues}
    );
});