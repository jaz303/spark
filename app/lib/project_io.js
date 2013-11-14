var fs = require('fs'),
    path = require('path');

var ERR_PROJ_FILE_CORRUPT   = "Project file corrupt, not parseable JSON",
    ERR_PROJ_NO_MODE        = "Invalid project file; no mode specifed",
    ERR_PROJ_ILLEGAL_MODE   = "Invalid project file; mode is not a string";

function projectFile(dir) {
    return path.join(dir, 'project.json');
}

function readProjectMode(dir, cb) {
    fs.readFile(projectFile(dir), {encoding: 'utf8'}, function(err, json) {
        if (err) {
            cb(err);
            return;
        }
        try {
            var data = JSON.parse(json);
        } catch (err) {
            cb(new Error(ERR_PROJ_FILE_CORRUPT));
            return;
        }
        if (!('mode' in data)) {
            cb(new Error(ERR_PROJ_NO_MODE));
            return;
        }
        if (typeof data.mode !== 'string') {
            cb(new Error(ERR_PROJ_ILLEGAL_MODE));
            return;
        }
        cb(null, data.mode);
    });
}

exports.projectFile = projectFile;
exports.readProjectMode = readProjectMode;