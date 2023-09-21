1.  make directory for entire project
2.  setup for vite-react frontend
3.  run 'npm create vite' in project directory
4.  follow steps for creating vite project, name the directory 'client'
5.  cd into client
6.  run npm install, npm run dev
    setup for python-flask backend:
7.  in parent directory, run 'mkdir server'
8.  in parent directory (one above server, in this case the 'FS_REACT_TEMPLATE dir) run pipenv install
9.  in parent directory run 'pipenv shell'
10. in parent directory run 'pipenv install flask flask_sqlalchemy flask_migrate flask_restful flask_bcrypt flask_cors sqlalchemy-serializer sqlalchemy'
11. cd into server directory
12. run 'touch app.py seed.py config.py models.py'
13. lets edit config.py, copy and paste the following into config.py:

```python

from flask import Flask
from flask_bcrypt import Bcrypt
from flask_migrate import Migrate
from flask_restful import Api
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData
import secrets
from flask_cors import CORS

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.json.compact = False
app.secret_key = secrets.token_hex(16)

metadata = MetaData(naming_convention={
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    })

db = SQLAlchemy(metadata=metadata)
migrate = Migrate(app, db)
db.init_app(app)

bcrypt = Bcrypt(app)
api = Api(app)
CORS(app)

```

14. lets add a basic user and authentication to our models, copy and paste the following into models.py:

```python

from sqlalchemy.orm import validates
from sqlalchemy.ext.hybrid import hybrid_property
from config import db, bcrypt

class User(db.Model, SerializerMixin):

    __tablename__ = 'users'

    serialize_rules = ('-_password_hash',)

    id = db.Column(db.Integer, primary_key = True)
    username = db.Column(db.String, nullable=False)
    _password_hash = db.Column(db.String)

    @hybrid_property
    def password_hash(self):
        raise Exception('Password hashes may not be viewed')

    @password_hash.setter
    def password_hash(self, password):
        password_hash =  bcrypt.generate_password_hash(password.encode('utf-8'))
        self._password_hash = password_hash.decode('utf-8')

    def authenticate(self, password):
        return bcrypt.check_password_hash(
            self._password_hash, password.encode('utf-8')
        )

    @validates('username')
    def validate_username(self, key, name):
        if not name or not isinstance(name, str):
            raise ValueError('Username must be non-empty string.')
        return name

```

15. now we need to initialize our backend database, run these in the server directory:
    '
    flask db init
    flask db upgrade
    flask db revision --autogenerate -m'your commit message'
    flask db upgrade
    '

16. lets export and deploy our backend to be sure that it is working. make sure to be in the server direectory and run the following 'export FLASK_APP=app.py' then run 'export FLASK_RUN_PORT=5555'(for mac users, otherwise FLASK_RUN_PORT=5000)

17. now lets setup some basic views for the server so we can interact with our models, copy and paste the following into app.py:

```python

from flask import request, session
from flask_restful import Resource
from config import app, db, api
from models import User

@app.route('/')
def index():
    return '<h1>Server Home</h1>'

class Signup(Resource):

    def post(self):
        username = request.get_json().get('username')
        password = request.get_json().get('password')

        if username and password and not User.query.filter(User.username == username).first():
            new_user = User(
                username = username
                )
            new_user.password_hash = password
            db.session.add(new_user)
            db.session.commit()
            session['user_id'] = new_user.id
            return new_user.to_dict(), 201

        return {'error': '422 Unprocessable Entity'}, 422


class Login(Resource):

    def post(self):
        data = request.get_json()
        username = data['username']
        password = data['password']

        user = User.query.filter(User.username == username).first()

        if user:
            if user.authenticate(password):
                session['user_id'] = user.id
                if session['user_id']:
                    return user.to_dict(), 200
                return {'error': 'session could not be established'}, 400

        return {'error': "Unauthorized"}, 401

class CheckSession(Resource):

    def get(self):
        user = User.query.filter(User.id == session.get('user_id')).first()
        if user:
            return user.to_dict(), 200
        return {'error': 'Unauthorized'}, 401

class Logout(Resource):

    def delete(self):

        if session.get('user_id'):
            session['user_id'] = None
            return {}, 204
        return {'error': 'Unauthorized'}, 401

api.add_resource(Signup, '/signup', endpoint='signup')
api.add_resource(CheckSession, '/check_session', endpoint='check_session')
api.add_resource(Login, '/login', endpoint='login')
api.add_resource(Logout, '/logout', endpoint='logout')

if __name__ == '__main__':
    app.run(port=5555, debug=True)
```

Connect the front to the back with basic sign-up/login 17. Lets setup our proxy first, open vite.config.js and lets add our proxy:

```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    cors: true,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5555/",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
```

18. Lets make a basic user sign-up/login page, cd into '/client'. run 'npm install react-router-dom'
19. Open main.jsx and make sure it looks like this:

```javascript
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter as Router } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);
```

20. cd into 'client/src' in the terminal
21. make a components directory with: 'mkdir components'
22. cd into components and run 'touch Home.jsx Login.jsx Nav.jsx Signup.jsx'
23. lets make the components for our basic login page starting with Home:

Home (copy and paste in the Home.jsx component):

```javascript
function Home({ user }) {
  return (
    <section>
      {user ? <h2>Welcome {user.username}!</h2> : <h2>Welcome!</h2>}
    </section>
  );
}

export default Home;
```

Login (copy and paste in the Login.jsx component):

```javascript
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    }).then((r) => {
      if (r.ok) {
        r.json().then((user) => {
          onLogin(user);
          navigate("/");
        });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>Username</label>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <label>Password</label>
      <input
        type="text"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Submit</button>
    </form>
  );
}

export default Login;
```

Nav (copy and paste into Nav.jsx component):

```javascript
import { NavLink } from "react-router-dom";

function Nav({ user, logout }) {
  return (
    <section>
      {user ? (
        <>
          <NavLink to={"/"} exact="true">
            Home
          </NavLink>
          <button onClick={() => logout()}>Logout</button>
        </>
      ) : (
        <>
          <NavLink to={"/signup"}>Sign up</NavLink>
          <NavLink to={"/login"} exact="true">
            Login
          </NavLink>
        </>
      )}
    </section>
  );
}

export default Nav;
```

Signup (copy and paste into Signup.jsx component):

```javascript
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [status, setStatus] = useState(false);
  const navigate = useNavigate();

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus(true);
        navigate("/login");
      } else {
        const data = await response.json();
        alert(`Registration failed: ${data.message}`);
      }
    } catch (error) {
      console.error("Error during registration:", error);
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
  );
}

export default Signup;
```

finally make sure the App.jsx component looks like this:

```javascript
import { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Home from "./components/Home";
import Nav from "./components/Nav";

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      const response = await fetch("/api/check_session");
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      }
    }
    fetchData();
  }, []);

  function logout() {
    setUser(null);
    fetch("/api/logout", {
      method: "DELETE",
    });
    navigate("/");
  }

  return (
    <main>
      <Nav user={user} logout={logout} />
      <Routes>
        <Route path="/" element={<Home user={user} />}></Route>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login onLogin={setUser} />} />
      </Routes>
    </main>
  );
}

export default App;
```

24. now we deploy the front end. from the client direcotry run 'npm run dev' and the front end should now show all the componenets we made and have basic user login. Make sure the backend is running as well from the server directory, run 'python3 app.py'

25. That's it! that is the minimal set-up for basic user login and authentication with flask backend and vite-react front end. I hope you found this super helpful!
