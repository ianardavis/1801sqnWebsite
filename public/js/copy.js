copy = clip => {
    navigator.clipboard.writeText(clip).then(() => {
        alert('Detail copied');
    }, () => {
        alert('Not copied');
    });
};