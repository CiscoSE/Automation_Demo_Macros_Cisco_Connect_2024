# Automation Demo Macros Cisco Connect 2024

This is a collection of room automation Webex Devices macros to be used in demos at Cisco Connect Cancun in September of 2024

### AC Simulator and fan control (ac-simulator.js)

This macro turns on a fan once a threshold temperature is hit and turns it off once the temperature comes back down. We will use the temp sensor in the Navigator to determine if on or off and will provide an on-screen control to allow users to manually turn on the fan or automatically, for which they have to select the temperature (in Celsius).  
 The actual physical fan in the demonstration is controlled by just turning on or off a smart switch where it is connected. The smart switch is controlled via HTTP commands on the local network that the macro issues.

### Light control (light-control.js)

Provide a UI top level buttons to turn lights on/off or dim them at a specific setting. Also provide a top level button called "Celebrate" that does some multi-bulb light flashing patter for 15 seconds and goes back to the normal setting. There is also a "color chooser" button that brings up another panel with a individual color sliders for each of 4 bulbs so you can set their color or just set to white.
Lights are controlled via HTTP commands on the local network using the same protocol as for the smart swich since we are using devices from the same brand and family of home automation products these first two.

### HDMI Matrix switcher controller (matrix_switch_serial.js)

Provides a top level custom panel named "HDMI Input" that allows you to select between the 4 different HDMI inputs to select which one to use to show content on the codec EQ. This is controlled via SerialOut commands over the USB-A ports that will have an RS232 adapter cable that plugs into the RS232 DB9 female connector on the matrix switcher.

### Report Issue (report-issue.js)

Provide a way for end users in the devices to report issues with the room or room device using the touch device. It allows users to send the issues to a list of webex users specifying their email address associated to their Webex Messaging accont. The emails are seperated into 3 catagories: Mailer1, Mailer2, Mailer3.
Mailer1: will be notified when "Technical Issue with Incoming Audio/Video" Issues are submitted Mailer2: will be notified when "Can't connect to my meeting" Issues are submitted Mailer3: will be notified when "Request for a technician" Issues are submitted

The report issue portion of this repository was based off of the GVE DevNet report issue macro: https://github.com/gve-sw/gve_devnet_report_issue_macro

## Contacts

- Gerardo Chaves (gchaves@cisco.com)

## Solution Components

- Webex
- Webex Room Devices
- Javascript

## Prerequisites

If you are going to use the report issue macro, you need the following:

- **Webex API Personal Token**:

1. To use the Webex REST API, you need a Webex account backed by Cisco Webex Common Identity (CI). If you already have a Webex account, you're all set. Otherwise, go ahead and [sign up for a Webex account](https://cart.webex.com/sign-up).
2. When making request to the Webex REST API, the request must contain a header that includes the access token. A personal access token can be obtained [here](https://developer.webex.com/docs/getting-started).

> Note: This token has a short lifetime - only 12 hours after logging into this site - so it shouldn't be used outside of app development.

- **Webex Bot**: To create a Webex bot, you need a token from Webex for Developers.

1. Log in to `developer.webex.com`
2. Click on your avatar and select `My Webex Apps`
3. Click `Create a New App`
4. Click `Create a Bot` to start the wizard
5. Following the instructions of the wizard, provide your bot's name, username, and icon
6. Once the form is filled out, click `Add Bot` and you will be given an access token
7. Copy the access token and store it safely. Please note that the API key will be shown only once for security purposes. In case you lose the key, then you have to revoke the key and generate a new key

> For more information about Webex Bots, please see the [documentation](https://developer.webex.com/docs/bots)

> [This blog](https://developer.webex.com/blog/from-zero-to-webex-teams-chatbot-in-15-minutes) gives more step by step instructions.

## Installation/Configuration

Download all the .js files in this repository and upload them to your Webex Room device.

Configure the Report Issue Macro by changing the Issue names (ISSUE_NAME_1,ISSUE_NAME_2,ISSUE_NAME_3,ISSUE_NAME_4) (Optional), and initial values.

Enable all the Macros uploaded except GMM_LIB.js. That one is just for use by the report-issue.js macro which includes it as a library.

More details on how to install Macros for the [Board, Desk, and Room Series](https://help.webex.com/en-us/article/gj962f/Configure-macros-and-user-interface-extensions-for-Board,-Desk,-and-Room-Series)

## Usage

# Screenshots

![/IMAGES/report-issue-gif.gif](/IMAGES/report-issue-gif.gif)

### LICENSE

Provided under Cisco Sample Code License, for details see [LICENSE](LICENSE.md)

### CODE_OF_CONDUCT

Our code of conduct is available [here](CODE_OF_CONDUCT.md)

### CONTRIBUTING

See our contributing guidelines [here](CONTRIBUTING.md)

#### DISCLAIMER:

<b>Please note:</b> This script is meant for demo purposes only. All tools/ scripts in this repo are released for use "AS IS" without any warranties of any kind, including, but not limited to their installation, use, or performance. Any use of these scripts and tools is at your own risk. There is no guarantee that they have been through thorough testing in a comparable environment and we are not responsible for any damage or data loss incurred with their use.
You are responsible for reviewing and testing any scripts you run thoroughly before use in any non-testing environment.
