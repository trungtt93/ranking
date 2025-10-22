
var members = readJsonFile('data/members.json');

function readJsonFile(filePath) {
    return $.getJSON(filePath, function(data) {
        return data;
    });
}