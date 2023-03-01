const fs = require('fs');

function fileLog(text) {
    const date = new Date();
    const dateStr = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    const log = `[${dateStr}] ${text}
`;
    fs.appendFileSync('./src/dataBase/logs.txt', log)
}

module.exports = {
    fileLog
}