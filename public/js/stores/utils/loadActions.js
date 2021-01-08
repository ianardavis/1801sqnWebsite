function loadActions() {
    let actions_interval = window.setInterval(
        function () {
            if (lines_loaded === true) {
                getLineActions();
                clearInterval(actions_interval);
            }
        },
        500
    );
};
document.querySelector('#reload').addEventListener('click', loadActions);