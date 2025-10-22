
var members = readJsonFile('data/members.json');
console.log(members)
function readJsonFile(filePath) {
    return $.getJSON(filePath, function(data) {
        return data;
    });
}