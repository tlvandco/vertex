import React, { useEffect, useState } from 'react'
import api from '../services/api'

export default function Notifications(){
  const [notifications, setNotifications] = useState<any[]>([])
  useEffect(()=>{
    // TODO: replace userId with current user id
    api.get('/notifications/user/1').then(r=>setNotifications(r.data.data.content || r.data.data)).catch(()=>{})
  },[])
  return (
    <div style={{padding:20}}>
      <h2>Notifications</h2>
      <ul>
        {notifications.map(n=> <li key={n.id}>{n.title || n.message}</li>)}
      </ul>
    </div>
  )
}
