import React from "react";
import { VStack } from "../../layoutHelpers";

const Info: React.FC = () => {
  return (
    <VStack className="tab-content items-center justify-center space-y-6">
      <h2 className="text-2xl font-bold text-gray-700">
        About Stop Doomscroll
      </h2>
      <p className="text-center text-gray-600">
        Stop Doomscroll is a Chrome extension designed to help you limit your
        time and scrolling on distracting websites. You can set time limits and
        monitor your scrolling distance in real-time, helping you regain control
        of your browsing habits.
      </p>

      <h3 className="text-lg font-bold text-gray-700">Instructions</h3>
      <ul className="list-disc text-left px-8 text-gray-600 space-y-2">
        <li>Open the extension popup and navigate to the "Settings" tab.</li>
        <li>
          Add websites you'd like to track by entering the site name and setting
          the time limits.
        </li>
        <li>
          For each website, you can define a time limit (in minutes) and a reset
          interval (in hours and minutes).
        </li>
        <li>
          You can also view the time remaining and the distance you've scrolled
          for the current site under the "Status" tab.
        </li>
      </ul>

      <h3 className="text-lg font-bold text-gray-700">Resources</h3>
      <ul className="list-disc text-left px-8 text-gray-600 space-y-2">
        <li>
          <a
            href="https://github.com/grumpy-miner/StopDoomscroll-Chrome-Extension"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            GitHub Repository
          </a>{" "}
          - View the source code and contribute to the project.
        </li>
        <li>
          <a
            href="https://stop-doomscrolling.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            Official Website
          </a>{" "}
          - Learn more about the extension and how it can help you.
        </li>
      </ul>

      <h3 className="text-lg font-bold text-gray-700">Report Issues</h3>
      <p className="text-center text-gray-600">
        If you encounter any issues, you can open an issue on GitHub:
      </p>
      <p>
        <a
          href="https://github.com/grumpy-miner/StopDoomscroll-Chrome-Extension/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline"
        >
          Report an issue on GitHub
        </a>
      </p>
      <p className="text-center text-gray-600">
        If you don't have a GitHub account, feel free to send your feedback or
        issues via email:
      </p>
      <p>
        <a
          href="mailto:grumpy.miner.dev@gmail.com"
          className="text-blue-500 underline"
        >
          grumpy.miner.dev@gmail.com
        </a>
      </p>
    </VStack>
  );
};

export default Info;
