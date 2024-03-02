function getSite() {
    function disableAllButtons() {

    };
    function displayDetails([site, options]) {

        return site;
    };
    function setButtonStates(site) {

        return site;
    };

    disableAllButtons();
    get({
        table: 'site',
        where: {site_id: path[2]}
    })
    .then(displayDetails)
    .then(setButtonStates)
    .then(setSiteIDValues)
    .catch(err => redirectOnError(err, '/sites'));
};
window.addEventListener('load', function () {
    getSites();
});