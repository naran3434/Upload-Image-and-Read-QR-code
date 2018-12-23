/**
 * Created by naran on 23/12/18.
 */

var http = require('http');
var formidable = require('formidable');
var fs = require('fs');
var Jimp = require("jimp");
var QrCode = require('qrcode-reader');

http.createServer(function (req, res) {
    if (req.url === '/fileupload') {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            var oldpath = files.filetoupload.path;
            var newpath = __dirname + files.filetoupload.name;
            fs.rename(oldpath, newpath, function (err) {
                if (err) throw err;
                var buffer = fs.readFileSync(newpath);

                Jimp.read(buffer, function(err, image) {
                    if (err) {
                        res.write(JSON.stringify({success: false, error: err}));
                        res.end();
                    }
                    var qr = new QrCode();
                    qr.callback = function(err, value) {
                        if (err) {
                            res.write(JSON.stringify({success: false, error: err}));
                            res.end();
                            // TODO handle error
                        }else{
                            res.write(JSON.stringify({success: true, data: value}));
                            res.end();
                        }

                    };
                    qr.decode(image.bitmap);
                });


            });
        });
    } else {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write('<form action="fileupload" method="post" enctype="multipart/form-data">');
        res.write('<input type="file" name="filetoupload"><br>');
        res.write('<input type="submit">');
        res.write('</form>');
        return res.end();
    }
}).listen(8700);