/********************************************************
Copyright (c) 2022 Cisco and/or its affiliates.
This software is licensed to you under the terms of the Cisco Sample
Code License, Version 1.1 (the "License"). You may obtain a copy of the
License at
               https://developer.cisco.com/docs/licenses
All use of the material herein must be in accordance with the terms of
the License. All rights not expressly granted by the License are
reserved. Unless required by applicable law or agreed to separately in
writing, software distributed under the License is distributed on an "AS
IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
or implied.
*********************************************************

 * Author:                  Gerardo Chaves
 *                          Solutions Engineer
 *                          Cisco Systems
 *
 * This macro controls a smart light bulbs in the room where the Webex Room Device is located.
 * It provides a custom panel with controls for turning on and off the lights and setting the color.
 * It communicates with the light bulbs using the HTTP interface provided by the vendor: https://www.shelly.com/documents/developers/ddd_communication.pdf
 * 
 * 
 * 
 * 
 * Released: July 17, 2024
 * Updated: September 5, 2024
 *
 * Version: 1.0.3
*/

import xapi from 'xapi';

const ligthIPs = ['10.0.1.111', '10.0.1.112', '10.0.1.113', '10.0.1.114']; // Set the IP address of the lights
const LIGHT_USERNAME = 'admin'; // Set the username for the smart switch, leave blank if not needed
const LIGHT_PASSWORD = 'password'; // Set the password for the smart switch
// Leave CELEBRATING_URL blank if no video needs to be shown on the main screen during the celebration.
// Otherwise, put the URL of a video such as 'https://www.youtube.com/watch?v=VaOGlkkL0j4' but insure it plays automatically.
let CELEBRATING_URL = ''; // Set the URL of the video to be shown during the celebration
const CELEBRATING_DURATION = 30000; // Set the time in milliseconds for the celebration to last


let IntervId;
let cancelTimer;

let nIntervId;

let red = 255;
let green = 255;
let blue = 255;
let white = 0;
let isCelebrating = false


let get_auth = ""
if (LIGHT_USERNAME != "") get_auth = LIGHT_USERNAME + ':' + LIGHT_PASSWORD + '@'


let custom_panel = `<Extensions>
  <Version>1.11</Version>
  <Panel>
    <Order>3</Order>
    <PanelId>panel_lights</PanelId>
    <Origin>local</Origin>
    <Location>HomeScreen</Location>
    <Icon>Lightbulb</Icon>
    <Name>Lights</Name>
    <ActivityType>Custom</ActivityType>
    <Page>
      <Name>Lights</Name>
      <Row>
        <Name>Control</Name>
        <Widget>
          <WidgetId>widget_20</WidgetId>
          <Name>Off</Name>
          <Type>Text</Type>
          <Options>size=1;fontSize=normal;align=center</Options>
        </Widget>
        <Widget>
          <WidgetId>widget_toggle_on_off</WidgetId>
          <Type>ToggleButton</Type>
          <Options>size=1</Options>
        </Widget>
        <Widget>
          <WidgetId>widget_21</WidgetId>
          <Name>On</Name>
          <Type>Text</Type>
          <Options>size=1;fontSize=normal;align=center</Options>
        </Widget>
      </Row>
      <Row>
        <Name>Color</Name>
        <Widget>
          <WidgetId>widget_25</WidgetId>
          <Name>Red</Name>
          <Type>Text</Type>
          <Options>size=1;fontSize=normal;align=center</Options>
        </Widget>
        <Widget>
          <WidgetId>widget_red_slider</WidgetId>
          <Type>Slider</Type>
          <Options>size=2</Options>
        </Widget>
        <Widget>
          <WidgetId>widget_red_value</WidgetId>
          <Name>0</Name>
          <Type>Text</Type>
          <Options>size=1;fontSize=normal;align=center</Options>
        </Widget>
        <Widget>
          <WidgetId>widget_31</WidgetId>
          <Name>Green</Name>
          <Type>Text</Type>
          <Options>size=1;fontSize=normal;align=center</Options>
        </Widget>
        <Widget>
          <WidgetId>widget_green_slider</WidgetId>
          <Type>Slider</Type>
          <Options>size=2</Options>
        </Widget>
        <Widget>
          <WidgetId>widget_green_value</WidgetId>
          <Name>0</Name>
          <Type>Text</Type>
          <Options>size=1;fontSize=normal;align=center</Options>
        </Widget>
        <Widget>
          <WidgetId>widget_32</WidgetId>
          <Name>Blue</Name>
          <Type>Text</Type>
          <Options>size=1;fontSize=normal;align=center</Options>
        </Widget>
        <Widget>
          <WidgetId>widget_blue_slider</WidgetId>
          <Type>Slider</Type>
          <Options>size=2</Options>
        </Widget>
        <Widget>
          <WidgetId>widget_blue_value</WidgetId>
          <Name>0</Name>
          <Type>Text</Type>
          <Options>size=1;fontSize=normal;align=center</Options>
        </Widget>

      </Row>
      <Row>
        <Name>Celebrate 🎉</Name>
        <Widget>
          <WidgetId>widget_button_celebrate</WidgetId>
          <Name>Go!</Name>
          <Type>Button</Type>
          <Options>size=3</Options>
        </Widget>
        <Widget>
          <WidgetId>widget_button_cancel</WidgetId>
          <Name>Cancel</Name>
          <Type>Button</Type>
          <Options>size=1</Options>
        </Widget>
      </Row>
      <Options/>
    </Page>
  </Panel>
</Extensions>
`

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


async function sendHTTPGet(url) {
  try {
    await xapi.Command.HttpClient.Get({ AllowInsecureHTTPS: 'True', Url: url })
      .then((response) => { if (response.StatusCode === "200") { console.debug("Successfully sent command via get: " + url) } });
  }
  catch (e) {
    console.log("http GET error... continuing")
    console.debug(e)
  }
}


// randomizeLights function sets each light to a random color and intensity
async function randomizeLights() {
  // modified to just always just show green, white and red representing the mexican flag since 
  // long response times from the lights were causing errors in the macro due to too many http connections
  console.debug("setting each bulb to a different color an intensity to celebrate...");
  let url = 'http://' + get_auth + ligthIPs[0] + '/color/0?turn=on&red=' + 0 + '&green=' + 255 + '&blue=' + 0 + '&white=0';
  await sendHTTPGet(url)
  await delay(200);

  url = 'http://' + get_auth + ligthIPs[1] + '/color/0?turn=on&red=' + 255 + '&green=' + 255 + '&blue=' + 255 + '&white=0';
  await sendHTTPGet(url)
  await delay(200);

  url = 'http://' + get_auth + ligthIPs[2] + '/color/0?turn=on&red=' + 255 + '&green=' + 255 + '&blue=' + 255 + '&white=0';
  await sendHTTPGet(url)
  await delay(200);

  url = 'http://' + get_auth + ligthIPs[3] + '/color/0?turn=on&red=' + 255 + '&green=' + 0 + '&blue=' + 0 + '&white=0';
  await sendHTTPGet(url)
  await delay(200);

  // original code to randomize all lights
  // for (let i = 0; i < ligthIPs.length; i++) {
  //   let url = 'http://' + get_auth + ligthIPs[i] + '/color/0?turn=on&red=' + Math.floor(Math.random() * 255) + '&green=' + Math.floor(Math.random() * 255) + '&blue=' + Math.floor(Math.random() * 255) + '&white=0';
  //    await sendHTTPGet(url)
  //    await delay(200);
  // }
}

async function lightSwitch(on_off_setting) {
  console.log("Turning all lights " + on_off_setting + "...");
  for (let i = 0; i < ligthIPs.length; i++) {
    let url = 'http://' + get_auth + ligthIPs[i] + '/color/0?turn=' + on_off_setting;
    if (!isCelebrating) await sendHTTPGet(url)
  }

}


async function setAllColors() {
  console.log("in setAllColors....");
  if (!isCelebrating)
    await setColor(red, green, blue, white);
}

async function setAllColorMode() {
  console.log("Setting all lights to color mode...");
  for (let i = 0; i < ligthIPs.length; i++) {
    let url = 'http://' + get_auth + ligthIPs[i] + '/color/0?mode=color';
    await sendHTTPGet(url)
    await delay(200);
  }
}

async function setColor(red, green, blue, white) {
  console.log("Setting all lights to color " + red + ", " + green + ", " + blue + ", " + white + "...");
  for (let i = 0; i < ligthIPs.length; i++) {
    let url = 'http://' + get_auth + ligthIPs[i] + '/color/0?red=' + red + '&green=' + green + '&blue=' + blue + '&white=' + white;
    if (!isCelebrating) await sendHTTPGet(url)
    await delay(200)
  }
}

async function handleWidgetActions(event) {
  let widgetId = event.WidgetId;

  switch (widgetId) {
    case 'widget_button_celebrate':
      if (event.Type == 'released') {
        console.log("Starting celebration!!")
        isCelebrating = true;
        if (CELEBRATING_URL != "")
          await xapi.Command.UserInterface.WebView.Display({ Url: CELEBRATING_URL });
        // set initial randomization of lights
        await randomizeLights()
        // radomize lights every 5000ms since latest version just shows the mexican flag colors always
        // set back to somthing smaller like 500ms if you want to randomize the lights
        nIntervId = setInterval(randomizeLights, 5000);
        // after CELEBRATING_DURATION ms, cancel the celebration! 
        cancelTimer = setTimeout(function () {
          clearInterval(nIntervId);
          if (CELEBRATING_URL != "") xapi.Command.UserInterface.WebView.Clear();
          isCelebrating = false;
        },
          CELEBRATING_DURATION);

      }
      break;
    case 'widget_button_cancel':
      if (event.Type == 'released') {
        console.log("Cancel celebration!!")
        if (cancelTimer)
          clearTimeout(cancelTimer);
        if (isCelebrating) {
          clearInterval(nIntervId);
          if (CELEBRATING_URL != "") xapi.Command.UserInterface.WebView.Clear();
          isCelebrating = false;
        }
      }
      break;
    case 'widget_red_slider':
      if (event.Type == "changed") {
        red = parseInt(event.Value);
        console.log("Red set to: " + red);
        await xapi.Command.UserInterface.Extensions.Widget.SetValue({ Value: red.toString(), WidgetId: 'widget_red_value' });
      }
      break;
    case 'widget_green_slider':
      if (event.Type == "changed") {
        green = parseInt(event.Value);
        console.log("Green set to: " + green);
        await xapi.Command.UserInterface.Extensions.Widget.SetValue({ Value: green.toString(), WidgetId: 'widget_green_value' });
      }
      break;
    case 'widget_blue_slider':
      if (event.Type == "changed") {
        blue = parseInt(event.Value);
        console.log("Blue set to: " + blue);
        await xapi.Command.UserInterface.Extensions.Widget.SetValue({ Value: blue.toString(), WidgetId: 'widget_blue_value' });
      }
      break;
    case 'widget_white_slider':
      if (event.Type == "changed") {
        white = parseInt(event.Value);
        console.log("White set to: " + white);
        await xapi.Command.UserInterface.Extensions.Widget.SetValue({ Value: white.toString(), WidgetId: 'widget_white_value' });
      }
      break;
    case 'widget_toggle_on_off':
      if (event.Type == 'changed') {
        if (event.Value == 'on') {
          console.log("Turning on lights...");
          await lightSwitch('on');
        } else {
          console.log("Turning off lights...");
          await lightSwitch('off');
        }
      }
      break
  }
}

async function main() {

  // Enable the HTTP Client
  xapi.Config.HttpClient.Mode.set('On');
  xapi.Config.HttpClient.AllowInsecureHTTPS.set('True');

  // create the custom panel
  xapi.Command.UserInterface.Extensions.Panel.Save({ PanelId: 'panel_lights' }, custom_panel);

  // set initial widget values
  await xapi.Command.UserInterface.Extensions.Widget.SetValue({ WidgetId: 'widget_red_slider', Value: red });
  await xapi.Command.UserInterface.Extensions.Widget.SetValue({ WidgetId: 'widget_red_value', Value: red.toString() });
  await xapi.Command.UserInterface.Extensions.Widget.SetValue({ WidgetId: 'widget_green_slider', Value: green });
  await xapi.Command.UserInterface.Extensions.Widget.SetValue({ WidgetId: 'widget_green_value', Value: green.toString() });
  await xapi.Command.UserInterface.Extensions.Widget.SetValue({ WidgetId: 'widget_blue_slider', Value: blue });
  await xapi.Command.UserInterface.Extensions.Widget.SetValue({ WidgetId: 'widget_blue_value', Value: blue.toString() });

  // register the custom panel events
  xapi.Event.UserInterface.Extensions.Widget.Action.on(event => handleWidgetActions(event));

  await setAllColorMode();
  await delay(1000);

  // set light color every second
  setInterval(setAllColors, 3000);

}

main()