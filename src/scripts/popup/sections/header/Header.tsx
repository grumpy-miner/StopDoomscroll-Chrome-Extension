import React from "react";
import { FaGear } from "react-icons/fa6";
import { FaMagnifyingGlassChart } from "react-icons/fa6";
import { FaInfoCircle } from "react-icons/fa";
import { IconContext } from "react-icons";

import { HStack } from "../../layoutHelpers";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (string) => void;
}
const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  return (
    <header className="w-full p-3 bg-doom-yellow">
      <HStack className="items-center justify-between">
        <HStack className="items-center">
          <img
            src="/assets/128x128.png"
            alt="StopDoomscroll Logo"
            className="w-10 h-10 mr-2"
          />
          <h1 className="text-lg font-semibold text-doom-blue">
            Stop Doomscroll
          </h1>
        </HStack>
        <HStack className="items-center space-x-2">
          <IconContext.Provider
            value={{ size: "1.2em", className: "cursor-pointer" }}
          >
            <FaMagnifyingGlassChart
              onClick={() => setActiveTab("status")}
              className={
                activeTab === "status" ? "text-doom-purple" : "text-doom-blue"
              }
            />
            <FaGear
              onClick={() => setActiveTab("settings")}
              className={
                activeTab === "settings" ? "text-doom-purple" : "text-doom-blue"
              }
            />
            <FaInfoCircle
              onClick={() => setActiveTab("info")}
              className={
                activeTab === "info" ? "text-doom-purple" : "text-doom-blue"
              }
            />
          </IconContext.Provider>
        </HStack>
      </HStack>
    </header>
  );
};

export default Header;
