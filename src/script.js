//TODO: ロジックとHTMLとCSSが結合してるので分離する

Chatwork = {
  myInfo: null,
  contacts: null,
  $mentionDialog: null,

  init: function(){
    this.myInfo = this.getMyInfo();
    this.getContacts(this.myInfo, function(contacts){
      this.contacts = contacts;
      this.setupMentionButton();
    }.bind(this));
  },

  /**
   * アクセストークンやクライアントバージョンなどの情報を取得する
   */
  getMyInfo: function(){
    var info = {};
    var scriptText = $('#cw_all > script').first().text();

    info.token = /var ACCESS_TOKEN = '(\w+)'/.exec(scriptText)[1];
    info.myid = /var myid = '(\w+)'/.exec(scriptText)[1];
    info.clientVersion = /var client_ver = '([\w\d.]+)'/.exec(scriptText)[1];
    return info;
  },

  /**
   * 自分のコンタクトリストをchatworkサーバから取得する
   */
  getContacts: function(myInfo, callback){
    var url = 'https://kcw.kddi.ne.jp/gateway.php';
    var data = {};
    data['cmd'] = 'init_load';
    data['myid'] = myInfo.myid;
    data['_v'] = myInfo.clientVersion;
    data['_av'] = 4; //magic
    data['_t'] = myInfo.token;
    data['ln'] = 'ja';

    $.get(url, data, function(data){
      callback(data.result.contact_dat);
    }, 'json');
  },

  /**
   * メンションボタンをセットアップする
   */
  setupMentionButton: function(){
    var $sendToList = $('<div>Search</div>').addClass('cw_buttons clearfix mention');
    $sendToList.insertAfter('#cw_sendbutton_chat_mention');
    $sendToList.click(this.onClickMentionButton.bind(this));
  },

  /**
   * メンションのダイアログを生成する.
   * 一度生成したものをキャッシュして使いまわしている.
   */
  getMentionDialog: function(){
    if (this.$mentionDialog) {
      return this.$mentionDialog;
    }

    var $dialog = $('<div><input type="text" placeholder="名前検索"/><button>全員</button><ul></ul></div>').dialog(
    {
      autoOpen: false,
      close: function(event, ui) { $('#cw_chattext').focus(); }
    });

    //入力されたテキストをもとに絞込みを行う
    var self = this;
    $dialog.find('input').keyup(function(ev){
      if (ev.keyCode === 13) {
        //1ユーザに絞られた時だけエンターを有効にする
        if ($dialog.find('li:visible').size() !== 1) {
            return;
        }
        self.decide();
      } else {
        var inputText = $dialog.find('input').val().toLowerCase();
        $dialog.find('li').hide();
        $dialog.find('li[data-cw-name*="' + inputText + '"]').show();
      }
    });

    //全員ボタンをおされた時の処理
    $dialog.find('button').click(function(ev){
        self.decide(true);
    });

    this.$mentionDialog = $dialog;

    return $dialog;
  },

  /**
   * メンションボタンが押下された時にダイアログを表示する
   */
  onClickMentionButton: function(){
    //現在のチャットルームの一覧をアバター画像から取得する
    var $avatars = $('#cw_room_member_contact_list img'); 
    var size = $avatars.size();
    var mentions = [];
    var id, name;
    for (var i = 0; i < size; i++) {
      //アバター画像のクラス名にユーザのIDが入っている
      id = $avatars[i].className.match(/cw_a(\d+)/)[1];
      name = this.contacts[id].name;
      mentions.push({id: id, name: name});
    }

    //ダイアログにユーザのリストを挿入する
    var $dialog = this.getMentionDialog();
    $dialog.find('ul').html('');
    for (var i = 0; i < mentions.length; i++){
      $li = $('<li style="padding: 2px"/>');
      $li.text(mentions[i].name);
      $li.attr('data-cw-name', mentions[i].name.toLowerCase());
      $li.attr('data-cw-id', mentions[i].id);
      $dialog.find('ul').append($li);
    }

    //検索の見やすさのために一旦すべて非表示にしておく
    $dialog.find('li').hide();
    $dialog.find('input:text').val('');

    $dialog.dialog('open');
  },

  /**
   * 選択されているユーザをテキストエリアに挿入する.
   */
  decide: function(all){
    var $dialog = this.getMentionDialog();

    var $targets;
    var doClose = false;
    if (all) {
        $targets = $dialog.find('li');
        doClose = true;
    } else {
        $targets = $dialog.find('li:visible');
    }

    if ($targets.size() <= 0) {
      $dialog.dialog('close');
      return;
    }

    var mentions = [];
    var template = '[To:(id)] (name)さん';
    for (var i = 0; i < $targets.size(); i++) {
      var id = $targets.eq(i).attr('data-cw-id');
      var name = this.contacts[id].name;
      mentions.push(template.replace('(id)', id).replace('(name)', name));
    }

    //テキストエリアにすでに文字が入っていたらその文字の続きに文字列を挿入する.
    //focus()しているのはテキストエリアにフォーカスが移ると一旦文字列を削除するような仕様になっているため(chatworkの仕様)
    var val = $('#cw_chattext').focus().val();
    if (val) {
      $('#cw_chattext').val(val + mentions.join('\n') + '\n');
    } else {
      $('#cw_chattext').val(mentions.join('\n') + '\n');
    }

    $dialog.find('input[type="text"]').focus().val('');
    $dialog.find('li').hide();

    if (doClose) {
        $dialog.dialog('close');
    }
  }
};

$(Chatwork.init.bind(Chatwork));

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.cmd === 'toggle-style') {
    $(document.body).toggleClass('irc-style');
  }
  sendResponse('ok');
});
