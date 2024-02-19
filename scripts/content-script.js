function waitForElement(selector, callback) {
    const element = document.querySelector(selector);

    if (element) {
        callback(element);
    } else {
        const observer = new MutationObserver(mutations => {
            const targetElement = document.querySelector(selector);
            if (targetElement) {
                observer.disconnect();
                callback(targetElement);
            }
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true,
        });
    }
}

// Permanent element observer
function observeElement(selector, callback) {
    const observer = new MutationObserver(mutations => {
        const targetElement = document.querySelector(selector);
        if (targetElement) {
            callback(targetElement);
        }
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
    });
}

function getParamState(callback, paramName) {
    chrome.storage.local.get(paramName, function (result) {
        const param = result[paramName] !== undefined ? result[paramName] : true;
        callback(param);
    });
}


chrome.storage.local.get('extensionIsActive', function (result) {
    const extensionIsActive = result.extensionIsActive !== undefined ? result.extensionIsActive : true;
    if (extensionIsActive) {
        getParamState(function (param) {
            if (param && !document.URL.includes('youtube.com/watch')) {
                waitForElement('.ytd-mini-guide-renderer:nth-child(2)', function (navBarButtonUndeployed) {
                    navBarButtonUndeployed.remove();
                });
            }
        }, 'paramNavbarButtonUndeployed');

        getParamState(function (param) {
            if (param) {
                waitForElement('ytd-guide-entry-renderer:nth-child(2)', function (navbarButtonDeployed) {
                    navbarButtonDeployed.remove();
                });
            }
        }, 'paramNavbarButtonDeployed');


        getParamState(function (param) {
            if (param && (document.URL.includes('youtube.com/channel') || document.URL.includes('youtube.com/@')) && !document.URL.includes('/shorts') ) { 
                waitForElement('.yt-tab-shape-wiz:nth-child(3)', function (channelTab) {
                    channelTab.style.display = 'none';
                });
            }
        }, 'paramChannelTab');

        
    }
});

