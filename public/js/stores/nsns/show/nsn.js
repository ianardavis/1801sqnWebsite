showNSN = (nsns, options) => {
    if (nsns.length === 1) {
        for (let [id, value] of Object.entries(nsns[0])) {
            try {
                let element = document.querySelector('#' + id);
                if (['group', 'classification', 'country'].includes(id)) {
                    element.innerText = String(value._code).padStart(2, '0');
                    let descriptor = document.querySelector(`#_${id}`)
                    if (descriptor) descriptor.innerText = value[`_${id}`];
                } else if (element) element.innerText = value;
            } catch (error) {console.log(error)};
        };
        let _edit = document.querySelector('#edit_link');
        if (_edit) _edit.href = `javascript:edit("nsns",${nsns[0].nsn_id})`;
    } else alert(`${nsns.length} matching NSNs found`);
};