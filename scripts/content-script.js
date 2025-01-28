"use strict";
(() => {
    const youtubeElements = {
        navbarUndeployed: ".ytd-mini-guide-renderer:nth-child(2)",
        navbarDeployed: "ytd-guide-entry-renderer:nth-child(2)",
        videoPlayerRecommended: "ytd-reel-shelf-renderer.ytd-item-section-renderer",
        searchAndPlayerShortContainer: "#scroll-container > .yt-horizontal-list-renderer",
        homeAndSubShortContainer: ".ytd-rich-shelf-renderer > #contents",
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
            ytm-video-with-context-renderer:has(a[href*="/shorts/"])`,
    };
    
    function fetchMessageFromBackground(messageKey) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({ action: "log", messageKey }, (response) => {
                if (response.error) {
                    reject(new Error('Error : ' + response.error));
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
            .catch(error => console.error(`Error retrieving message (${messageKey}):`, error.message));
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

    function countElement(element) {
        const count = document.querySelectorAll(element).length;
        return count;
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
    

    function addToStatistics(dataKey, increment = 1) {
        chrome.storage.local.get(dataKey, function(result) {
            let currentCount = result[dataKey] || 0; // If the key doesn't exist, the count is 0
            currentCount += increment;

            let obj = {};
            obj[dataKey] = currentCount;

            chrome.storage.local.set(obj);
        });
    }

    function countShorts(element) {
        let shortCount = 0;

        try {
            shortCount = document.querySelector(element).childElementCount;
            estimateTimeSaved(shortCount);
            addToStatistics('blockedShorts', shortCount);
        } catch (error) {}
    }

    function estimateTimeSaved(shortCount) {
        let timeSaved = Math.floor(shortCount / 3); 

        addToStatistics('timeSaved', timeSaved);
    }

    function removeNavbarButtonUndeployed() {
        getParamState('paramNavbarButtonUndeployed', isActive => {
            if (!isActive && !document.URL.includes('youtube.com/watch')) return;

            waitForElement(youtubeElements.navbarUndeployed, navBarButtonUndeployed => {
                navBarButtonUndeployed.remove();
                logger('log_NavbarButtonUndeployed');
            });
        });

    }

    function removeNavbarButtonDeployed() {
        getParamState('paramNavbarButtonDeployed', isActive => {
            if (!isActive) return;
            
            waitForElement(youtubeElements.navbarDeployed, navbarButtonDeployed => {
                navbarButtonDeployed.remove();
                logger('log_NavbarButtonDeployed');
            });
        });
        
    }
    
    function removeChannelTabShorts() {
        getParamState('paramChannelTab', (isActive) => {
            if (!isActive) return;

            document.querySelectorAll('.yt-tab-shape-wiz--host-clickable').forEach(tabElement => {
                tabElement.children[0].innerHTML.toLowerCase().includes('shorts') ? tabElement.remove() : null;
            });
        });
    }

    function removeHomePageRecommendedShorts() {
        getParamState('paramHomeRecommendedShort', isActive => {
            if (!isActive) return;

            observeElement(youtubeElements.recommendedShort, homeRecommendedShort => {
                countShorts(youtubeElements.homeAndSubShortContainer);
                
                homeRecommendedShort.forEach(element => element.remove());
                logger('log_HomeRecommendedShort');
            });
        });
    }

    function removeShotSearchResult() {
        getParamState('paramShortSearchResult', isActive => {
            if (!isActive && document.URL.includes("youtube.com/results")) return;
            
            observeElement(youtubeElements.recommendedShort, shortSearchResult => {                   
                countShorts(youtubeElements.searchAndPlayerShortContainer);
                
                shortSearchResult.forEach(element => element.remove());
                logger('log_ShortSearchResult');
            });
        });
    }

    function removeLivePlayerRecommendedShort() {
        getParamState('paramLivePlayerRecommendedShort', isActive => {
            if (!isActive) return;

            waitForElement(youtubeElements.videoPlayerRecommended, livePlayerRecommendedShort => {
                countShorts(youtubeElements.searchAndPlayerShortContainer);

                livePlayerRecommendedShort.remove();
                logger('log_LivePlayerRecommendedShort');
            });
        })
    }

    function removeVideoPlayerRecommendedShort() {
        getParamState('paramVideoPlayerRecommendedShort', isActive => {
            if (!isActive) return;

            waitForElement(youtubeElements.videoPlayerRecommended, playerRecommendedShort => {
                countShorts(youtubeElements.searchAndPlayerShortContainer);

                playerRecommendedShort.remove();
                logger('log_VideoPlayerRecommendedShort');
            });
        });
    }

    function removeSubscriptionShorts() {
        getParamState('paramSubscriptionShort', isActive => {
            if (!isActive) return;

            waitForElement(youtubeElements.recommendedShort, subscriptionsShorts => {
                countShorts(youtubeElements.homeAndSubShortContainer);
                
                subscriptionsShorts.remove();
                logger('log_SubscriptionShort');
            });
        });
    }


    chrome.storage.local.get('extensionIsActive', function (result) {
        const extensionIsActive = result.extensionIsActive !== undefined ? result.extensionIsActive : true;
        if (!extensionIsActive) return;
        
        removeNavbarButtonUndeployed();
        removeNavbarButtonDeployed();
    
        // Listen for URL changes
        window.addEventListener("yt-navigate-finish", event => {
            let URL = event.detail.response.url;
            logger(`log_ChangeTo`, ` ${URL}` );
    
            disconnectAllObservers();
    
            if (URL.includes("/@") || URL.includes("/channel/")) {
                removeChannelTabShorts();
            }
            
            // Shorts in home page

            if (URL == "/" || URL == "/?sttick=0" || URL.toLowerCase() == "/?bp=wguceae%3d") { // Home Page & Supecific URL
                removeHomePageRecommendedShorts();
            }
    
            // Short in search results

            if (URL.includes("/results?search_query")) {
                removeShotSearchResult();
            }

            // Video & Live player recommended Shorts

            if (URL.includes("/watch?v=") || URL.includes("/live/")) {
                // Create fallback for page load time

                const [navigation] = performance.getEntriesByType('navigation');
                let pageLoadTime = navigation.loadEventEnd - navigation.startTime;

                if (!pageLoadTime || pageLoadTime < 0) pageLoadTime = 2000; // Fallback to 2 seconds

                setTimeout(() => {
                    if (document.getElementById('chat') && !document.getElementById('chat').hasAttribute('collapsed')) {
                        removeLivePlayerRecommendedShort();
                    } else {
                        removeVideoPlayerRecommendedShort();
                    }
                }, Math.floor(pageLoadTime / 3)); // Use the page load time to wait for the player to load
            }
    

            if (URL.includes("/feed/subscriptions")) {
                removeSubscriptionShorts();
            }

            if (URL.includes("/shorts/")) {
                addToStatistics('shortsWatched');
            }

            addToStatistics('cleanedPage');
        });
    });
})();