module.exports = function copyTextToClipboard (text) {
  var textArea = document.getElementById("copy-paste-dummy");
  textArea.value = text;
  textArea.select();
  try {
    var successful = document.execCommand('copy');
  } catch (err) {

  }
}
