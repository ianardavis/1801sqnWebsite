module.exports = function(results) {
    let rejects = results.filter(e => e.status === 'rejected');
    rejects.forEach(reject => console.log(reject));
    return (rejects.length === 0);
};