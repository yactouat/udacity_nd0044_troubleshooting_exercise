from bootstrap import db


class TodosList(db.Model):
    __tablename__ = "todos_lists"

    id = db.Column(
        db.Integer,
        primary_key=True,
        autoincrement=True,
        unique=True
    )
    name = db.Column(db.String(), nullable=False)
    todos = db.relationship(
        "Todo",
        backref="list",
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<TodosList {self.id}, {self.name}>"


class Todo(db.Model):
    __tablename__ = "todos"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    completed = db.Column(db.Boolean, nullable=False, default=False)
    description = db.Column(db.String(), nullable=False)
    due_date = db.Column(db.DateTime, nullable=True)
    list_id = db.Column(
        db.Integer,
        db.ForeignKey("todos_lists.id"),
        nullable=False
    )

    def __repr__(self):
        return f"<Todo {self.id}, {self.completed}, {self.description}>"
