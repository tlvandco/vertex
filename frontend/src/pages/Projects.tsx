import React, { useEffect, useState } from 'react'
import api from '../services/api'

export default function Projects(){
  const [projects, setProjects] = useState<any[]>([])
  useEffect(()=>{
    api.get('/projects').then(r=>setProjects(r.data.data)).catch(()=>{})
  },[])
  return (
    <div style={{padding:20}}>
      <h2>Projects</h2>
      <ul>
        {projects.map(p=> <li key={p.id}>{p.name} ({p.status})</li>)}
      </ul>
    </div>
  )
}
