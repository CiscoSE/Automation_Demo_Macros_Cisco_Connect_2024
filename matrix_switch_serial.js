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
 * This macro controls an HDMI video matrix switcher directly connected to a Webex device via serial RS232 interface.
 * It allows the user to switch between different video sources using a custom panel on the touch interface.
 * 
 * It uses the commands as ASCII strings described at the end of this user manual: https://www.mt-viki.net/wp-content/uploads/2023/08/MT-HD4X4-MT-HD0808-MT-HD1616-User-Manual.pdf
 * 1All for input 1 to all outputs, 2All for input 2 to all outputs, 3All for input 3 to all outputs
 * and 4All for for input 4 to all outputs
 * 
 * 
 * Released: July 17, 2024
 * Updated: June 17, 2024
 *
 * Version: 1.0.1
*/
import xapi from 'xapi';

const serialBaudRate = 115200
const serialParity = 'None'
const serialPortDescription = 'HDMI Matrix Switcher'
const serialOutboundPort = 1

const custom_panel = `<Extensions>
  <Version>1.11</Version>
  <Panel>
    <Order>4</Order>
    <PanelId>panel_hdmi_input_select</PanelId>
    <Location>HomeScreen</Location>
    <Icon>Laptop</Icon>
    <Name>HDMI Input Select</Name>
    <ActivityType>Custom</ActivityType>
    <Page>
      <Name>HDMI Input Select</Name>
      <Row>
        <Name>HDMI Matrix input</Name>
        <Widget>
          <WidgetId>widget_hdmi_selector</WidgetId>
          <Type>GroupButton</Type>
          <Options>size=4</Options>
          <ValueSpace>
            <Value>
              <Key>1</Key>
              <Name>1</Name>
            </Value>
            <Value>
              <Key>2</Key>
              <Name>2</Name>
            </Value>
            <Value>
              <Key>3</Key>
              <Name>3</Name>
            </Value>
            <Value>
              <Key>4</Key>
              <Name>4</Name>
            </Value>
          </ValueSpace>
        </Widget>
      </Row>
      <Options/>
    </Page>
  </Panel>
</Extensions>`


function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function testSendText() {
  console.log("Starting send serial test")
  while (true) {
    console.log("Sending Hello there...")
    await xapi.Command.SerialPort.PeripheralControl.Send({ PortId: serialOutboundPort, Text: "Hello there" });
    await delay(1000)
  }
}


async function sendSerial(command) {
  console.log("Sending this command via serial: " + command)
  await xapi.Command.SerialPort.PeripheralControl.Send({ PortId: serialOutboundPort, Text: command });
}



async function handleWidgetActions(event) {
  let widgetId = event.WidgetId;

  if (widgetId == 'widget_hdmi_selector') {
    if (event.Type == 'released') switch (event.Value) {
      case '1':
        console.log('Switching to HDMI 1');
        sendSerial('1All')
        break;
      case '2':
        console.log('Switching to HDMI 2');
        sendSerial('2All')
        break;
      case '3':
        console.log('Switching to HDMI 3');
        sendSerial('3All')
        break;
      case '4':
        console.log('Switching to HDMI 4');
        sendSerial('4All')
        break
    }
  }
}


async function main() {
  xapi.Config.SerialPort.Mode.set("On");
  xapi.Config.SerialPort.Outbound.Mode.set("On");
  xapi.Config.SerialPort.Outbound.Port[serialOutboundPort].BaudRate.set(serialBaudRate);
  xapi.Config.SerialPort.Outbound.Port[serialOutboundPort].Parity.set(serialParity);
  xapi.Config.SerialPort.Outbound.Port[serialOutboundPort].Description.set(serialPortDescription);


  // create the custom panel
  xapi.Command.UserInterface.Extensions.Panel.Save({ PanelId: 'panel_hdmi_input_select' }, custom_panel);

  // register the custom panel events
  xapi.Event.UserInterface.Extensions.Widget.Action.on(event => handleWidgetActions(event));

}

main()

// testSendText()