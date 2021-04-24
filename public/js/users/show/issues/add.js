window.addEventListener( "load", function () {
    enable_button('issue_add');
    document.querySelector('#selectedSize_link').addEventListener('click', selectSize)
    addFormListener(
        'issue_add',
        'POST',
        '/issues',
        {onComplete: getIssues}
    );
});