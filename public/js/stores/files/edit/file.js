showFile = (files, na) => {
    if (files.length === 1) {
        for (let [id, value] of Object.entries(files[0])) {
            try {
                let element = document.querySelector('#' + id);
                if (id === '_path') element.innerText = value
                else if (element) element.value = value;
            } catch (error) {console.log(error)};
        };
    } else alert(`${files.length} matching files found`);
};