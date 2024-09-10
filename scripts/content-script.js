"use strict";
(() => {
    const youtubeElements = {
        navbarUndeployed: ".ytd-mini-guide-renderer:nth-child(2)",
        navbarDeployed: "ytd-guide-entry-renderer:nth-child(2)",
        videoPlayerRecommended: "ytd-reel-shelf-renderer.ytd-item-section-renderer",
        recommendedShort: 
            `#player-shorts-container,
            .ytd-shorts,
            yt-chip-cloud-chip-renderer:has(yt-formatted-string[title="Shorts"]),
            yt-tab-shape[tab-title="Shorts"],
            ytd-compact-video-renderer:has(a[href*="/shorts/"]),
            ytd-notification-renderer:has(> a[href^="/shorts/"]),
            ytd-reel-shelf-renderer,
            ytd-rich-grid-renderer[is-shorts-grid],
            ytd-rich-item-renderer:has(a[href*="/shorts/"]),
            ytd-rich-shelf-renderer[is-shorts],
            ytd-video-renderer:has(a[href*="/shorts/"]),
            ytm-reel-shelf-renderer,
            ytm-rich-grid-renderer.is_shorts,
            ytm-video-with-context-renderer:has(a[href*="/shorts/"])`
    };
    
    
    function fetchMessageFromBackground(messageKey) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({ action: "log", messageKey }, (response) => {
                if (response.error) {
                    reject(new Error('Erreur : ' + response.error));
                } else {
                    resolve(response.message);
                }
            });
        });
    }
    
    function logger(messageKey, suplement = "") {    
        fetchMessageFromBackground(messageKey)
            .then(message => {
                console.log(`[Youtube Short Remover] ${message}${suplement}`);
            })
            .catch(error => console.error(`Erreur lors de la récupération du message (${messageKey}):`, error.message));
        
    }
    
    const observers = [];
    
    /**
     * Observes elements and triggers a callback when found.
     * @param {string} selector
     * @param {function(NodeList): void} callback
     * @returns {MutationObserver}
     */
    
    function observeElement(selector, callback) {
        const observer = new MutationObserver(() => {
            const targetElements = document.querySelectorAll(selector);
    
            if (targetElements.length > 0) {
                callback(targetElements);
            }
        });
    
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true,
        });
    
        observers.push(observer);
        return observer;
    }
    
    function disconnectAllObservers() {
        if (observers.length === 0) return;
    
        observers.forEach(observer => observer.disconnect());
        observers.length = 0;
    
        logger('log_DisconnectOberserver');
    }
    
    function waitForElement(selector, callback) {
        const element = document.querySelector(selector);
    
        if (element) {
            callback(element);
        } else {
            const observer = new MutationObserver(() => {
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
    
    function getParamState(paramName, callback) {
        chrome.storage.local.get(paramName, function (result) {
            const param = result[paramName] !== undefined ? result[paramName] : true;
            callback(param);
        });
    }
    

    function addToStatistics(dataKey) {
        chrome.storage.local.get(dataKey, function(result) {
            let currentCount = result[dataKey] || 0; // If the key doesn't exist, the count is 0
            currentCount++;

            let obj = {};
            obj[dataKey] = currentCount;

            chrome.storage.local.set(obj);
        });
    }

    
    
    chrome.storage.local.get('extensionIsActive', function (result) {
        const extensionIsActive = result.extensionIsActive !== undefined ? result.extensionIsActive : true;
        if (!extensionIsActive) return;
        
        getParamState('paramNavbarButtonUndeployed', isActive => {
            if (!isActive && !document.URL.includes('youtube.com/watch')) return;
            
            waitForElement(youtubeElements.navbarUndeployed, navBarButtonUndeployed => {
                navBarButtonUndeployed.remove();
                logger('log_NavbarButtonUndeployed');
            });
            
        });
    
        getParamState('paramNavbarButtonDeployed', isActive => {
            if (!isActive) return;
    
            waitForElement(youtubeElements.navbarDeployed, navbarButtonDeployed => {
                navbarButtonDeployed.remove();
                logger('log_NavbarButtonDeployed');
            });
            
        });
    
        // Listen for URL changes
        window.addEventListener("yt-navigate-finish", event => {
            let URL = event.detail.response.url;
            logger(`log_ChangeTo`, ` ${URL}` );
    
            disconnectAllObservers();
    
            if (URL.includes("/@") || URL.includes("/channel/")) {
                getParamState('paramChannelTab', (isActive) => {
                    if (!isActive) return;
        
                    document.querySelectorAll('.yt-tab-shape-wiz--host-clickable').forEach(tabElement => {
                        tabElement.children[0].innerHTML.toLowerCase().includes('shorts') ? tabElement.remove() : null;
                    });
                });
            }
    
            
            if (URL == "/") {
                getParamState('paramHomeRecommendedShort', isActive => {
                    if (!isActive) return;
    
                    observeElement(youtubeElements.recommendedShort, homeRecommendedShort => {
                        homeRecommendedShort.forEach(element => element.remove());
                        logger('log_HomeRecommendedShort');
                    });
                });
            }
                
    
            if (URL.includes("/results?search_query")) {
                getParamState('paramShortSearchResult', isActive => {
                    if (!isActive && document.URL.includes("youtube.com/results")) return;
            
                    observeElement(youtubeElements.recommendedShort, shortSearchResult => {
                        shortSearchResult.forEach(element => element.remove());
                        logger('log_ShortSearchResult');
                    });
                    
                });
            }
    
            if (URL.includes("/watch?v=")) {
                getParamState('paramVideoPlayerRecommendedShort', isActive => {
                    if (!isActive) return;
    
                    waitForElement(youtubeElements.videoPlayerRecommended, video => {
                        video.remove();
                        logger('log_VideoPlayerRecommendedShort');
                    });
                });
            }
    
            if (URL.includes("/feed/subscriptions")) {
                getParamState('paramSubscriptionShort', isActive => {
                    if (!isActive) return;
    
                    waitForElement(youtubeElements.recommendedShort, subscriptions => {
                        subscriptions.remove();
                        logger('log_SubscriptionShort');
                    });
                });
            }
        });
    });

})();



