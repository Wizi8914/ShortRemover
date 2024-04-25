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
        const targetElements = document.querySelectorAll(selector);
        if (targetElements.length > 0) {
          callback(targetElements);
        }
      });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
    });
}

function getParamState(paramName, callback) {
    chrome.storage.local.get(paramName, function (result) {
        const param = result[paramName] !== undefined ? result[paramName] : true;
        callback(param);
    });
}


chrome.storage.local.get('extensionIsActive', function (result) {
    const extensionIsActive = result.extensionIsActive !== undefined ? result.extensionIsActive : true;
    if (!extensionIsActive) return;

    getParamState('paramNavbarButtonUndeployed', isActive => {
        if (!isActive && !document.URL.includes('youtube.com/watch')) return;
        
        waitForElement('.ytd-mini-guide-renderer:nth-child(2)', navBarButtonUndeployed => {
            navBarButtonUndeployed.remove();
            console.log('[Youtube Short Remover] Removed navbar undeployed button');
        });
        
    });

    getParamState('paramNavbarButtonDeployed', isActive => {
        if (!isActive) return;

        waitForElement('ytd-guide-entry-renderer:nth-child(2)', navbarButtonDeployed => {
            navbarButtonDeployed.remove();
            console.log('[Youtube Short Remover] Removed navbar deployed button');
        });
        
    });

    // Listen for URL changes
    window.addEventListener("yt-navigate-finish", event => {
        let URL = event.detail.response.url;
        console.log("Changed to: " + URL);
        
        if (URL.includes("/@") || URL.includes("/channel/")) {
            getParamState('paramChannelTab', (isActive) => {
                if (!isActive) return;
                
                waitForElementElement('.yt-tab-shape-wiz:nth-child(3)', channelTab => {
                    channelTab.remove();
                    console.log('[Youtube Short Remover] Removed channel tab');
                });
            });
        }


        if (URL == "/") {
            getParamState('paramHomeRecommendedShort', isctive => {
                if (!isActive) return;

                observeElement('ytd-rich-section-renderer', homeRecommendedShort => {
                    homeRecommendedShort.forEach(element => element.remove());
                    console.log('[Youtube Short Remover] Removed home recommended short');
                });
            });
        }

        if (URL.includes("/results?search_query")) {
            getParamState('paramShortSearchResult', isValid => {
                if (!isValid && document.URL.includes("youtube.com/results")) return;
        
                observeElement('ytd-reel-shelf-renderer', shortSearchResult => {
                    shortSearchResult.forEach(element => element.remove());
                    console.log('[Youtube Short Remover] Removed short search result');
                });
                
            });
        }

        if (URL.includes("/watch?v=")) {
            getParamState('paramVideoPlayerRecomendedShort', isActive => {
                if (!isActive) return;

                waitForElement('ytd-reel-shelf-renderer.ytd-item-section-renderer', video => {
                    video.remove();
                    console.log('[Youtube Short Remover] Removed video player recommended short');
                });
            });
        }

        if (URL.includes("/feed/subscriptions")) {
            getParamState('paramSubscriptionShort', isActive => {
                if (!isActive) return;

                waitForElement('ytd-rich-shelf-renderer', subscriptions => {
                    subscriptions.remove();
                    console.log('[Youtube Short Remover] Removed subscriptions');
                });
            });
        }
    });
});

