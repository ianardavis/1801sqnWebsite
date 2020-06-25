exports.check = (port = 3000) => new Promise((resolve, reject) => {
    console.log('Checking port ' + port + ' is available');
    const execSync = require('child_process').execSync;
    try {
        const output = execSync('ss -tnlp | grep :' + port, { encoding: 'utf-8' });
        let pid = output.substring(output.indexOf('pid=') + 4, output.indexOf(',', output.search('pid=')));
        console.log('   In use by PID ' +  pid);
        try {
            const kill_output = execSync('kill -9 ' + pid, { encoding: 'utf-8' });
            resolve('   PID killed');
        } catch (error) {
            reject(error);
        };
    } catch (error) {
        if (error.output[0]) {
            reject(error);
        } else {
            resolve('   Not in use');
        };
    };
});