function selectText(textField) {
  textField.focus();
  textField.select();
}

function goTime() {
  var string = $('#string-text').val();
  var qrtext = $('#qr-text').val();
  console.log(string);
  console.log(qrtext);
  if (string.length == 0) {
    string = 'http://thepaulbooth.com/qrcode';
  }
  $('#result-div').remove();
  $('#content').append($('<div id="loading">Loading...</div>'));
  $.get('create?string=' + encodeURIComponent(string) + '&qrtext=' + qrtext, function(data) {
    var $resultdiv = $('<div></div>');
    $resultdiv.attr('id', 'result-div');

    var $resultimage = $('<img>');
    $resultimage.attr('src', data.image);
    $resultimage.attr('id', 'result-img');
    $resultdiv.append($resultimage);

    var $resulttext = $('<div></div>');
    if (data.result) {
      if (data.result == string) {
        $resulttext.addClass('result-correct');
        $resulttext.html('<b>Success!</b> <a href="' + data.result + '">' + data.result + '</a>');
      } else {
        $resulttext.addClass('result-incorrect');
        $resulttext.html('<b>Oops!</b> <a href="' + data.result + '">' + data.result + '</a>');
      }
    } else {
      $resulttext.addClass('result-incorrect');
      $resulttext.html('<b>Couldn\'t read QR code.</b> Might work anyway.');
    }
    $resultdiv.append($resulttext);

    var $resultcode = $('<input type="text">');
    $resultcode.attr('id', 'codebox');
    $resultcode.val('<img src="' + data.image + '">');
    $resultcode.attr('onClick', 'selectText(this);');
    $resultdiv.append($resultcode);

    $('#loading').remove();
    $('#content').append($resultdiv);

  });
  // 
}