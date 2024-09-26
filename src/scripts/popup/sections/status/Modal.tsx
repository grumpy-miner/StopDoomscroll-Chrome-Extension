import React, { useState } from "react";
import { FaInfoCircle } from "react-icons/fa";
import InfoModal from "./InfoModal";

interface ModalProps {
  site: string;
  onClose: () => void;
  checkIfSiteTracked: () => void;
  currentURL: string;
}

const Infos = {
  site: {
    fieldTitle: "Site URL",
    content: `Enter the website's URL that you want to limit.

    You can specify a specific path, such as "www.youtube.com/shorts/", to limit only that section of the site.

    For example, by entering "www.youtube.com/shorts/", you will limit access to YouTube Shorts, but you will still be able to watch regular YouTube videos.`,
  },
  timeLimit: {
    fieldTitle: "Time Limit",
    content: `Set the maximum time (in minutes) you can spend on the site before access is blocked.

    The time limit will not reset by switching between the blocked site and other websites.

    Once the time limit is reached, you will need to wait until the Reset Interval has passed before regaining access to the site.`,
  },
  resetInterval: {
    fieldTitle: "Reset Interval",
    content: `Define the time (in hours and minutes) after which the time limit will be reset.

    For example, if you set the reset interval to 2 hours, your time limit will reset 2 hours after your first visit to the site.

    Think of it as allowing you to spend the defined time limit (e.g., 10 minutes) on the site every time the reset interval (e.g., 2 hours) passes.`,
  },
};


interface TimeLimit {
  timeLimit: number;
  resetTimerInterval: number;
}

const Modal: React.FC<ModalProps> = ({
  site,
  checkIfSiteTracked,
  currentURL,
  onClose,
}) => {
  const [siteToRecord, setSiteToRecord] = useState(site);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(10); // Time limit in minutes
  const [resetIntervalHours, setResetIntervalHours] = useState(1); // Reset interval in hours
  const [resetIntervalMinutes, setResetIntervalMinutes] = useState(0); // Reset interval in minutes
  const [error, setError] = useState<string | null>(null);
  const [infoModalOpen, setInfoModalOpen] = useState<boolean>(false);
  const [infoContent, setInfoContent] = useState<string>("");
  const [infoTitle, setInfoTitle] = useState<string>("");

  const handleSettingsUpdated = () => {
    chrome.runtime.sendMessage({ action: "settingsUpdated", site: currentURL },
      (response) => {
        checkIfSiteTracked();
      }
    );
  };

  // Save updated time limits back to storage and notify the service worker
  const saveTimeLimits = (limits: { [key: string]: TimeLimit }) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.runtime.sendMessage(
        { action: "updateTimeLimits", data: limits, tabId: tabs[0].id },
        (response) => {
          handleSettingsUpdated();
        },
      );
    });
  };

  const addNewSite = (site, limit, reset) => {
    chrome.storage.local.get(["timeLimits"], (result) => {
      const newTimeLimits = {
        ...result.timeLimits,
        [site]: { timeLimit: limit, resetTimerInterval: reset },
      };
      saveTimeLimits(newTimeLimits);
    });
  };

  const handleSave = () => {
    const timeLimitInSeconds = timeLimitMinutes * 60;
    const resetIntervalInSeconds =
      resetIntervalHours * 3600 + resetIntervalMinutes * 60;

    if (resetIntervalInSeconds <= timeLimitInSeconds) {
      setError("Reset interval must be greater than time limit.");
      return;
    }

    addNewSite(siteToRecord, timeLimitInSeconds, resetIntervalInSeconds);
    onClose();
  };

  const handleInfoClick = (field: string) => {
    const fieldInfo = Infos[field];
    setInfoTitle(fieldInfo["fieldTitle"]);
    setInfoContent(fieldInfo["content"]);
    setInfoModalOpen(true);
  };

  return (
    <>
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-4 rounded-lg w-[300px]">
          <h2 className="text-lg font-semibold mb-2">Add Site for Tracking</h2>

          {error && <p className="text-red-500">{error}</p>}

          <label className="block mb-2">
            Site Link:
            <span className="info-icon" onClick={() => handleInfoClick("site")}>
              <FaInfoCircle />
            </span>
            <input
              type="text"
              value={siteToRecord}
              onChange={(e) => setSiteToRecord(e.target.value)}
              className="w-full p-2 border rounded mt-1"
            />
          </label>
          {/* Time Limit in Minutes */}
          <label className="block mb-2">
            Time Limit (minutes):
            <span
              className="info-icon"
              onClick={() => handleInfoClick("timeLimit")}
            >
              <FaInfoCircle />
            </span>
            <input
              type="number"
              value={timeLimitMinutes}
              onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
              className="w-full p-2 border rounded mt-1"
            />
          </label>

          {/* Reset Interval in Hours and Minutes */}
          <label className="block mb-2">
            Reset Interval:
            <span
              className="info-icon"
              onClick={() => handleInfoClick("resetInterval")}
            >
              <FaInfoCircle />
            </span>
            <div className="flex space-x-2">
              <label className="block mb-2">
                Hours:
                <input
                  type="number"
                  value={resetIntervalHours}
                  onChange={(e) =>
                    setResetIntervalHours(Number(e.target.value))
                  }
                  className="w-1/2 p-2 border rounded mt-1"
                  placeholder="Hours"
                />
              </label>
              <label className="block mb-2">
                Minutes:
                <input
                  type="number"
                  value={resetIntervalMinutes}
                  onChange={(e) =>
                    setResetIntervalMinutes(Number(e.target.value))
                  }
                  className="w-1/2 p-2 border rounded mt-1"
                  placeholder="Minutes"
                />
              </label>
            </div>
          </label>

          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={onClose}
              className="bg-gray-400 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Info Modal */}
      {infoModalOpen && (
        <InfoModal
          title={infoTitle}
          content={infoContent}
          onClose={() => setInfoModalOpen(false)}
        />
      )}
    </>
  );
};

export default Modal;
