import React, { useState, useEffect } from "react";
import { FaInfoCircle } from "react-icons/fa";
import Modal from "./Modal";
import InfoModal from "./InfoModal"; 

import { HStack, VStack } from "../../layoutHelpers";
import { formatTime } from "../../../utils/timeUtils";

const Status: React.FC = () => {
  const [currentSiteTracked, setCurrentSiteTracked] = useState<boolean | null>(
    false,
  );
  const [currentSite, setCurrentSite] = useState<string | null>(null);
  const [currentURL, setCurrentURL] = useState<string | null>(null);

  const [currentData, setCurrentData] = useState<{
    time: number;
    distance: number;
    remainingTime: number;
  } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0]?.url;
      if (url) {
        setCurrentURL(url);
        const domain = new URL(url).hostname;
        checkIfSiteTracked();
        setCurrentSite(domain);
        if (currentSiteTracked) {
          fetchCurrentData(domain); // Fetch initial data
        }
      }
    });
  });

  useEffect(() => {
    if (currentSiteTracked && currentSite) {
      const interval = setInterval(() => {
        fetchCurrentData(currentSite);
      }, 1000); // Fetch data every second

      return () => clearInterval(interval); // Clean up the interval when the component unmounts or when the site changes
    }
  }, [currentSiteTracked, currentSite]);

  const checkIfSiteTracked = () => {
    chrome.runtime.sendMessage({ action: "getSiteTracked" }, (response) => {
      if (response) {
        setCurrentSiteTracked(true);
      } else {
        setCurrentSiteTracked(false);
      }
    });
  };
  // Function to fetch current data from the service worker
  const fetchCurrentData = (site: string) => {
    chrome.runtime.sendMessage({ action: "getCurrentData" }, (response) => {
      if (response) {
        setCurrentData(response);
      }
    });
  };


  return (
    <VStack className="tab-content items-center justify-center space-y-6">
      {currentSiteTracked ? (
        <VStack className="w-full max-w-md space-y-8">
          {currentData ? (
            <>
              {/* Time Remaining Section */}
              <VStack className="items-center justify-center w-full space-y-2">
                <h2 className="text-2xl font-bold text-gray-700">
                  Time Remaining
                </h2>
                <h2 className="text-4xl font-extrabold text-doom-red">
                  {formatTime(currentData.remainingTime)}
                </h2>
              </VStack>

              {/* Divider */}
              <div className="w-full border-t-2 border-gray-300 my-4"></div>

              {/* Scrolled Distance Section */}
              <VStack className="items-center justify-center w-full space-y-2">
              <HStack>
                <h2 className="text-xl flex font-semibold text-gray-700">
                  Scrolled Distance
                </h2>
                <span className="relative ml-2 relative cursor-pointer h-1.625 mt-2" onClick={() => setShowInfoModal(true)}>
                    <FaInfoCircle />
                  </span>
                </HStack>
                  <h2 className="text-2xl font-medium text-gray-800">
                    {currentData.distance.toFixed(2)} meters
                  </h2>
                  
                
                
              </VStack>
              {showInfoModal && (
                <InfoModal
                  title="Scrolling distance"
                  content="The 'Scrolled Distance' indicates the total distance you have scrolled while browsing the tracked site. If you notice that the distance is not updating, please refresh the site to start tracking your scrolling again."
                  onClose={() => setShowInfoModal(false)}
                />
              )}
            </>
          ) : (
            <p>Loading current site data...</p>
          )}
        </VStack>
      ) : (
        <div>
          <h2>This site is not currently tracked.</h2>
          {showModal ? (
            <Modal
              site={currentSite || ""}
              onClose={() => setShowModal(false)}
              checkIfSiteTracked={checkIfSiteTracked}
              currentURL={currentURL}
            />
          ) : (
            <button
              onClick={() => setShowModal(true)} // Open modal when clicked
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Add Site for Tracking
            </button>
          )}
        </div>
      )}
    </VStack>
  );
};

export default Status;
