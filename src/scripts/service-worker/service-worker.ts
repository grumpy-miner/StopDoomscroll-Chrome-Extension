let activeTabId = null;
let activeSite = null;
let timer = null;
let timeLimits = {};

// Load time limits from storage on initialization
chrome.storage.local.get(["timeLimits"], (result) => {
  timeLimits = result["timeLimits"] || {
    "www.twitter.com": { timeLimit: 3600, resetTimerInterval: 3600 },
    "www.facebook.com": { timeLimit: 10, resetTimerInterval: 3600 },
    "www.youtube.com/shorts": { timeLimit: 10, resetTimerInterval: 3600 },
  };
  chrome.storage.local.set({ timeLimits: timeLimits }, () => {
    timeLimits = timeLimits;
  });
});

// Updated listener to handle adding and removing sites
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getCurrentData" && activeSite) {
    chrome.storage.local.get([activeSite], (result) => {
      const siteData = result[activeSite] || { time: 0, distance: 0 };
      const remainingTime = Math.max(
        timeLimits[activeSite]?.timeLimit - siteData.time,
        0,
      );
      sendResponse({
        time: siteData.time,
        distance: siteData.distance,
        remainingTime,
      });
    });
    return true; // Keep the message channel open for async response
  } else if (message.action === "updateTimeLimits") {
    // Update time limits in storage and in the service worker
    chrome.storage.local.set({ timeLimits: message.data }, () => {
      timeLimits = message.data;
      sendResponse({ status: "success" });
    });
    return true;
  } else if (message.action === "removeSite") {
    // Remove a site from timeLimits
    delete timeLimits[message.site];
    chrome.storage.local.set({ timeLimits }, () => {
      sendResponse({ status: "success" });
    });
    return true;
  } else if (message.action === "getSiteTracked") {
    if (activeSite && typeof activeSite === "string") {
      // Ensure activeSite is a valid string
      chrome.storage.local.get([activeSite], (result) => {
        if (activeSite in result) {
          sendResponse({ status: "success" });
        }
      });
    }
    return true; // Ensure asynchronous response
  } else if (message.action === "settingsUpdated") {
    updateActiveSite(message.site);
    sendResponse({ status: "success" });
    return true;
  }
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "scrollUpdate" && activeTabId === sender.tab.id) {
    updateScrollData(activeSite, message.distance);
  }
});

// Function to update scroll data for the active site
function updateScrollData(site, distance) {
  chrome.storage.local.get([site], (result) => {
    let currentSiteData = result[site];
    currentSiteData["distance"] = +(
      Math.abs(currentSiteData["previousFromTop"] - distance) +
      currentSiteData["distance"]
    ).toFixed(2);
    currentSiteData["previousFromTop"] = distance;
    chrome.storage.local.set({ [site]: currentSiteData }, () => {});
  });
}

// Function to handle tab activation
chrome.tabs.onActivated.addListener((activeInfo) => {
  updateActiveTab(activeInfo.tabId);
});

// Function to handle URL updates in the active tab
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tabId === activeTabId && changeInfo.url) {
    updateActiveSite(tab.url);
  }
});

// Stop the timer when the tab is removed
chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId === activeTabId) {
    stopTimer();
  }
});

// Update the active tab and manage time tracking
function updateActiveTab(tabId) {
  chrome.tabs.get(tabId, (tab) => {
    activeTabId = tabId;
    updateActiveSite(tab.url);
  });
}

// Update the active site based on the URL
function updateActiveSite(url) {
  const domain = new URL(url).hostname;
  const path = new URL(url).pathname;

  // Construct full URL including path
  const fullUrl = `${domain}${path}`;

  // Check if the full URL or its subpaths match any path-specific rule
  const matchedPathRule = Object.keys(timeLimits).find((rule) =>
    fullUrl.startsWith(rule),
  );

  if (matchedPathRule) {
    // Start timer for the most specific path rule
    activeSite = matchedPathRule;
    startTimer(matchedPathRule);
  }
  // If there's no path-specific rule but a domain rule exists, apply the domain rule
  else if (
    timeLimits[domain] &&
    !Object.keys(timeLimits).some((key) => key.startsWith(`${domain}/`))
  ) {
    activeSite = domain;
    startTimer(domain);
  } else {
    activeSite = null;
    stopTimer();
  }
}

// Starts the timer for the active site
function startTimer(site) {
  stopTimer(); // Stop any existing timer
  timer = setInterval(() => {
    chrome.storage.local.get([site], (result) => {
      const currentSiteData = result[site] || {
        time: 0,
        distance: 0,
        previousFromTop: 0,
        timerStart: (Date.now() / 1000) | 0,
        currentlyBlocked: false,
      };
      const updatedSiteData = {
        time: currentSiteData["time"] + 1,
        distance: currentSiteData["distance"],
        previousFromTop: currentSiteData["previousFromTop"],
        timerStart: currentSiteData["timerStart"],
        currentlyBlocked: currentSiteData["currentlyBlocked"],
      };

      const timeToReset = Math.floor(
        updatedSiteData["timerStart"] +
          timeLimits[site]["resetTimerInterval"] -
          Date.now() / 1000,
      );
      chrome.storage.local.set({ [site]: updatedSiteData }, () => {
        if (
          updatedSiteData["time"] >= timeLimits[site]["timeLimit"] &&
          timeToReset > 0
        ) {
          stopTimer();
          setSiteBlocked(site);
          chrome.tabs.update(activeTabId, { url: `https://www.stop-doomscrolling.com/blocked?scrollDistance=${updatedSiteData["distance"]}&timeLeft=${timeToReset}&blocked=${updatedSiteData["currentlyBlocked"]}&site=${site}` });
        } else if (timeToReset <= 0) {
          resetTimer(site);
        }
      });
    });
  }, 1000);
}


// Stops the timer if it's running
function stopTimer() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

function resetTimer(site) {
  chrome.storage.local.get([site], (result) => {
    chrome.storage.local.set({
      [site]: {
        time: 0,
        distance: 0,
        previousFromTop: 0,
        timerStart: (Date.now() / 1000) | 0,
        currentlyBlocked: false,
      },
    });
  });
}

function setSiteBlocked(site) {
  chrome.storage.local.get([site], (result) => {
    chrome.storage.local.set({
      [site]: {
        ...result[site],
        currentlyBlocked: true,
      },
    });
  });
}
