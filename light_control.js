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


function sendCommand(message) {
  let url = 'https://' + switchIP + '/putxml';
  let headers = [
    'Content-Type: text/xml',
    `Authorization: Basic ${btoa(LIGHT_USERNAME + ':' + LIGHT_PASSWORD)}`
  ];

  let payload = "<Command><Message><Send><Text>" + message + "</Text></Send></Message></Command>";
  //xapi.Command.HttpClient.Post({ AllowInsecureHTTPS: 'True', Header: headers, Url: url }, payload)
  //    .then((response) => { if (response.StatusCode === "200") { console.log("Successfully sent: " + payload) } });
}


async function main() {

  // Enable the HTTP Client
  xapi.Config.HttpClient.Mode.set('On');
  xapi.Config.HttpClient.AllowInsecureHTTPS.set('True');

}

main()