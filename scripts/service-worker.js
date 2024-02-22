const GREEN_COLOR = '#2db552';
const GRAY_COLOR = '#828282';

chrome.runtime.onInstalled.addListener(function () {
  initializeExtension()
});

chrome.runtime.onStartup.addListener(function () {
  initializeExtension()
});

function initializeExtension() {
  getExtensionState(function (extensionIsActive) {
    updateBadge(extensionIsActive);
  });
}

function getExtensionState(callback) {
  chrome.storage.local.get('extensionIsActive', function (result) {
    const extensionIsActive = result.extensionIsActive !== undefined ? result.extensionIsActive : true;
    callback(extensionIsActive);
  });
}

function setExtensionState(extensionIsActive) {
  chrome.storage.local.set({ 'extensionIsActive': extensionIsActive });
}

function toggleExtension() {
  getExtensionState(function (extensionIsActive) {
    extensionIsActive = !extensionIsActive;
    setExtensionState(extensionIsActive);
    updateBadge(extensionIsActive);
  });
}

function updateBadge(extensionIsActive) {
  const badgeText = extensionIsActive ? 'ON' : 'OFF';
  const badgeColor = extensionIsActive ? GREEN_COLOR : GRAY_COLOR;

  chrome.action.setBadgeText({ text: badgeText });
  chrome.action.setBadgeBackgroundColor({ color: badgeColor });
}

function getParamState(callback, paramName) {
  chrome.storage.local.get(paramName, function (result) {
    const param = result[paramName] !== undefined ? result[paramName] : true;
    callback(param);
  });
}

function setParamState(paramIsActive, paramName) {

  let obj = {};
  obj[paramName] = paramIsActive;
  chrome.storage.local.set(obj);

  chrome.storage.local.get(paramName, function (result) {
    console.log(result);
  });

  
}

function toggleParams(paramName) {
  getParamState(function (param) {
    param = !param;    
    setParamState(param, paramName);
  }, paramName);
}


chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.command === 'toggleExtension') {
    toggleExtension();
  } else {
    toggleParams(request.command);
  }
});


