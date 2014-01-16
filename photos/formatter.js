// Used with node to format all the .txt files
// Trims all whitespace

// Creates a concatenated result:

var concat = 'all-names-';
var extensions = ['txt', 'html'];

var fs = require('fs');
var files = fs.readdirSync('.');

var total = {};
extensions.forEach(function (ext) { total[ext] = {}; });

for (var i=0; i<files.length; ++i) {
  var dot_pos = files[i].lastIndexOf('.');
  var ext = files[i].slice(dot_pos + 1);
  var file_name = files[i].slice(0, dot_pos);

  if (extensions.indexOf(ext) > -1) {
    console.log('> Processing: %s', files[i]);
    var str = fs.readFileSync(files[i]).toString();
    str = str.replace(/\s+/g, ' ');
    fs.writeFileSync(files[i], str);
    total[ext][file_name] = str;
  }
}

extensions.forEach(function (ext) {
  fs.writeFileSync(concat + ext + '.json', JSON.stringify(total[ext], null, 2));
});