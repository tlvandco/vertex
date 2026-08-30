import React, { useState } from 'react'
import api from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const nav = useNavigate()

  async function submit(e: React.FormEvent){
    e.preventDefault()
    try{
      const res = await api.post('/auth/login', { email, password })
      const token = res.data?.data?.token
      if (token) {
        localStorage.setItem('accessToken', token)
        nav('/dashboard')
      }
    }catch(err:any){
      setError(err?.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div style={{padding:20}}>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <div>
          <label>Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} />
        </div>
        <div>
          <label>Password</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        </div>
        {error && <div style={{color:'red'}}>{error}</div>}
        <button type="submit">Login</button>
      </form>
    </div>
  )
}
