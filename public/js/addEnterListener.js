function addEnterListener(control, action, args = null) {
    var input = document.querySelector('#' + control);
        input.addEventListener("keyup", event => {
        if (event.keyCode === 13) {
            event.preventDefault();
            action(args)
        }
    });
};