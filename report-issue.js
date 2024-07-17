/*
CISCO SAMPLE CODE LICENSE Version 1.1 Copyright (c) 2022 Cisco and/or its affiliates
These terms govern this Cisco Systems, Inc. ("Cisco"), example or demo source code and its associated documentation (together, the "Sample Code"). By downloading, copying, modifying, compiling, or redistributing the Sample Code, you accept and agree to be bound by the following terms and conditions (the "License"). If you are accepting the License on behalf of an entity, you represent that you have the authority to do so (either you or the entity, "you"). Sample Code is not supported by Cisco TAC and is not tested for quality or performance. This is your only license to the Sample Code and all rights not expressly granted are reserved.
LICENSE GRANT: Subject to the terms and conditions of this License, Cisco hereby grants to you a perpetual, worldwide, non-exclusive, non- transferable, non-sublicensable, royalty-free license to copy and modify the Sample Code in source code form, and compile and redistribute the Sample Code in binary/object code or other executable forms, in whole or in part, solely for use with Cisco products and services. For interpreted languages like Java and Python, the executable form of the software may include source code and compilation is not required.
CONDITIONS: You shall not use the Sample Code independent of, or to replicate or compete with, a Cisco product or service. Cisco products and services are licensed under their own separate terms and you shall not use the Sample Code in any way that violates or is inconsistent with those terms (for more information, please visit: www.cisco.com/go/terms).
OWNERSHIP: Cisco retains sole and exclusive ownership of the Sample Code, including all intellectual property rights therein, except with respect to any third-party material that may be used in or by the Sample Code. Any such third-party material is licensed under its own separate terms (such as an open source license) and all use must be in full accordance with the applicable license. This License does not grant you permission to use any trade names, trademarks, service marks, or product names of Cisco. If you provide any feedback to Cisco regarding the Sample Code, you agree that Cisco, its partners, and its customers shall be free to use and incorporate such feedback into the Sample Code, and Cisco products and services, for any purpose, and without restriction, payment, or additional consideration of any kind. If you initiate or participate in any litigation against Cisco, its partners, or its customers (including cross-claims and counter-claims) alleging that the Sample Code and/or its use infringe any patent, copyright, or other intellectual property right, then all rights granted to you under this License shall terminate immediately without notice.
LIMITATION OF LIABILITY: CISCO SHALL HAVE NO LIABILITY IN CONNECTION WITH OR RELATING TO THIS LICENSE OR USE OF THE SAMPLE CODE, FOR DAMAGES OF ANY KIND, INCLUDING BUT NOT LIMITED TO DIRECT, INCIDENTAL, AND CONSEQUENTIAL DAMAGES, OR FOR ANY LOSS OF USE, DATA, INFORMATION, PROFITS, BUSINESS, OR GOODWILL, HOWEVER CAUSED, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
DISCLAIMER OF WARRANTY: SAMPLE CODE IS INTENDED FOR EXAMPLE PURPOSES ONLY AND IS PROVIDED BY CISCO "AS IS" WITH ALL FAULTS AND WITHOUT WARRANTY OR SUPPORT OF ANY KIND. TO THE MAXIMUM EXTENT PERMITTED BY LAW, ALL EXPRESS AND IMPLIED CONDITIONS, REPRESENTATIONS, AND WARRANTIES INCLUDING, WITHOUT LIMITATION, ANY IMPLIED WARRANTY OR CONDITION OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON- INFRINGEMENT, SATISFACTORY QUALITY, NON-INTERFERENCE, AND ACCURACY, ARE HEREBY EXCLUDED AND EXPRESSLY DISCLAIMED BY CISCO. CISCO DOES NOT WARRANT THAT THE SAMPLE CODE IS SUITABLE FOR PRODUCTION OR COMMERCIAL USE, WILL OPERATE PROPERLY, IS ACCURATE OR COMPLETE, OR IS WITHOUT ERROR OR DEFECT.
GENERAL: This License shall be governed by and interpreted in accordance with the laws of the State of California, excluding its conflict of laws provisions. You agree to comply with all applicable United States export laws, rules, and regulations. If any provision of this License is judged illegal, invalid, or otherwise unenforceable, that provision shall be severed and the rest of the License shall remain in full force and effect. No failure by Cisco to enforce any of its rights related to the Sample Code or to a breach of this License in a particular situation will act as a waiver of such rights. In the event of any inconsistencies with any other terms, this License shall take precedence.
*/
/*********************************************************
 * 
 * Author:              William Mills - updated by Charles Llewellyn (chllewel@cisco.com)
 *                    	Technical Solutions Specialist 
 *                    	wimills@cisco.com
 *                    	Cisco Systems
 * 
 * Version: 1-0-0
 * Released: 02/09/23
 * 
 * This is a Webex Device macro which lets a user select issue categories 
 * and enter issue details which are sent to a Webhook service
 * 
 * 
 * Full Readme, source code and license details are available here:
 * https://github.com/wxsd-sales/report-issue-macro
 * 
 ********************************************************/
 
 import xapi from 'xapi';
 import { GMM } from './GMM_Lib'
/*********************************************************
 * Configure the settings below
**********************************************************/
const ISSUE_NAME_1 = 'Technical Issue with Incoming Audio/Video' 
const ISSUE_NAME_2 = 'Technical Issue with Outgoing Audio/Video'
const ISSUE_NAME_3 = 'Can\'t connect to my meeting'
const ISSUE_NAME_4 = 'Request for a technician'
const config = {
  webexBotToken: '',            // WEBEX BOT TOKEN (learn more: https://developer.webex.com/bots)
  name: 'Report Issue',          // Name of the Button and Panel
  submitText: 'Submit Issue',       // Text displays on the submit button
  waitingText: 'Sending Feedback',
  showAlert: true,                  // Show success and error alerts while true. One waiting alert is shown while false
  allowInsecureHTTPs: true,         // Allow insecure HTTPS connections to the instant connect broker for testing
  panelId: 'feedback',
  start: {
    options: [
      ISSUE_NAME_1,  //IF YOU MODIFY THE NUMBER OF OPTIONS (ADD/REMOVE) YOU WILL NEED TO MODIFY LINES 269-281
      ISSUE_NAME_2,
      ISSUE_NAME_3,
      ISSUE_NAME_4,
    ]
  },
  form: {
    category: {
      type: {
        Text: {
          prefix: '',
          options: 'size=2;fontSize=normal;align=left'
        },
        Button: {
          name: ['Select Category', 'Change Category'],
          options: 'size=2'
        }
      },
      action: 'Options',
      placeholder: 'eg. Please select category',
      promptText: 'Please enter the problem description',         // Text input message
      inputType: 'SingleLine',   // Type of input field. SingleLine = alphanum, other options (Numeric, Password, PIN)
      showPlaceholder: true,
      visiable: true,     // True = field is visable | False = field is removed from UI
      modifiable: true   // If false, placeholder will be used always
    },
    name: {
      requires: ['category'],
      type: {
        Text: {
          prefix: 'Name:',
          options: 'size=2;fontSize=normal;align=left'
        },
        Button: {
          name: ['Enter Name', 'Change Name'],
          options: 'size=2'
        }
      },
      action: 'TextInput',
      placeholder: 'eg. John Smith (optional)',
      promptText: 'Please enter your name',
      inputType: 'SingleLine',
      showPlaceholder: true,
      visiable: true,
      modifiable: true
    },
    submit: {
      requires: ['category'],
      visiable: true,
      modifiable: true,
      action: 'Submit',
      value: 'active',
      type: {
        Button: {
          name: ['Submit Issue'],
          options: 'size=2'
        }
      }
    }
  }
}
/*********************************************************
 * Create Webex Mailer Groups
**********************************************************/
const myUserGroup1 = [];
const myUserGroup2 = [];
const myUserGroup3 = [];
const mailer1 = new GMM.Message.Webex.User(config.webexBotToken, myUserGroup1) // Technical Issue with Incoming/Outgoing Audio/Video Mailer
const mailer2 = new GMM.Message.Webex.User(config.webexBotToken, myUserGroup2) // Can't connect to my meeting Mailer
const mailer3 = new GMM.Message.Webex.User(config.webexBotToken, myUserGroup3) // Request for a technician Mailer
/*********************************************************
 * Main function to setup and add event listeners
**********************************************************/

/// Marco variables
let inputs = {};
let identification = {};

function main() {

  // Enable the HTTP Client
  xapi.Config.HttpClient.Mode.set('On');
  xapi.Config.HttpClient.AllowInsecureHTTPS.set(config.allowInsecureHTTPs ? 'True' : 'False');

  // Get Device Details
  xapi.Status.SystemUnit.Software.DisplayName.get()
  .then(result => {identification.software = result})
  .catch(e=>console.log('Could not get DisplayName: ' + e.message))

  xapi.Status.SystemUnit.Hardware.Module.SerialNumber.get()
  .then(result => {identification.SerialNumber = result})
  .catch(e=>console.log('Could not get SerialNumber: ' + e.message))

  xapi.Status.SystemUnit.ProductId.get()
  .then(result => {identification.ProductId = result})
  .catch(e=>console.log('Could not get ProductId: ' + e.message))

  xapi.Status.Webex.DeveloperId.get()
  .then(result => {identification.deviceId = result})
  .catch(e=>console.log('Could not get Device Id: ' + e.message))

  xapi.Status.UserInterface.ContactInfo.ContactMethod[1].Number.get()
  .then(result => {identification.contactNumber = result})
  .catch(e=>console.log('Could not get Contact Number: ' + e.message))
  
  
  xapi.Status.UserInterface.ContactInfo.Name.get()
  .then(result => {identification.contactInfoName = result})
  .catch(e=>console.log('Could not get Contact Info Name: ' + e.message))

  // Create the UI
  createPanel();

  // Monitor for Text Input Responses and Widget clicks
  xapi.Event.UserInterface.Message.TextInput.Response.on(processInput);
  xapi.Event.UserInterface.Extensions.Widget.Action.on(processWidget);

  // Reset the previous inputs when the panel is opened
  xapi.Event.UserInterface.Extensions.Panel.Clicked.on(event => {
    if (event.PanelId != config.panelId) return
    inputs = {};
    createPanel('start');
  });

}

setTimeout(main, 1000);

/*********************************************************
 * Additional functions which this macros uses
**********************************************************/


// Listen for clicks on the buttons
function processWidget(event) {
  // console.log(event);
  if (event.Type !== 'clicked') return

  console.log(event.WidgetId + ' Clicked');
  
  if(config.form.hasOwnProperty(event.WidgetId)) {
    switch (config.form[event.WidgetId].action) {
      case 'TextInput':
        createInput(event.WidgetId);
        break;
      case 'Options':
        createPanel('start');
        break;
      case 'Submit':
        xapi.Command.UserInterface.Extensions.Panel.Close();
        sendInformation();
    }
  } else if(event.WidgetId.startsWith('option')){

    const option = parseInt(event.WidgetId.slice(-1))

    console.log(`Option [${option}] selected, category [${config.start.options[option]}]`);
    inputs.category = config.start.options[option];
    createPanel();

  }
}

function createInput(type) {
  console.log('Opening Text Input for: ' + type);
  const field = config.form[type];
  let paramters = {
    FeedbackId: type,
    InputType: field.inputType,
    Placeholder: field.placeholder,
    Text: field.promptText,
    Title: config.name
  }
  if (inputs.hasOwnProperty(type)) {
    paramters.InputText = inputs[type];
  }
  xapi.Command.UserInterface.Message.TextInput.Display(paramters);
}

function processInput(event) {
  if (config.form.hasOwnProperty(event.FeedbackId)) {
    if (config.form.hasOwnProperty('regex')) {
      // Check input
    } else {
      inputs[event.FeedbackId] = event.Text;
    }
  }
  createPanel();
}

function alert(title, message, duration) {
  console.log(title + ': ' + message);
  if (!config.showAlert && !duration)
    return
  xapi.Command.UserInterface.Message.Alert.Display({
    Duration: duration ? duration : 3
    , Text: message
    , Title: title
  });
}

function parseJSON(inputString) {
  if (inputString) {
    try {
      return JSON.parse(inputString);
    } catch (e) {
      return false;
    }
  }
}

// The function will post the current inputs objects to a configured service URL
async function sendInformation() {
  alert('Sending', config.waitingText, 10);
  inputs.identification = identification;
  inputs.bookingId = await getBookingId();
  inputs.callDetails = await getCallDetails();
  inputs.conferenceDetails = await getConferenceDetails();

  console.log(JSON.stringify(inputs))
  if (inputs.category == ISSUE_NAME_1){
    mailer1.formattedBody("Webex Device Issue Reported", inputs.category, "**Requester:** "+inputs.name+"\n"+ "**Identification:** "+inputs.identification+"\n"+"**Booking Id:** "+inputs.bookingId+"\n"+"**Call Details:** "+inputs.callDetails+"\n"+"**Conference Details:** "+inputs.conferenceDetails+"\n","").post()
  }
  if (inputs.category == ISSUE_NAME_2){
    mailer1.formattedBody("Webex Device Issue Reported", inputs.category, "**Requester:** "+inputs.name+"\n"+ "**Identification:** "+inputs.identification+"\n"+"**Booking Id:** "+inputs.bookingId+"\n"+"**Call Details:** "+inputs.callDetails+"\n"+"**Conference Details:** "+inputs.conferenceDetails+"\n","").post()

  }
  if (inputs.category == ISSUE_NAME_3){
    mailer2.formattedBody("Webex Device Issue Reported", inputs.category, "**Requester:** "+inputs.name+"\n"+ "**Identification:** "+inputs.identification+"\n"+"**Booking Id:** "+inputs.bookingId+"\n"+"**Call Details:** "+inputs.callDetails+"\n"+"**Conference Details:** "+inputs.conferenceDetails+"\n","").post()

  }
  if (inputs.category == ISSUE_NAME_4){
    mailer3.formattedBody("Webex Device Issue Reported", inputs.category, "**Requester:** "+inputs.name+"\n"+ "**Identification:** "+inputs.identification+"\n"+"**Booking Id:** "+inputs.bookingId+"\n"+"**Call Details:** "+inputs.callDetails+"\n"+"**Conference Details:** "+inputs.conferenceDetails+"\n","").post()
  }
  alert('Success', 'Feedback sent, please wait for an agent to process', 10);
}

function getCallDetails(){
  return xapi.Status.Call.get()
    .then(result => {
      console.log('Current CallId:', ( result.length > 0 ) ? result[0].id : null)
      return ( result.length > 0 ) ? result[0] : null
    });
}

function getConferenceDetails(){
  return xapi.Status.Conference.Call.get()
    .then(result => {
      return (result.length > 0) ? result : null;
    });
}

function getBookingId(){
  return xapi.Status.Bookings.Current.Id.get()
  .then(result => {
    console.log('Current Booking Id:', (result == '') ? null : result)
    return (result == '') ? "null" : result;
  });
}

/*********************************************************
 * This function creates/updates the UI
**********************************************************/

function arrayContains(array, contains) {
  return contains.every(element => {
    return array.indexOf(element) !== -1;
  });
}

function createPanel(state) {

  function createWidget(key, type, name, options) {
    return `<Widget>
              <WidgetId>${key}</WidgetId>
              <Name>${name}</Name>
              <Type>${type}</Type>
              <Options>${options}</Options>
            </Widget>`
  }

  let fields = '';
  let active = {};

  if (state == 'start') {
    const prompt = createWidget('category-text', 'Text', 'Please select a category below:', 'size=3;fontSize=normal;align=left')
    fields = fields.concat(`<Row>${prompt}</Row>`);
    config.start.options.forEach( (option, i) => {
      //console.log(i + ':' + option);
      const widget = createWidget('option'+i, 'Button', option, 'size=4')
      fields = fields.concat(`<Row>${widget}</Row>`);
    })
  } else {

    for (const [key, field] of Object.entries(config.form)) {

      // If not modifiable, use the placeholder as value
      if (!field.modifiable)
        inputs[key] = field.placeholder;

      // If not visiable, or no types present don't display it.
      if (!field.visiable || !field.hasOwnProperty('type'))
        continue;

      console.log(`Field [${key}] requires: [${field.requires}] | Current Inputs:${Object.keys(inputs)}`);
      // If it has requirements, check they have been met
      if (field.hasOwnProperty('requires'))
        if (!arrayContains(Object.keys(inputs), field.requires))
          continue;

      // Store any active/inactive states for setting later
      if (field.hasOwnProperty('value'))
        active[key] = field.value;


      // Create the widgets
      let widgets = '';
      for (const [type, widget] of Object.entries(field.type)) {
        // console.log(type);
        // console.log(widget);
        if (type === 'Button') {
          widgets = widgets.concat(createWidget(key, type, inputs.hasOwnProperty(key) ? widget.name[1] : widget.name[0], widget.options));
        } else if (type === 'Text' && (inputs.hasOwnProperty(key) || field.showPlaceholder)) {
          widgets = widgets.concat(createWidget(key+'-text', type, inputs.hasOwnProperty(key) ? widget.prefix + ' ' + inputs[key] : field.placeholder, widget.options));
        }
      }

      fields = fields.concat(`<Row>${widgets}</Row>`);
    }
  }

  const panel = `
  <Extensions>
    <Panel>
      <Location>HomeScreenAndCallControls</Location>
      <Type>Statusbar</Type>
      <Icon>Helpdesk</Icon>
      <Name>${config.name}</Name>
      <Color>#0067ac</Color>
      <ActivityType>Custom</ActivityType>
      <Page>
        <Name>${config.name}</Name>
        ${fields}
        <Options>hideRowNames=1</Options>
      </Page>
    </Panel>
  </Extensions>`;

  xapi.Command.UserInterface.Extensions.Panel.Save(
    { PanelId: config.panelId },
    panel
  )

  // Set active/inactive widget values
  for (const [key, value] of Object.entries(active)) {
    console.log(`Key: ${key} | Value: ${value}`);
    xapi.Command.UserInterface.Extensions.Widget.SetValue(
      { Value: value, WidgetId: key });
  }
}
