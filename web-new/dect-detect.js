var fs = require('fs');
var execSync = require('execSync');

var basePath = 'app/javascripts/nls/root/';
var files = fs.readdirSync(basePath);

var out = '';

files.forEach(function (file) {
    if (/\.js/.test(file)) {
        var fileString = fs.readFileSync(basePath + file, 'utf-8');
        var content = 'var obj = ' + fileString.replace('define(', '').replace(');', ';').replace(/\/\*.*\*\//gi, '');
        eval(content);
        var key;
        var result;
        for (key in obj) {
            key = 'i18n.' + file.replace('.js', '') + '.' + key;
            result = execSync.exec('grep -rl ' + '"' + key + '" ./app/javascripts');
            if (result.stdout === '') {
                out += key + '\n';
            }
        }
    }
});

console.log(out);

fs.open('result.txt', 'w', 0644, function (e, fd) {
    fs.write(fd, out, 0, 'utf8', function (e) {
        fs.closeSync(fd);
    });
});