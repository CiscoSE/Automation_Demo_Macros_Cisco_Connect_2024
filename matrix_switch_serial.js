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

xapi.Config.SerialPort.Outbound.Mode.set("On");

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function sendText() {
  console.log("Starting send serial test")
  while (true) {
    console.log("Sending Hello there...")
    await xapi.Command.SerialPort.PeripheralControl.Send({ PortId: 1, Text: "Hello there" });
    await delay(1000)
  }
}

sendText()