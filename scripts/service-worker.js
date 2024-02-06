const GREEN_COLOR = '#2db552';
const GRAY_COLOR = '#828282';

chrome.action.setBadgeText({ text: 'ON' });
chrome.action.setBadgeBackgroundColor({ color: GREEN_COLOR });

let extensionIsActive = true;

function toggleExtension() {
  extensionIsActive = !extensionIsActive;
  updateBadge();
}

function updateBadge() {
  const badgeText = extensionIsActive ? 'ON' : 'OFF';
  const badgeColor = extensionIsActive ? GREEN_COLOR : GRAY_COLOR;

  chrome.action.setBadgeText({ text: badgeText });
  chrome.action.setBadgeBackgroundColor({ color: badgeColor });
}


function notifyContentScripts() {
  chrome.tabs.query({}, function (tabs) {
    tabs.forEach(function (tab) {
      chrome.tabs.sendMessage(tab.id, { command: 'updateExtensionState', isActive: extensionIsActive });
    });
  });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.command === 'toggleExtension') {
    toggleExtension();
  }
});
