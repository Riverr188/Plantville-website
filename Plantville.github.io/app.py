from flask import Flask, render_template, request, session, redirect, url_for
from flask_mysqldb import MySQL
import MySQLdb.cursors
import re

# Initialize Flask application
app = Flask(__name__)

# Configure MySQL
app.secret_key = '123456789'
app.config['MYSQL_HOST'] = '127.0.0.1'
app.config['MYSQL_PORT'] = 3306
app.config['MYSQL_USER'] = 'name1'
app.config['MYSQL_PASSWORD'] = '123456'
app.config['MYSQL_DB'] = 'login_sys'

mysql = MySQL(app)

# Registration route
@app.route('/register_page.html', methods=['GET', 'POST'])
def register_page():
    msg = ''
    if request.method == 'POST' and 'username' in request.form and 'password' in request.form and 'email' in request.form:
        username = request.form['username']
        password = request.form['password']
        email = request.form['email']
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT * FROM accounts WHERE username = %s', (username,))
        account = cursor.fetchone()
        if account:
            msg = 'Account already exists!'
        elif not re.match(r'[A-Za-z0-9]+', username):
            msg = 'Username must contain only characters and numbers!'
        elif not re.match(r'[^@]+@[^@]+\.[^@]+', email):
            msg = 'Invalid email address!'
        elif not username or not password or not email:
            msg = 'Please fill out the form!'
        else:
            cursor.execute('INSERT INTO accounts (username, email, password) VALUES (%s, %s, %s)', (username, email, password))
            mysql.connection.commit()
            msg = 'You have successfully registered!'
            cursor.close()
            return redirect(url_for('login'))
        cursor.close()
    return render_template('register_page.html', msg=msg)

# Home page route
@app.route("/home_page", methods=['GET', 'POST'])
def home_page():
    return render_template("home_page.html")

# Test DB connection route
@app.route('/test_db')
def test_db():
    try:
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT * FROM accounts')
        accounts = cursor.fetchall()
        if not accounts:
            return "No data found in the accounts table."
        return render_template('test_db.html', accounts=accounts)
    except MySQLdb.Error as e:
        return f"Error reading from MySQL Database: {e}"

# Login route (index page)
@app.route("/", methods=['GET', 'POST'])
def login():
    msg = ''
    if request.method == 'POST' and 'username' in request.form and 'password' in request.form:
        username = request.form['username']
        password = request.form['password']
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT * FROM accounts WHERE username = %s AND password = %s', (username, password))
        account = cursor.fetchone()
        if account:
            session['loggedin'] = True
            session['id'] = account['id']
            session['username'] = account['username']
            msg = 'Logged in successfully!'
            return render_template('home_page.html', msg=msg)
        else:
            msg = 'Incorrect username/password!'
    return render_template('login_page.html', msg=msg)

# Logout route
@app.route('/logout', methods=['POST'])
def logout():
    session.pop('loggedin', None)
    session.pop('id', None)
    session.pop('username', None)
    return redirect(url_for('login'))

@app.route('/checkitems', methods=['GET'])
def checkitems():
    return render_template("checkitems.html")

    
@app.route('/dashboard', methods=['GET'])
def dashboard():
    return render_template("dashboard.html")

# Run Flask app
if __name__ == '__main__':
    app.run(debug=True)
