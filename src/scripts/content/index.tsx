// content.tsx
import { createRoot } from "react-dom/client";
import React, { useState, useEffect } from "react";
import App from "./App";

const ROOT_ID = "allYourBasesBelongToUs";

let totalScrollDistance = 0;

function calcScreenDPI() {
  // Create a "1 inch" element to measure
  const el = document.createElement("div");
  el.style.width = "1in";

  // It has to be appended to measure it
  document.body.appendChild(el);

  // Get it's (DOM-relative) pixel width, multiplied by
  // the device pixel ratio
  const dpi = el.offsetWidth * devicePixelRatio;

  // remove the measurement element
  el.remove();
  return dpi;
}

const SCREEN_DPI = calcScreenDPI();

// Function to convert scrolled pixels to meters
const pixelsToMeters = (pixels: number): number => {
  const inches = pixels / SCREEN_DPI; // Convert pixels to inches
  const meters = inches * 0.0254; // Convert inches to meters (1 inch = 0.0254 meters)
  return meters;
};

// Scroll event handler
const handleScroll = () => {
  // Calculate the amount scrolled from the top of the document
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  // Calculate the maximum scrollable distance
  const maxScroll = Math.max(
    document.documentElement.scrollHeight - window.innerHeight,
    0,
  );

  // Update total scrolled pixels
  totalScrollDistance = Math.min(scrollTop, maxScroll);

  // Convert scrolled pixels to meters
  const scrolledMeters = pixelsToMeters(totalScrollDistance);

  // Send scroll data to the background script
  chrome.runtime.sendMessage({
    action: "scrollUpdate",
    distance: scrolledMeters.toFixed(2), // Send distance in meters, rounded to two decimals
  });
};

const isSiteTracked = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const currentSite = new URL(window.location.href).hostname; // Get the current site's hostname
    chrome.runtime.sendMessage(
      { action: "getSiteTracked", site: currentSite },
      (response) => {
        if (response) {
          resolve(true);
        } else {
          resolve(false);
        }
      },
    );
  });
};

// Main React Component
const ScrollTrackerApp = () => {
  const [siteTracked, setSiteTracked] = useState(false);

  useEffect(() => {
    // Check if the site is tracked on mount
    isSiteTracked().then((tracked) => {
      setSiteTracked(tracked);

      if (tracked) {
        // Add scroll listener if the site is tracked
        window.addEventListener("scroll", handleScroll);
      }
    });

    // Clean up scroll listener on unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

// Inject React App into the DOM
const injectReact = (rootId: string): void => {
  try {
    const container = document.createElement("div");
    const target = container;
    const root = createRoot(target!);
    root.render(<ScrollTrackerApp />);
  } catch (error) {
    console.error("Error Injecting React", error);
  }
};

injectReact(ROOT_ID);
