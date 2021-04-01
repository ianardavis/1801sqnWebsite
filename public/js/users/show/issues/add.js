window.addEventListener( "load", function () {
    remove_attribute({id: 'btn_issue_add', attribute: 'disabled'});
    document.querySelector('#selectedSize_link').addEventListener('click', selectSize)
    addFormListener(
        'issue_add',
        'POST',
        '/issues',
        {onComplete: getIssues}
    );
});