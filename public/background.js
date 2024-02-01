/* eslint-disable no-undef */
var timer = null;

function scheduleNotifications(data) {
  clearInterval(timer);
  const {
    time,
    text,
    name,
  } = data;
  const second = Number(time) * 1000 * 60;

  timer = setInterval(function() {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: '/icons/icon192.png',
      title: name ?? '',
      message: text
    });
  }, second);
}


function initNotifications() {
  chrome.storage.sync.get(['time', 'text', 'open', 'name'], function(data) {
    if (data.open) {
      scheduleNotifications(data);
    } else {
      clearInterval(timer);
    }
  });
}

chrome.runtime.onInstalled.addListener(function() {
  initNotifications();
});

chrome.runtime.onMessage.addListener(function (request) {
  if (request.action === 'resetNotification') {
    // 在这里执行触发的方法
    initNotifications();
  }
});

