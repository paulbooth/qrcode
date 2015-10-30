var QRCode = require('qrcode');
var PNG = require('png-js');
var fs = require('fs');
var Canvas = require('canvas')
      , Image = Canvas.Image
      , qrcode = require('jsqrcode')(Canvas);
var express = require('express'),
    http = require('http');
var bodyParser = require('body-parser');

var app = express();
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
var server = http.createServer(app);

var port = process.env.PORT;

app.get('/create/:string/:qrtext', function(req, res) {
  var string = req.params.string;
  var qrtext = req.params.qrtext;
  getQRCode(string, qrtext, function(dataURI, result) {
    res.json({image:dataURI, result:result});
  });
});

app.get('/create', function(req, res) {
  var string = decodeURIComponent(req.query["string"]);
  var qrtext = req.query["qrtext"];
  console.log(string);
  console.log(qrtext);
  console.log('--------');
  getQRCode(string, qrtext, function(dataURI, result) {
    res.json({image:dataURI, result:result});
  });
});

app.get('/', function(req, res) {
  res.render('index.jade');
});

// getQRCode(string, qrtext);
// string - string to be encoded
// qrtext - text to be displayed over
// callback - function that takes dataURI of QR code and the result of using a reader
function getQRCode(string, qrtext, callback) {
  QRCode.draw(string,function(err,canvas){
    var ctx = canvas.getContext('2d');
    var letterImage = new PNG.load(__dirname + '/letters.png');
    letterImage.decode(function (letterPixels) {
      // letterPixels is a 1D array containing pixel data

      var blockSize = 4, marginSize = 20;
      var qrcodeWidth = Math.floor((canvas.width - marginSize * 2) / blockSize); // this seems to work.
      var textWidth = getTextWidth(qrtext), textHeight = 5;
      var offsetX = Math.floor( (qrcodeWidth - textWidth) / 2), offsetY = Math.floor(qrcodeWidth / 2) - 3;

      function drawPixel(x, y, white) {
        ctx.beginPath();
        ctx.moveTo(marginSize+blockSize*x, marginSize+blockSize*y);
        ctx.lineTo(marginSize + blockSize * x, marginSize + blockSize * (y + 1));
        ctx.lineTo(marginSize + blockSize * (x + 1), marginSize + blockSize * (y + 1));
        ctx.lineTo(marginSize + blockSize * (x + 1), marginSize + blockSize * (y));
        ctx.closePath();
        ctx.fillStyle = white ? "#FFF" : "#000";
        ctx.fill();
      }

      function getTextWidth(qrtext) {
        var width = 0;
        for (var i = 0; i < qrtext.length; i++) {
          width += getLetterWidth(getLetterCode(qrtext, i))
        }

        // and spaces
        if (qrtext.length > 0) {
          width += qrtext.length - 1;
        }
        return width;
      }

      function getLetterCode(text, index) {
        if (index === undefined) {
          index = 0;
        }
        var letterCode = text.charCodeAt(index) - 65; // uppercase
        
        if (letterCode == -33) {// space
          letterCode = 26;
        }
        if (letterCode > 31) { // lowercase
          letterCode = letterCode - 32 + 27;
        }

        return letterCode;
      }

      function getLetterWidth(letterCode) {
        var letterWidth = 3;
        if (letterCode == 12) letterWidth = 5; // m
        if (letterCode == 13) letterWidth = 4; // n
        if (letterCode == 22) letterWidth = 5; // w

        if (letterCode > 26) letterWidth = 2; // lowercase
        if (letterCode == 34) letterWidth = 3; // h
        if (letterCode == 35) letterWidth = 1; // i
        if (letterCode == 37) letterWidth = 3; // k
        if (letterCode == 39) letterWidth = 5; // m
        if (letterCode == 40) letterWidth = 3; // n
        if (letterCode == 41) letterWidth = 3; // o
        if (letterCode == 43) letterWidth = 3; // q
        if (letterCode >= 47) letterWidth = 3; // u v w x y z
        if (letterCode == 49) letterWidth = 5; // w
        if (letterCode == 52) letterWidth = 2; // z
        return letterWidth;
      };

      function drawLetter(letterCode, x, y) {
        var letterOffset = 4 * letterCode;
        if (letterCode > 27) {
          letterOffset -= letterCode - 27;
        }
        if (letterCode > 12) { // M
          letterOffset += 2;
          if (letterCode > 13) { // N
            letterOffset++;
            if (letterCode > 22) { // W
              letterOffset += 2;
              if (letterCode > 34) { // h
                letterOffset++;
                if (letterCode > 35) { // i
                  letterOffset--;
                  if (letterCode > 37) { // k
                    letterOffset++;
                    if (letterCode > 39) { // m
                      letterOffset += 3;
                      if (letterCode > 40) { // n
                        letterOffset++;
                        if (letterCode > 41) { // o
                          letterOffset++;
                          if (letterCode > 43) { // q
                            letterOffset++;
                            if (letterCode > 47) { // u v w x y z
                              letterOffset += letterCode - 47;
                              if (letterCode > 49) {
                                letterOffset += 2;
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }

        var letterWidth = getLetterWidth(letterCode);
        for (var letterY = 0; letterY < 5; letterY++) {
          for (var letterX = 0; letterX < letterWidth; letterX++) {
            var white = letterPixels[4 * (letterOffset + letterX + letterImage.width * letterY)];
            drawPixel(x + letterX, y + letterY, white);
          }
        }
      }

      function drawText(qrtext, x, y) {
        for (var i = 0; i < qrtext.length; i++) {
          var letterCode = getLetterCode(qrtext, i);
          drawLetter(letterCode, x, y);
          x += getLetterWidth(letterCode) + 1;
        }
      }

      // draws a red grid for the qrcode
      // ctx.strokeStyle = '#F00';
      // for (var i = 0; i < 30; i++) {
      //   ctx.beginPath();
      //   ctx.moveTo(marginSize+blockSize*i, marginSize);
      //   ctx.lineTo(marginSize+blockSize*i, marginSize + 29 * blockSize);
      //   ctx.moveTo(marginSize, marginSize+blockSize*i);
      //   ctx.lineTo(marginSize + 29 * blockSize, marginSize+blockSize*i);
      //   ctx.stroke();
      // }

      function clearSpot(offsetX, offsetY, width, height) {
        ctx.beginPath();
        ctx.moveTo(marginSize+blockSize*offsetX, marginSize+blockSize*offsetY);
        ctx.lineTo(marginSize + blockSize * offsetX, marginSize + blockSize * (offsetY + height));
        ctx.lineTo(marginSize + blockSize * (offsetX + width), marginSize + blockSize * (offsetY + height));
        ctx.lineTo(marginSize + blockSize * (offsetX + width), marginSize + blockSize * (offsetY));
        ctx.closePath();
        ctx.fillStyle = "#FFF";
        ctx.fill();
      }
      if (qrtext.length > 0) {
        clearSpot(offsetX - 1, offsetY - 1, textWidth + 2, textHeight + 2);
        drawText(qrtext, offsetX, offsetY);
      }
      // console.log(canvas.toDataURL());


      var filename = canvas.toDataURL();

      var image = new Image();
      image.onload = function(){
        var result;
        try{
          result = qrcode.decode(image);
          if (callback) {
            callback(filename, result);
          } else {
            console.log(filename);
            console.log('result of qr code: ' + result);
          }
        }catch(e){
          if (callback) {
            callback(filename, null);
          } else {
            console.log(filename);
            console.log('unable to read qr code');
          }
        }
      }
      image.src = filename;
      // var base64Data = filename.replace(/^data:image\/png;base64,/,"");

      // fs.writeFile(qrtext + ".png", base64Data, 'base64', function(err) {
      //   console.log(err);
      // });
    });
  });
}

server.listen(port);