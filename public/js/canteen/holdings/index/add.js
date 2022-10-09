window.addEventListener('load', function () {
    addFormListener(
        'holding_add',
        'POST',
        `/holdings`,
        {onComplete: [
            getHoldings,
            function () {modalHide('holding_add')}
        ]}
    );
});