function RoundTime(string) {
    string = string.toString();
    for (let i = string.length; i < 2; i++) {
        string = '0' + string;
    }
    return string
}

module.exports = { RoundTime }