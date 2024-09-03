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

const switchIP = '10.0.1.100'; // Set the IP address of the smart switch
const SWITCH_USERNAME = 'admin'; // Set the username for the smart switch, leave blank if not needed
const SWITCH_PASSWORD = 'password'; // Set the password for the smart switch

let showAutoTempInDisplay = false; // Controls showing the temperature threshold and auto activities in main display 

let temperatureThreshold = 25; // Set the initial temperature threshold
let AUTO_FAN = false; // Set to true to enable automatic fan control
let thePanelID = 0
let currentTemp = 0
let currentAutoFanStatus = 'off'



let custom_panel = `<Extensions>
  <Version>1.11</Version>
  <Panel>
    <Order>2</Order>
    <PanelId>panel_fan_control</PanelId>
    <Origin>local</Origin>
    <Location>HomeScreen</Location>
    <Icon>Hvac</Icon>
    <Name>Fan Control</Name>
    <ActivityType>Custom</ActivityType>
    <Page>
      <Name>Fan Control</Name>
      <Row>
        <Name>Manual Control</Name>
        <Widget>
          <WidgetId>widget_manual_toggle</WidgetId>
          <Type>GroupButton</Type>
          <Options>size=4</Options>
          <ValueSpace>
            <Value>
              <Key>1</Key>
              <Name>Turn On</Name>
            </Value>
            <Value>
              <Key>2</Key>
              <Name>Turn Off</Name>
            </Value>
          </ValueSpace>
        </Widget>
      </Row>
      <Row>
        <Name>Auto Temp Control</Name>
        <Widget>
          <WidgetId>widget_activate_auto</WidgetId>
          <Type>ToggleButton</Type>
          <Options>size=1</Options>
        </Widget>
        <Widget>
          <WidgetId>widget_temp_select</WidgetId>
          <Type>Spinner</Type>
          <Options>size=2;style=plusminus</Options>
        </Widget>
      </Row>
      <Row>
        <Name>Show Auto Temp Status</Name>
        <Widget>
          <WidgetId>widget_toggle_display_on_off</WidgetId>
          <Type>ToggleButton</Type>
          <Options>size=1</Options>
        </Widget>
        <Widget>
          <WidgetId>widget_35</WidgetId>
          <Name>Shown on main display when active</Name>
          <Type>Text</Type>
          <Options>size=3;fontSize=normal;align=center</Options>
        </Widget>
      </Row>
      <Options/>
    </Page>
  </Panel>
</Extensions>
`

async function displayTempReadings(status) {
  let message = ''
  if (status == 'on') {
    message = `Fan turned on since temperature is ${currentTemp} and threshold is ${temperatureThreshold}`
  }
  if (status == 'off') {
    message = `Fan turned off since temperature is ${currentTemp} and threshold is ${temperatureThreshold}`
  }
  if (status == '') {
    message = `Temperature is ${currentTemp} , threshold set to ${temperatureThreshold} and Fan is ${AUTO_FAN ? 'auto' : 'manual'}`
  }
  await xapi.Command.UserInterface.Message.Textline.Display({ Text: message, Duration: 10, X: 1, Y: 1 });

}


async function sendCommand(message) {
  console.log("Sending command to switch: " + message)
  let auth = ""
  if (SWITCH_USERNAME != "") auth = SWITCH_USERNAME + ':' + SWITCH_PASSWORD + '@'
  let url = 'http://' + auth + switchIP + '/relay/0?turn=' + message;
  await xapi.Command.HttpClient.Get({ AllowInsecureHTTPS: 'True', Url: url })
    .then((response) => { if (response.StatusCode === "200") { console.log("Successfully sent command via get: " + url) } });


}

async function checkTemp() {
  if (AUTO_FAN && thePanelID != 0) {
    currentTemp = await xapi.Status.Peripherals.ConnectedDevice[thePanelID].RoomAnalytics.AmbientTemperature.get()
    console.log(`Current temp in room: ${currentTemp} and threshold is set to ${temperatureThreshold}`)
    if (parseInt(currentTemp) > temperatureThreshold) {
      await sendCommand('on')
      if (showAutoTempInDisplay && currentAutoFanStatus != 'on') displayTempReadings('on');
      currentAutoFanStatus = 'on'
      await xapi.Command.UserInterface.Extensions.Widget.SetValue({ Value: '1', WidgetId: 'widget_manual_toggle' });
    }
    else {
      await sendCommand('off')
      if (showAutoTempInDisplay && currentAutoFanStatus != 'off') displayTempReadings('off');
      currentAutoFanStatus = 'off'
      await xapi.Command.UserInterface.Extensions.Widget.SetValue({ Value: '2', WidgetId: 'widget_manual_toggle' });
    }
  }
}

async function handleWidgetActions(event) {
  let widgetId = event.WidgetId;

  switch (widgetId) {
    case 'widget_manual_toggle':
      if (event.Type == 'released') switch (event.Value) {
        case '1':
          console.log('On');
          console.log("Turning on Fan...");
          await sendCommand('on')
          AUTO_FAN = false
          xapi.Command.UserInterface.Extensions.Widget.UnsetValue({ WidgetId: 'widget_temp_select' });
          await xapi.Command.UserInterface.Extensions.Widget.SetValue({ Value: 'off', WidgetId: 'widget_activate_auto' });
          break;

        case '2':
          console.log('Off');
          console.log("Turning off Fan...");
          await sendCommand('off')
          AUTO_FAN = false
          xapi.Command.UserInterface.Extensions.Widget.UnsetValue({ WidgetId: 'widget_temp_select' });
          await xapi.Command.UserInterface.Extensions.Widget.SetValue({ Value: 'off', WidgetId: 'widget_activate_auto' });
          break;
      }
      break;
    case 'widget_activate_auto':
      if (event.Type == 'changed') {
        if (thePanelID != 0) {
          if (event.Value == 'on') {
            console.log('auto');
            await xapi.Command.UserInterface.Extensions.Widget.SetValue({ Value: temperatureThreshold.toString(), WidgetId: 'widget_temp_select' });
            AUTO_FAN = true
            checkTemp()
          } else {
            console.log('manual');
            await xapi.Command.UserInterface.Extensions.Widget.UnsetValue({ WidgetId: 'widget_temp_select' });
            AUTO_FAN = false
          }
          if (showAutoTempInDisplay) displayTempReadings('');
        }
        else {
          console.log('Could not change auto since no Navigator is detected to get temperature...')
          await xapi.Command.UserInterface.Extensions.Widget.SetValue({ Value: 'off', WidgetId: 'widget_activate_auto' });
        }
      }
      break;
    case 'widget_temp_select':
      if (event.Type == "pressed") {
        if (thePanelID != 0) {
          if (event.Value == 'increment') temperatureThreshold++
          if (event.Value == 'decrement') temperatureThreshold--
          console.log("Temperature threshold set to: " + temperatureThreshold);
          await xapi.Command.UserInterface.Extensions.Widget.SetValue({ Value: temperatureThreshold.toString(), WidgetId: 'widget_temp_select' });
          checkTemp();
        }
        else {
          console.log('Cannot set the temperature threshold since no Navigator is detected to get temperature')
        }
      }
      break;
    case 'widget_toggle_display_on_off':
      if (event.Type == 'changed') {
        if (event.Value == 'on') {
          console.log("Start showing temp change events on main display...");
          showAutoTempInDisplay = true;
        } else {
          console.log("Stop showing temp change events on main display...");
          showAutoTempInDisplay = false;
        }
        displayTempReadings('');
      }
      break
  }
}

async function main() {

  // Get the ID of the room navigator
  const peripherals = await xapi.Status.Peripherals.ConnectedDevice.get()
  peripherals.forEach(peripheral => {
    if (peripheral.Name == "Cisco Room Navigator" && peripheral.Location == "InsideRoom") {
      thePanelID = parseInt(peripheral.id);
    }
  })
  console.log(`Navigator panel id: ${thePanelID}`)
  if (thePanelID != 0) {
    currentTemp = await xapi.Status.Peripherals.ConnectedDevice[thePanelID].RoomAnalytics.AmbientTemperature.get()
  }

  // Enable the HTTP Client
  xapi.Config.HttpClient.Mode.set('On');
  xapi.Config.HttpClient.AllowInsecureHTTPS.set('True');

  // call checkTemp every minute
  setInterval(checkTemp, 60000);

  // create the custom panel
  xapi.Command.UserInterface.Extensions.Panel.Save({ PanelId: 'panel_fan_control' }, custom_panel);


  // register the custom panel events
  xapi.Event.UserInterface.Extensions.Widget.Action.on(event => handleWidgetActions(event));

}

main()