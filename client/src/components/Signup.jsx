import { useState } from "react"
import { useNavigate } from "react-router-dom"

function Signup(){

    const [formData, setFormData] = useState({
        username: '',
        password: ''
    })

    const [status, setStatus] = useState(false)
    const navigate = useNavigate()

    function handleChange(event){
        const {name, value} = event.target
        setFormData({...formData, [name]:value})
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        try {
            const response = await fetch('/api/signup', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(formData),
            }
            )
    
          if (response.ok) {
            setStatus(true)
            navigate('/login')
          } else {
            const data = await response.json();
            alert(`Registration failed: ${data.message}`);
          }
        } catch (error) {
          console.error('Error during registration:', error);
        }
      };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
            />
            <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
            />
            <button type="submit">Sign Up</button>
        </form>
    )
}

export default Signup