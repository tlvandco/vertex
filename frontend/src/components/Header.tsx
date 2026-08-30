import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Header(){
  const nav = useNavigate()
  function logout(){
    localStorage.removeItem('accessToken')
    nav('/login')
  }
  return (
    <div style={{display:'flex',padding:10,justifyContent:'space-between',background:'#eee'}}>
      <div>
        <Link to="/dashboard">VERTEX</Link>
        {' | '}
        <Link to="/projects">Projects</Link>
        {' | '}
        <Link to="/notifications">Notifications</Link>
      </div>
      <div>
        <button onClick={logout}>Logout</button>
      </div>
    </div>
  )
}
