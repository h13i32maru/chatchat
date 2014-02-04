var textArea = document.getElementById('cw_chattext');

if(textArea) {
  //フォーカス判定
  if(document.activeElement.id == "cw_chattext") {
    //フォーカスがtextareaにある場合は、選択されたSTRINGをmeintextにしましょう。
    //キャレットを取得しましょう
    startPos = textArea.selectionStart;
    endPos = textArea.selectionEnd;
    newString = "[info][title]" + textArea.value.substr(0,startPos) + "[/title]" + textArea.value.substr(startPos , endPos - startPos) + "[/info]" + textArea.value.substr(endPos , textArea.value.length - endPos);
    textArea.value = newString;
  }else{
    //他の部分のフォーカスなので、選択している文字列を受け取りましょう！
    selection = window.getSelection();
    selectionString = selection.toString();
    curString= textArea.value;
    newString = "[info][title]" + curString + "[/title]" + selectionString + "[/info]";
    //textareに何も入力されていなかった場合に入力後フォーカスを当てると、初期化されるので先にあてておきましょう。
    textArea.focus();
    textArea.value = newString;
  }
}
