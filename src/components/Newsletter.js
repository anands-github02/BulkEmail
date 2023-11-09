// Importing Libraries

import React, { useState } from 'react';
import '../App.css';
import { MenuItem, Select } from '@mui/material';
import EmailContainer from './EmailContainer';
import * as XLSX from 'xlsx/xlsx.mjs';
import { ServiceBusClient } from "@azure/service-bus";


// Declaring Variables
const Newsletter = () => {
    const [senderEmail, setSenderEmail] = useState(11);
    const [firstColumnData, setFirstColumnData] = useState([]);
    const [email, setEmail] = useState('');
    const [emailsToShow, setEmailsToShow] = useState(12);

    // Clearing the List Button
    const handleClearListClick = () => {
        setFirstColumnData([]);
    }

    // Adding Emails to the Recipient List (Seperated by ',')
    const emailRegExp = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    const handleAddToListClick = () => {
        const emailList = email.split(',').map(email => email.trim());
        const invalidEmails = emailList.filter(email => !emailRegExp.test(email));
        if (invalidEmails.length > 0) {
            alert('Invalid Email: ' + invalidEmails.join(', '));
            return;
        }
        const updatedEmailList = [
            ...firstColumnData,
            ...emailList.map((email, index) => ({ id: index + firstColumnData.length, email })),
        ];
        setFirstColumnData(updatedEmailList);
        setEmail('');
    }

    // View More Button
    const handleViewMoreClick = () => {
        const emailList = email.split(',').map(email => email.trim());
        const updatedEmailList = [
            ...firstColumnData,
            ...emailList.map((email, index) => ({ id: index + firstColumnData.length, email })),
        ];
        setEmailsToShow(emailsToShow === 12 ? updatedEmailList.length : 12);
    }

    // Reads Data from the Excel Sheet and Prints in the Recipient List
    const handleFileUpload = (event) => {
        const files = event.target.files;
        console.log('Started');
        const allData = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const data = e.target.result;
                    const workbook = XLSX.read(data, { type: 'binary' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const dataInFirstColumn = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
                    const firstColumn = dataInFirstColumn.map((row, index) => ({ id: index + firstColumnData.length, email: row[0] }));
                    allData.push(...firstColumn);
                    if (i === files.length - 1) {
                        const updatedEmailList = [...firstColumnData, ...allData];
                        console.log(updatedEmailList);
                        setFirstColumnData(updatedEmailList);
                    }
                };
                reader.readAsBinaryString(file);
            }
        }
    };
    console.log(firstColumnData)

    async function sendDataToAzureServiceBus() {
        const connectionString = "https://boldhanger.servicebus.windows.net/marketingmailers";
        const queueName = "marketingmailers";
        const serviceBusClient = new ServiceBusClient(connectionString);
        const sender = serviceBusClient.createSender(queueName);
      
        try {
          const message = {
            body: JSON.stringify({
                Subject:'Hari',
                Body:'Anand',
                RecipientsEmails:firstColumnData,    
            }),
          };
          await sender.sendMessages(message);
          alert("Message sent successfully.");
        } finally {
          await sender.close();
          await serviceBusClient.close();
        }
      }




    // User Interface Part of the Bulk Email 
    return (
        <div>
            <div className='composed'>
                <div className='header'>
                    <div className='text'>
                        <span>Bulk E-mail Sender</span>
                    </div>
                </div>

                {/* From E-mail */}
                <div className='body'>
                    <div className='bodyform' style={{ outline: 'none' }}>
                        <Select
                            style={{ outline: 'none' }}
                            value={senderEmail}
                            onChange={(event) => { setSenderEmail(event.target.value) }}
                        >
                            <MenuItem className='from_select' value={11} disabled>
                                From
                            </MenuItem>
                            <MenuItem className='from_select' value={1}>abc@gmail.com</MenuItem>
                            <MenuItem className='from_select' value={2}>def@gmail.com</MenuItem>
                            <MenuItem className='from_select' value={3}>mno@gmail.com</MenuItem>
                            <MenuItem className='from_select' value={4}>xyz@gmail.com</MenuItem>
                        </Select>

                        {/* To E-mail */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', flex: '1', border: 'none', cursor: 'pointer' }}>
                                {firstColumnData.reduce((uniqueEmails, email) => {
                                    if (!uniqueEmails.includes(email.email)) {
                                        uniqueEmails.push(email.email);
                                        return uniqueEmails;
                                    }
                                    return uniqueEmails;
                                }, []).slice(0, emailsToShow).map((uniqueEmail, index) => (
                                    <EmailContainer key={index} emailId={uniqueEmail} style={{ flex: '1 0 auto' }} />
                                ))}
                            </div>

                            <div style={{ marginLeft: '20px', marginRight: '20px' }}>
                                <button
                                    onClick={handleViewMoreClick}
                                    style={{
                                        cursor: 'pointer',
                                        width: '100px',
                                        fontSize: '14px',
                                        padding: '7px',
                                        marginLeft: 'auto',
                                        marginTop: '15px',
                                        marginBottom: '10px',
                                        border: '1px solid grey',
                                        borderRadius: '20px'
                                    }}
                                >
                                    {emailsToShow === 12 ? 'View More' : 'Hide'}
                                </button>
                            </div>
                        </div>
                        <div style={{ border: 'none', borderTop: '1px solid #333' }}>
                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                <input
                                    placeholder="Recipients"
                                    style={{
                                        border: 'none',
                                        fontFamily: 'arial',
                                        fontSize: '16px',
                                        outline: 'none'
                                    }}
                                    value={email}
                                    type="email"
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                    }}
                                   
                                />

                                {/* Adding E-mails to the Recipient Button*/}
                                <button
                                    id="add"
                                    style={{
                                        marginRight: '20px',
                                        marginLeft: '20px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        width: '120px',
                                        padding: '7px',
                                        border: '1px solid grey',
                                        borderRadius: '20px'
                                    }}
                                    onClick={handleAddToListClick}
                                >
                                    Add to List
                                </button>

                                {/* Clearing all the E-mails Button*/}
                                <button
                                    id="add"
                                    style={{
                                        marginRight: '20px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        width: '120px',
                                        padding: '7px',
                                        border: '1px solid grey',
                                        borderRadius: '20px'
                                    }}
                                    onClick={handleClearListClick}
                                >
                                    Clear List
                                </button>
                            </div>
                        </div>

                        {/* Subject Area */}
                        <input id='sub' type='text' placeholder='Subject' style={{ outline: 'none' }} />

                        {/* E-mail Body Area */}
                        <textarea id='body' rows="18" placeholder='Compose E-mail' style={{ outline: 'none', resize: "none" }} />
                    </div>
                </div>

                {/* Footer of the Bulk Email */}
                <div className='footer'>
                    <div className='right'>

                        {/* Choosing a CSV File input */}
                        <input
                            id="send1"
                            style={{ fontSize: '16px', fontWeight: 'bold' }}
                            type="file"
                            accept=".xlsx, .xls, .csv"
                            multiple
                            onChange={handleFileUpload}
                        />
                        {/* Send Button */}
                        <button id='send' type='button' onClick={()=>{sendDataToAzureServiceBus()}}>Send</button>
                        {/* Previous Code of the UI Design */}
                        {/* <div className='email_container'>
                <h1> MyhraKi Newsletter</h1>
                <div className='page'>
                    <div className='from_container'>
                        <div className='from'>
                            <div className='heading1'>From:</div>
                            <Select value={senderEmail} onChange={(event) => { setSenderEmail(event.target.value) }}>
                                <MenuItem default={true} className='from_select' value={1}>manasi@gmail.com</MenuItem>
                                <MenuItem className='from_select' value={2}>anand@gmail.com</MenuItem>
                                <MenuItem className='from_select' value={3}>amrutha@gmail.com</MenuItem>
                                <MenuItem className='from_select' value={4}>axxxx@gmail.com</MenuItem>
                            </Select>
                        </div>
                        <div className='import'>
                            <div className='heading1'>Import CSV File:</div>
                            <input style={{ fontSize: '16px', marginRight: '40px', fontWeight: 'bold' }} type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} />
                        </div>
                    </div>
                    <div className='fields'>
                        <div className='heading'>Recipients:</div>
                        <div className='to_container'>
                            {firstColumnData?.slice(0, 12).map((email) => {
                                return (
                                    <EmailContainer key={email.index} emailId={email.email} />
                                )
                            })}
                            {toEmails?.length > 12 && <div style={{ fontWeight: 'bold' }}>...</div>}
                        </div>
                    </div>
                    <div className='fields'>
                        <div className='heading'>Add Email Id's:</div>
                        <TextField style={{ marginBottom: '10px' }} value={email} type="email" onChange={(mansi) => { setEmail(mansi.target.value) }} />
                        <button id='add' style={{ cursor: 'pointer', marginBottom: '20px', fontSize: '14px', width: '120px', padding: '7px' }} onClick={handleAddToListClick}>Add to List</button>
                        <div className='heading'>Subject:</div>
                        <TextareaAutosize style={{ width: '100%', marginBottom: '20px', height: '40px', padding: '10px', fontFamily: 'arial', fontSize: '16px' }} value={subject} onChange={(e) => { setSubject(e.target.value) }} />
                        <div className='heading'>Compose E-mail:</div>
                        <TextareaAutosize style={{ width: '100%', marginBottom: '20px', height: '100px', padding: '10px', fontFamily: 'arial', fontSize: '16px' }} value={body} onChange={(e) => { setBody(e.target.value) }} />
                    </div>
                    <div style={{ textAlign: 'right', marginRight: '50px', marginBottom: '30px' }}>
                        <button id='cancle' style={{ cursor: 'pointer', fontSize: '18px', marginRight: '50px', width: '120px', padding: '7px' }} >Cancel</button>
                        <button id='send' style={{ cursor: 'pointer', fontSize: '18px', width: '120px', padding: '7px' }}>Send</button>
                    </div>
                </div>
            </div> */}
                    </div>
                </div>
            </div>
        </div >
    )
}
export default Newsletter