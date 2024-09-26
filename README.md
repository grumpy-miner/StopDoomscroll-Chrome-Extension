# Stop DoomScroll

Stop DoomScroll is a browser extension designed to help you limit your time and scrolling on distracting websites. Set time limits, monitor your scrolling distance, and regain control of your online habits.

## Features

- Set time limits for specific websites or paths (e.g., only limit YouTube Shorts).
- Real-time tracking of how much you scroll.
- Customizable reset intervals for each website.
- Easy management of blocked websites through a simple popup interface.

## Installation

1. **Clone the repository:**

```bash
git clone https://github.com/grumpy-miner/StopDoomscroll-Chrome-Extension.git
cd StopDoomscroll-Chrome-Extension
```

2. **Install dependencies:**

```bash
npm install
```

3. **Build the extension:**

```bash
npm run build
```

4. **Load the extension in your browser:**
    - Open Chrome and go to `chrome://extensions/`.

    - En able Developer mode in the top right corner.

    - Click on Load unpacked and select the `dist` folder from the project directory.

## Usage
1. After installing the extension, click the Stop DoomScroll icon in your browser toolbar.

2. Use the Settings tab to add websites you want to limit. You can specify the exact path to limit (e.g., www.youtube.com/shorts).

3. Define how long you want to spend on the site with the Time Limit.

4. Set a Reset Interval to decide how long until the limit is reset and access is restored.

5. Monitor your Time Remaining and Scrolled Distance in real-time under the Status tab.

## Reporting Issues
If you encounter any issues, feel free to open an issue on GitHub.

If you don't have a GitHub account (and yet you're still on this site for some reason  (╭ರ_•́) ), you can send an email to grumpy.miner.dev@gmail.com.


## Acknowledgments

This project was built using the [React Tailwind Chrome Extension Template](https://github.com/dougwithseismic/react-tailwind-chrome-extension-template) by Doug With Seismic. Huge thanks to the original author for providing the base template, which made building this extension easier and faster.