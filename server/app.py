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