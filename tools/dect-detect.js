var fs = require('fs');
var execSync = require('execSync');

var basePath = 'app/javascripts/nls/root/';
var files = fs.readdirSync(basePath);

var out = '';
var duplicated = '';

var exist = [];

files.forEach(function (file) {
    if (/\.js/.test(file)) {
        var fileString = fs.readFileSync(basePath + file, 'utf-8');
        var content = 'var obj = ' + fileString.replace('define(', '').replace(');', ';').replace(/\/\*.*\*\//gi, '');
        eval(content);
        var key;
        var result;
        for (key in obj) {
            var originKey = key;
            key = 'i18n.' + file.replace('.js', '') + '.' + key;
            result = execSync.exec('grep -rl ' + '"' + key + '" ./app/javascripts');
            if (result.stdout === '') {
                out += key + '\n';
            }

            if (exist.indexOf(obj[originKey]) < 0) {
                exist.push(obj[originKey]);
            } else {
                duplicated += key + '\n';
                console.warn('duplicated: ' + key);
            }
        }
    }
});

fs.open('result.txt', 'w', 0644, function (e, fd) {
    fs.write(fd, out, 0, 'utf8', function (e) {
        fs.closeSync(fd);
    });
});

fs.open('duplicated.txt', 'w', 0644, function (e, fd) {
    fs.write(fd, duplicated, 0, 'utf8', function (e) {
        fs.closeSync(fd);
    });
});
