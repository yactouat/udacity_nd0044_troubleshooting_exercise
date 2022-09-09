from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

# creates an application that is named after the name of the file
app = Flask(__name__)
app.config["SECRET_KEY"] = "some_dev_key"
app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://usr:pwd@pgsql:5432/todos"

# session_options={"expire_on_commit": False} =>
# would allow to manipulate out of date models
# after a transaction has been committed
# ! be aware that the above can have unintended side effects
db = SQLAlchemy(app)
# bootstrap database migrate commands
migrate = Migrate(app, db)
