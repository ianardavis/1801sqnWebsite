showNSN = (nsns, options) => {
    if (nsns.length === 1) {
        for (let [id, value] of Object.entries(nsns[0])) {
            try {
                let element = document.querySelector('#' + id);
                if (element) element.innerText = value;
            } catch (error) {console.log(error)};
        };
        let _edit = document.querySelector('#edit_link');
        if (_edit) _edit.href = `javascript:edit("nsns",${nsns[0].nsn_id})`;
    } else alert(`${nsns.length} matching NSNs found`);
};