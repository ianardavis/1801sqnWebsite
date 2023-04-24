module.exports = function () {
    return new Promise((resolve, reject) => {
        const port = process.env.PORT
        const execSync = require('child_process').execSync;
        const runCmd = function (cmd) {
            return execSync(cmd, { encoding: 'utf-8' });
        };
        try {
            const output = runCmd(`ss -tnlp | grep :${port}`);
            const pid = output.substring(output.indexOf('pid=') + 4, output.indexOf(',', output.search('pid=')));
            console.log(`Port ${port} in use by PID ${pid}`);
            try {
                const kill_output = runCmd(`kill -9 ${pid}`);
                console.log('   PID killed');
                resolve(port);

            } catch (error) {
                reject(error);
            
            };
        } catch (error) {
            if (error.output[0]) {
                reject(error);

            } else {
                resolve(port);
                
            };
        };
    });
};