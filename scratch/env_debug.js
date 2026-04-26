const fs = require('fs');
fs.writeFileSync('env_debug.txt', JSON.stringify(process.env, null, 2));
console.log("Done");
