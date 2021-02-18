let {PythonShell} = require('python-shell')

// let pyshell = new PythonShell('./python/main.py')
let options = {
    mode: 'JSON',
    args: ['Hi']
};

PythonShell.run('./python/main.py', options, (err, results) => {
    if (err) throw err;
    // results is an array consisting of messages collected during execution
    console.log('results: %j', results);
});