import React, { useState, useEffect } from "react";

import { HStack, VStack } from "../../layoutHelpers";

interface TimeLimit {
  timeLimit: number;
  resetTimerInterval: number;
}

const Settings: React.FC = () => {
  const [timeLimits, setTimeLimits] = useState<{ [key: string]: TimeLimit }>(
    {},
  );
  const [showSuccessMessage, setShowSuccessMessage] = useState(false); // State to show/hide the success message
  const [newSite, setNewSite] = useState<string>("");
  const [newTimeLimit, setNewTimeLimit] = useState<number>(600);
  const [filter, setFilter] = useState<string>("");
  const [currentURL, setCurrentURL] = useState<string | null>(null);
  const [newResetTimerInterval, setNewResetTimerInterval] =
    useState<number>(3600);
  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0]?.url;
      if (url) {
        setCurrentURL(url);
      }
    });

    chrome.storage.local.get(["timeLimits"], (result) => {
      setTimeLimits(result.timeLimits || {});
    });
  }, []);

  const handleInputChange = (domain: string, field: string, value: number) => {
    setTimeLimits((prev) => ({
      ...prev,
      [domain]: {
        ...prev[domain],
        [field]: value,
      },
    }));
  };
  const handleSettingsUpdated = () => {
    chrome.runtime.sendMessage({ action: "settingsUpdated", site: currentURL });
  };

  // Save updated time limits back to storage and notify the service worker
  const saveTimeLimits = (limits: { [key: string]: TimeLimit }) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.runtime.sendMessage(
        { action: "updateTimeLimits", data: limits, tabId: tabs[0].id },
        (response) => {
          if (response?.status === "success") {
            setShowSuccessMessage(true); // Show the success message

            // Hide the message after 3 seconds
            setTimeout(() => {
              setShowSuccessMessage(false);
            }, 3000);
            handleSettingsUpdated();
          }
        },
      );
    });
  };

  const addNewSite = (site, limit, reset) => {
    if (site && !timeLimits[site]) {
      const newTimeLimits = {
        ...timeLimits,
        [site]: { timeLimit: limit, resetTimerInterval: reset },
      };
      setTimeLimits(newTimeLimits);
      setNewSite("");
      setNewTimeLimit(600);
      saveTimeLimits(newTimeLimits);
    }
  };

  // Handle removing a site
  const removeSite = (site: string) => {
    chrome.runtime.sendMessage({ action: "removeSite", site }, (response) => {
      if (response?.status === "success") {
        const updatedLimits = { ...timeLimits };
        delete updatedLimits[site];
        setTimeLimits(updatedLimits);
        handleSettingsUpdated();
      }
    });
  };

  return (
    <VStack className="tab-content justify-between h-full space-y-6">
      {/* Success message */}
      {showSuccessMessage && (
        <VStack className="sticky top-0 left-0 right-0 bg-doom-green text-white py-2 px-4 text-center transition-opacity duration-1000 ease-in-out">
          Time limits updated successfully!
        </VStack>
      )}
      <VStack>
        <h2 className="text-xl font-bold place-self-center">
          Manage Time Limits
        </h2>
        {/* Filter input */}
        <input
          type="text"
          placeholder="Filter domains..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />
        <VStack className="space-y-2">
          {Object.entries(timeLimits).map(([domain, limits]) => {
            if (!domain.toLowerCase().includes(filter.toLowerCase())) {
              return null; // If the domain doesn't match, skip rendering it
            }
            return (
              <VStack
                key={domain}
                className="bg-gray-100 p-3 rounded-md shadow-sm"
              >
                <h3 className="font-semibold text-doom-blue">{domain}</h3>

                {/* Time Limit (converted to minutes) */}
                <VStack className="space-y-1">
                  <label className="block">
                    Time Limit (minutes):
                    <input
                      type="number"
                      value={Math.floor(limits.timeLimit / 60)} // Convert seconds to minutes
                      onChange={(e) =>
                        handleInputChange(
                          domain,
                          "timeLimit",
                          Number(e.target.value) * 60,
                        )
                      } // Convert back to seconds
                      className="w-full p-2 border rounded"
                    />
                  </label>

                  {/* Reset Timer Interval (hours and minutes) */}
                  <label className="block">
                    Reset Timer Interval:
                    <HStack className="space-x-2">
                      <label className="block">
                        {" "}
                        Hours:
                        <input
                          type="number"
                          value={Math.floor(limits.resetTimerInterval / 3600)} // Hours
                          onChange={(e) =>
                            handleInputChange(
                              domain,
                              "resetTimerInterval",
                              Number(e.target.value) * 3600 +
                                (limits.resetTimerInterval % 3600),
                            )
                          }
                          className="w-1/2 p-2 border rounded"
                          placeholder="Hours"
                        />
                      </label>
                      <label className="block">
                        {" "}
                        Minutes:
                        <input
                          type="number"
                          value={Math.floor(
                            (limits.resetTimerInterval % 3600) / 60,
                          )} // Minutes
                          onChange={(e) =>
                            handleInputChange(
                              domain,
                              "resetTimerInterval",
                              Math.floor(limits.resetTimerInterval / 3600) *
                                3600 +
                                Number(e.target.value) * 60,
                            )
                          }
                          className="w-1/2 p-2 border rounded"
                          placeholder="Minutes"
                        />
                      </label>
                    </HStack>
                  </label>
                </VStack>

                <button
                  className="bg-doom-red text-grey-500 hover:text-grey-700 hover:bg-doom-red-2 mt-2"
                  onClick={() => removeSite(domain)}
                >
                  Remove
                </button>
              </VStack>
            );
          })}
        </VStack>

        <h3 className="mt-4">Add New Site</h3>
        <VStack className="space-y-2">
          <input
            type="text"
            placeholder="Enter site (e.g., www.example.com)"
            value={newSite}
            onChange={(e) => setNewSite(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <label className="block">
            Time Limit (minutes):
            <input
              type="number"
              value={Math.floor(newTimeLimit / 60)} // Convert seconds to minutes
              onChange={(e) => setNewTimeLimit(Number(e.target.value) * 60)} // Convert back to seconds
              className="w-full p-2 border rounded"
            />
          </label>
          <label className="block">
            Reset Timer Interval:
            <HStack className="space-x-2">
              <label className="block">
                {" "}
                Hours:
                <input
                  type="number"
                  value={Math.floor(newResetTimerInterval / 3600)} // Hours
                  onChange={(e) =>
                    setNewResetTimerInterval(
                      Number(e.target.value) * 3600 +
                        (newResetTimerInterval % 3600),
                    )
                  }
                  className="w-1/2 p-2 border rounded"
                  placeholder="Hours"
                />
              </label>
              <label className="block">
                {" "}
                Minutes:
                <input
                  type="number"
                  value={Math.floor((newResetTimerInterval % 3600) / 60)} // Minutes
                  onChange={(e) =>
                    setNewResetTimerInterval(
                      Math.floor(newResetTimerInterval / 3600) * 3600 +
                        Number(e.target.value) * 60,
                    )
                  }
                  className="w-1/2 p-2 border rounded"
                  placeholder="Minutes"
                />
              </label>
            </HStack>
          </label>
          <button
            onClick={() =>
              addNewSite(newSite, newTimeLimit, newResetTimerInterval)
            }
            className="bg-doom-green hover:bg-doom-green-2 text-white px-4 py-2 rounded"
          >
            Add Site
          </button>
        </VStack>
      </VStack>

      {/* Save Button fixed at the bottom */}
      <div className="sticky bottom-0 left-0 right-0 bg-white p-4">
        <button
          onClick={() => saveTimeLimits(timeLimits)}
          className="bg-doom-green hover:bg-doom-green-2 text-white w-full py-2 rounded"
        >
          Save All Changes
        </button>
      </div>
    </VStack>
  );
};

export default Settings;
