import React, { useEffect, useState } from 'react'
import api from '../services/api'

export default function Dashboard(){
  const [data, setData] = useState<any>(null)

  useEffect(()=>{
    api.get('/analytics/dashboard').then(r=>setData(r.data.data)).catch(()=>{})
  },[])

  return (
    <div style={{padding:20}}>
      <h2>Dashboard</h2>
      {data ? (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  )
}
