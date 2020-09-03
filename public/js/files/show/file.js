showFile = (files, na) => {
    if (files.length === 1) {
        for (let [id, value] of Object.entries(files[0])) {
            try {
                let element = document.querySelector('#' + id);
                if (element) element.innerText = value;
            } catch (error) {console.log(error)};
        };
        let edit_link = document.querySelector('#edit_link');
        if (edit_link) edit_link.href = `javascript:edit("files",${files[0].file_id})`;
    } else alert(`${files.length} matching files found`);
};