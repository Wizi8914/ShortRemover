"use strict";
(() => {
  const GREEN_COLOR = '#2db552';
  const GRAY_COLOR = '#828282';

  const installURL = 'https://wizi8914.github.io/ShortRemover/pages/static/install.html';
  const uninstallURL = 'https://wizi8914.github.io/ShortRemover/pages/static/uninstall.html';
  
  chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
      chrome.tabs.create({ url: installURL });
    }

    initializeExtension()
  });

  chrome.runtime.setUninstallURL(uninstallURL);
  
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
  
  
  // LOGGER //
  
  const availableLanguages = ["en", "fr", "ru", "ko"];
  const defaultLanguage = navigator.language.split('-')[0];
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "log") {
      getMessage(request.messageKey)
        .then(message => sendResponse({ message }))
        .catch(error => sendResponse({ error: error.message }));
      
      return true;
    }
  });
  
  async function getMessage(messageKey) {
    const language = await getLanguage();
      const pageURL = chrome.runtime.getURL(`_locales/${language}/messages.json`);
  
      const response = await fetch(pageURL);
  
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const json = await response.json();
      const message = json[messageKey]['message'];
      
      console.log(message);
      return message;
  }
  
  function getLanguage() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get('language', function (result) {
            let lang;
            
            if (availableLanguages.includes(defaultLanguage)) {
                lang = result.language !== undefined ? result.language : defaultLanguage;
            } else {
                lang = result.language !== undefined ? result.language : 'en';
            }
  
            chrome.storage.local.set({ language: lang });
            resolve(lang);
        });
    });
  }
})();
