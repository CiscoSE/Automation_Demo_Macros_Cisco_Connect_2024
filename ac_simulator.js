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

let temperatureThreshold = 25; // Set the initial temperature threshold
let AUTO_FAN = false; // Set to true to enable automatic fan control
let thePanelID = 0



let custom_panel = `<Extensions>
  <Version>1.11</Version>
  <Panel>
    <Order>2</Order>
    <PanelId>panel_fan_control</PanelId>
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
              <Name>On</Name>
            </Value>
            <Value>
              <Key>2</Key>
              <Name>Off</Name>
            </Value>
          </ValueSpace>
        </Widget>
      </Row>
      <Row>
        <Name>Auto Temp</Name>
        <Widget>
          <WidgetId>widget_activate_auto</WidgetId>
          <Name>Activate</Name>
          <Type>Button</Type>
          <Options>size=2</Options>
        </Widget>
        <Widget>
          <WidgetId>widget_temp_select</WidgetId>
          <Type>Spinner</Type>
          <Options>size=2;style=plusminus</Options>
        </Widget>
      </Row>
      <Options/>
    </Page>
  </Panel>
</Extensions>

`

function sendCommand(message) {
    console.log("Sending command to switch: " + message)
    let auth = ""
    if (SWITCH_USERNAME != "") auth = SWITCH_USERNAME + ':' + SWITCH_PASSWORD + '@'
    let url = 'http://' + auth + switchIP + '/relay/0?turn=' + message;
    xapi.Command.HttpClient.Get({ AllowInsecureHTTPS: 'True', Url: url })
        .then((response) => { if (response.StatusCode === "200") { console.log("Successfully sent command via get: " + url) } });


}

async function checkTemp() {
    if (AUTO_FAN && thePanelID != 0) {
        const temp = await xapi.Status.Peripherals.ConnectedDevice[thePanelID].RoomAnalytics.AmbientTemperature.get()
        console.log(`Current temp in room: ${temp} and threshold is set to ${temperatureThreshold}`)
        if (parseInt(temp) > temperatureThreshold) {
            sendCommand('on')
        }
        else {
            sendCommand('off')
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
                    sendCommand('on')
                    AUTO_FAN = false
                    xapi.Command.UserInterface.Extensions.Widget.UnsetValue({ WidgetId: 'widget_temp_select' });
                    break;

                case '2':
                    console.log('Off');
                    console.log("Turning off Fan...");
                    sendCommand('off')
                    AUTO_FAN = false
                    xapi.Command.UserInterface.Extensions.Widget.UnsetValue({ WidgetId: 'widget_temp_select' });
                    break;
            }
            break;
        case 'widget_activate_auto':
            if (event.Type == 'released') {
                if (thePanelID != 0) {
                    console.log('auto');
                    await xapi.Command.UserInterface.Extensions.Widget.SetValue({ Value: temperatureThreshold.toString(), WidgetId: 'widget_temp_select' });
                    AUTO_FAN = true
                    checkTemp()
                }
                else {
                    console.log('Could not set to auto since no Navigator is detected to get temperature...')
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
                }
                else {
                    console.log('Cannot set the temperature threshold since no Navigator is detected to get temperature')
                }
            }

            break;
    }
}

async function main() {

    // Get the ID of the room navigator
    const peripherals = await xapi.Status.Peripherals.ConnectedDevice.get()
    peripherals.forEach(peripheral => {
        if (peripheral.Name == "Cisco Room Navigator") {
            thePanelID = parseInt(peripheral.id);
        }
    })
    console.log(`Navigator panel id: ${thePanelID}`)

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