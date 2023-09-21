import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Signup from './components/Signup'
import Login from './components/Login'
import Home from './components/Home'
import Nav from './components/Nav'

function App() {

  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
      async function fetchData(){
        const response = await fetch('/api/check_session')
        if (response.ok){
          const data = await response.json()
          setUser(data)
        }
      }
      fetchData()
    },[])
    
    function logout(){
      setUser(null)
      fetch('/api/logout', {
        method: 'DELETE'
      })
      navigate('/')
    }
    
  return (
    <main>
      <Nav user={user} logout={logout}/>
      <Routes>
        <Route path='/' element={<Home user={user}/>}></Route>
        <Route path='/signup' element={<Signup/>}/>
        <Route path='/login' element={<Login onLogin={setUser}/>}/>
      </Routes>
    </main>
  )
}

export default App