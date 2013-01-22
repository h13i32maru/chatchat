chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.getSelected(null, function(tab) {
    chrome.tabs.sendMessage(tab.id, {cmd: "toggle-style"}, function(response) {
    });
  });
});

//コンテキストメニューに追加
var chatworkContext = chrome.contextMenus.create(
  {
    "title" : "ChatWorkUtil",
    "contexts":["selection"],
    "documentUrlPatterns":[
      "https://kcw.kddi.ne.jp/*",
      "https://www.chatwork.com/*",
    ],
  }
);
//infomationHelper
chrome.contextMenus.create({
  "title" : "インフォメーション",
  "contexts": ["selection"], 
  "parentId" : chatworkContext,
  "onclick": infomationHelper
});
function infomationHelper(info, tab) {
  chrome.tabs.executeScript(
    null, 
    {
      file: "infomation.js", 
      allFrames: true
    }
  );
}