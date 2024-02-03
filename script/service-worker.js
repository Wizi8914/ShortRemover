const GREEN_COLOR = '#2db552';
const GRAY_COLOR = '#828282';

let extensionActive = true;
chrome.action.setBadgeText({ text: 'ON' });
chrome.action.setBadgeBackgroundColor({ color: GREEN_COLOR });

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.command === 'toggleExtension') {
        extensionActive = message.value;

        if (extensionActive) {
            console.log('Extension activée');
            chrome.action.setBadgeText({ text: 'ON' });
            chrome.action.setBadgeBackgroundColor({ color: GREEN_COLOR }); // Green color
        } else {
            console.log('Extension désactivée');
            chrome.action.setBadgeText({ text: 'OFF' });
            chrome.action.setBadgeBackgroundColor({ color: GRAY_COLOR }); // Gray color
        }
    }
});