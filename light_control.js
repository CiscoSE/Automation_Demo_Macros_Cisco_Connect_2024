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
 * This macro controls a smart switch attached to a fan in the room where the Webex Room Device is located.
 * It lets the user set a temperature threshold and the fan will turn on when the room temperature is above the threshold.
 * It also allows for manual turnin on and off of the fan without using the temperature threshold.
 * It communicates with the smart switch using the HTTP interface provided by the vendor: https://www.shelly.com/documents/developers/ddd_communication.pdf
 * 
 * 
 * 
 * 
 * Released: July 17, 2024
 * Updated: June 17, 2024
 *
 * Version: 1.0.1
*/

import xapi from 'xapi';

const ligthIPs = ['10.0.1.111', '10.0.1.112', '10.0.1.113', '10.0.1.114']; // Set the IP address of the lights
const LIGHT_USERNAME = 'admin'; // Set the username for the smart switch
const LIGHT_PASSWORD = 'password'; // Set the password for the smart switch

let nIntervId;

let brightness = 100;
let red = 255;
let green = 255;
let blue = 255;
let white = 255;


let get_auth = ""
if (LIGHT_USERNAME != "") get_auth = LIGHT_USERNAME + ':' + LIGHT_PASSWORD + '@'


let custom_panel = `<Extensions>
  <Version>1.11</Version>
  <Panel>
    <Order>3</Order>
    <PanelId>panel_lights</PanelId>
    <Location>HomeScreen</Location>
    <Icon>Lightbulb</Icon>
    <Name>Ligths</Name>
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
        <Name>Brightness</Name>
        <Widget>
          <WidgetId>widget_brightness</WidgetId>
          <Type>Slider</Type>
          <Options>size=3</Options>
        </Widget>
        <Widget>
          <WidgetId>widget_text_bright_value</WidgetId>
          <Name>0</Name>
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
        <Widget>
          <WidgetId>widget_33</WidgetId>
          <Name>White</Name>
          <Type>Text</Type>
          <Options>size=1;fontSize=normal;align=center</Options>
        </Widget>
        <Widget>
          <WidgetId>widget_white_slider</WidgetId>
          <Type>Slider</Type>
          <Options>size=2</Options>
        </Widget>
        <Widget>
          <WidgetId>widget_white_value</WidgetId>
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
          <Options>size=4</Options>
        </Widget>
      </Row>
      <Options/>
    </Page>
  </Panel>
</Extensions>
`


// randomizeLights function sets each light to a random color and intensity
async function randomizeLights() {
  console.log("setting each bulb to a different color an intensity...");
  for (let i = 0; i < ligthIPs.length; i++) {
    let url = 'http://' + get_auth + ligthIPs[i] + '/color/0?turn=on&red=' + Math.floor(Math.random() * 255) + '&green=' + Math.floor(Math.random() * 255) + '&blue=' + Math.floor(Math.random() * 255) + '&white=' + Math.floor(Math.random() * 255);
    // xapi.Command.HttpClient.Get({ AllowInsecureHTTPS: 'True', Url: url })
    //   .then((response) => { if (response.StatusCode === "200") { console.log("Successfully sent command via get: " + url) } });
  }
}

function lightSwitch(on_off_setting) {
  console.log("Turning all lights " + on_off_setting + "...");
  for (let i = 0; i < ligthIPs.length; i++) {
    let url = 'http://' + get_auth + ligthIPs[i] + '/color/0?turn=' + on_off_setting;
    // xapi.Command.HttpClient.Get({ AllowInsecureHTTPS: 'True', Url: url })
    //   .then((response) => { if (response.StatusCode === "200") { console.log("Successfully sent command via get: " + url) } });
  }

}

function setBrightness(brightness) {
  console.log("Setting all lights to brightness " + brightness + "...");
  for (let i = 0; i < ligthIPs.length; i++) {
    let url = 'http://' + get_auth + ligthIPs[i] + '/color/0?brightness=' + brightness;
    // xapi.Command.HttpClient.Get({ AllowInsecureHTTPS: 'True', Url: url })
    //   .then((response) => { if (response.StatusCode === "200") { console.log("Successfully sent command via get: " + url) } });
  }
}

function setColor(red, green, blue, white) {
  console.log("Setting all lights to color " + red + ", " + green + ", " + blue + ", " + white + "...");
  for (let i = 0; i < ligthIPs.length; i++) {
    let url = 'http://' + get_auth + ligthIPs[i] + '/color/0?red=' + red + '&green=' + green + '&blue=' + blue + '&white=' + white;

    // xapi.Command.HttpClient.Get({ AllowInsecureHTTPS: 'True', Url: url })
    //   .then((response) => { if (response.StatusCode === "200") { console.log("Successfully sent command via get: " + url) } });
  }
}

async function handleWidgetActions(event) {
  let widgetId = event.WidgetId;

  switch (widgetId) {
    case 'widget_button_celebrate':
      if (event.Type == 'released') {
        console.log("Starting celebration!!")
        // set initial randomization of lights
        randomizeLights()
        // radomize lights every 500ms
        nIntervId = setInterval(randomizeLights, 500);
        // after 15 seconds, cancel the celebration! 
        setTimeout(function () { clearInterval(nIntervId) }, 15000);

      }
      break;
    case 'widget_brightness':
      if (event.Type == "changed") {
        let newBrightness = parseInt(event.Value * 100 / 255);
        console.log("Brightness set to: " + newBrightness);
        await xapi.Command.UserInterface.Extensions.Widget.SetValue({ Value: newBrightness.toString(), WidgetId: 'widget_text_bright_value' });
        setBrightness(newBrightness);
      }
      break;
    case 'widget_red_slider':
      if (event.Type == "changed") {
        red = parseInt(event.Value);
        console.log("Red set to: " + red);
        await xapi.Command.UserInterface.Extensions.Widget.SetValue({ Value: red.toString(), WidgetId: 'widget_red_value' });
        setColor(red, green, blue, white);
      }
      break;
    case 'widget_green_slider':
      if (event.Type == "changed") {
        green = parseInt(event.Value);
        console.log("Green set to: " + green);
        await xapi.Command.UserInterface.Extensions.Widget.SetValue({ Value: green.toString(), WidgetId: 'widget_green_value' });
        setColor(red, green, blue, white);
      }
      break;
    case 'widget_blue_slider':
      if (event.Type == "changed") {
        blue = parseInt(event.Value);
        console.log("Blue set to: " + blue);
        await xapi.Command.UserInterface.Extensions.Widget.SetValue({ Value: blue.toString(), WidgetId: 'widget_blue_value' });
        setColor(red, green, blue, white);
      }
      break;
    case 'widget_white_slider':
      if (event.Type == "changed") {
        white = parseInt(event.Value);
        console.log("White set to: " + white);
        await xapi.Command.UserInterface.Extensions.Widget.SetValue({ Value: white.toString(), WidgetId: 'widget_white_value' });
        setColor(red, green, blue, white);
      }
      break;
    case 'widget_toggle_on_off':
      if (event.Type == 'changed') {
        if (event.Value == 'on') {
          console.log("Turning on lights...");
          lightSwitch('on');
        } else {
          console.log("Turning off lights...");
          lightSwitch('off');
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
  await xapi.Command.UserInterface.Extensions.Widget.SetValue({ WidgetId: 'widget_white_slider', Value: white });
  await xapi.Command.UserInterface.Extensions.Widget.SetValue({ WidgetId: 'widget_white_value', Value: white.toString() });
  // for widget_text_bright_value we need to first convert the brightness to a range of 0-255 to match the slider
  const brightness_0_255 = Math.round(brightness * 2.55);
  await xapi.Command.UserInterface.Extensions.Widget.SetValue({ WidgetId: 'widget_brightness', Value: brightness_0_255 });
  await xapi.Command.UserInterface.Extensions.Widget.SetValue({ WidgetId: 'widget_text_bright_value', Value: brightness.toString() });

  // register the custom panel events
  xapi.Event.UserInterface.Extensions.Widget.Action.on(event => handleWidgetActions(event));

}

main()