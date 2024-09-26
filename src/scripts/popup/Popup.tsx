// src/scripts/popup/Popup.tsx
import React, { useState } from "react";
import Info from "./sections/info/Info";
import Settings from "./sections/settings/Settings";
import Status from "./sections/status/Status";
import Header from "./sections/header/Header"

import { VStack } from "./layoutHelpers";

const Popup: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"status" | "settings" | "info">(
    "status",
  );

  return (
    <VStack className="w-[320px] h-[390px] nnbg">
      <Header
        setActiveTab={setActiveTab}
        activeTab={activeTab}
      />
        {activeTab === "status" && <Status />}
        {activeTab === "settings" && <Settings />}
        {activeTab === "info" && <Info />}
    </VStack>
  );
};

export default Popup;
