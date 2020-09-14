from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_mysql import MySQL
import os


# Init app
app = Flask(__name__)
basedir = os.path.abspath(os.path.dirname(__file__))
app.confiq['MYSQL_USER'] = 'root'
app.confiq['MYSQL_PASSWORD'] = ''
app.confiq['MYSQL_HOST'] = 'localhost'
app.confiq['MYSQL_DB'] = 'llaima'
app.confiq['MYSQL_CURSORCLASS'] = 'DictCursor'

# Database
mysql = MySQL(app)

# Initialize DB
db = SQLAlchemy(app)

# Initialize MA
ma = Marshmallow(app)

# Product Class/Model


class Subscriptions(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True)
    is_subscribed = db.Column(db.String(5))

    def __init__(self, email, isSubscribed):
        self.email = email
        self.is_subscribed = isSubscribed

# Schema


class SubscriptionsSchema(ma.Schema):
    class Meta:
        fields = ('email', 'is_subscribed')


subscription_schema = SubscriptionsSchema()
subscriptions_schema = SubscriptionsSchema(many=True)


# Create Subscription
@app.route('/subscribe', methods=['POST'])
def create_subs():
    email = request.json['email']
    is_subscribed = 'true'
    cur = mysql.connection.cursor()
    cur.execute(
        '''INSERT INTO subscriptions VALUES ({email}, {is_subscribed})''')
    new_subscription = Subscriptions(email, is_subscribed)
    mysql.connection.commit()
    return subscription_schema.jsonify(new_subscription)


# Run Server
if __name__ == '__main__':
    app.run(debug=True)
