import { Avatar } from '@mui/material'
import React from 'react'

const EmailContainer = ({emailId, onRemoveClick}) => {
  return (
    <div className='email_box'>
        <Avatar style={{width:'24px', height:"24px"}}/>
        <div>{emailId}</div>
    </div>
  )
}

export default EmailContainer