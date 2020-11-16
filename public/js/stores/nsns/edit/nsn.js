showNSN = (nsns, options) => {
    if (nsns.length === 1) {
        for (let [id, value] of Object.entries(nsns[0])) {
            try {
                let element = document.querySelector('#' + id);
                if (['group', 'classification', 'country'].includes(id)) {
                    element.value = String(value._code).padStart(2, '0');
                } else if (element) element.value = value;
            } catch (error) {console.log(error)};
        };
    } else alert(`${nsns.length} matching NSNs found`);
};