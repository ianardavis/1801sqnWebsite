module.exports = function() {
    return new Promise((resolve, reject) => {
        let port = process.env.PORT
        console.log(`Checking port ${port} is available`);
        const execSync = require('child_process').execSync;
        try {
            const output = execSync(`ss -tnlp | grep :${port}`, { encoding: 'utf-8' });
            let pid = output.substring(output.indexOf('pid=') + 4, output.indexOf(',', output.search('pid=')));
            console.log(`   In use by PID ${pid}`);
            try {
                const kill_output = execSync('kill -9 ' + pid, { encoding: 'utf-8' });
                console.log('   PID killed');
                resolve(port);
            } catch (error) {
                reject(error);
            };
        } catch (error) {
            if (error.output[0]) {
                reject(error);
            } else {
                console.log('   Not in use');
                resolve(port);
            };
        };
    });
};