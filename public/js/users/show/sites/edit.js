function enableSetDefaultSiteBtns() {
    document.querySelectorAll('.set_default_site_btn').forEach(e => {
        e.removeAttribute('disabled');
    });
};