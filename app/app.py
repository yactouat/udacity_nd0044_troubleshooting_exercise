import sys
from init import app, db
from flask import abort, jsonify, redirect, render_template, request, url_for
from models import TodosList, Todo


# @app.route is a decorator that takes an input function index()
# as the callback that gets invoked
# when a request to route / comes in from a client
@app.route('/')
def index():
    return redirect(url_for("get_todos_from_list"))


# JSON
@app.route("/lists", methods=["POST"])
def create_list():
    responseBody = {}
    try:
        name = request.get_json()["name"]
        list = TodosList(name=name)
        responseBody["msg"] = "todos list has been created"
        db.session.add(list)
        db.session.commit()
        responseBody["id"] = list.id
        responseBody['name'] = list.name
    except Exception as e:
        error = True
        db.session.rollback()
        print(sys.exc_info())
    finally:
        db.session.close()
        if error:
            abort(400)
        else:
            return jsonify(responseBody)


# web
@app.route("/lists/<list_id>")
def get_todos_from_list(list_id):
    activeList = TodosList.query.get(list_id)
    activeListTodos = Todo.query.filter_by(list_id=list_id).order_by(
        Todo.id
    ).all()
    listsData = []
    lists = TodosList.query.order_by(TodosList.id).all()
    for list in lists:
        todos = list.todos
        listCompleted = len(todos) > 0
        for todo in todos:
            if not todo.completed:
                listCompleted = False
                break
        listsData.append({
            "data": list,
            "completed": listCompleted
        })
    return render_template(
        "index.html",
        activeList=activeList,
        activeListId=list_id,
        lists=listsData
    )


# JSON
@app.route("/lists/<list_id>/todos")
def get_todos_from_list_json(list_id):
    activeListTodos = Todo.query.filter_by(list_id=list_id).order_by(
        Todo.id
    ).all()
    responseBody = {}
    responseBody["msg"] = "fetched all todos for list " + list_id
    responseBody["data"] = []
    for todo in activeListTodos:
        responseBody["data"].append({
            "id": todo.id,
            "completed": todo
        })
    return jsonify(responseBody)


# JSON
@app.route("/todos", methods=["POST"])
def create_todo():
    responseBody = {}
    error = False
    try:
        description = request.get_json()["description"]
        list_id = request.get_json()["list_id"]
        todo = Todo(description=description)
        list = TodosList.query.get(list_id)
        todo.list = list
        responseBody["msg"] = "todo has been created"
        db.session.add(todo)
        db.session.commit()
        responseBody["id"] = todo.id
        responseBody['description'] = todo.description
    except Exception as e:
        error = True
        db.session.rollback()
        print(sys.exc_info())
    finally:
        db.session.close()
        if error:
            abort(400)
        else:
            return jsonify(responseBody)


# JSON
@app.route("/lists/<int:id>", methods=["DELETE"])
def delete_list(id):
    responseBody = []
    error = False
    try:
        Todo.query.filter_by(list_id=id).delete()
        TodosList.query.filter_by(id=id).delete()
        db.session.commit()
        responseBody['msg'] = "todos list has been deleted !"
    except Exception as e:
        error = True
        db.session.rollback()
        print(sys.exc_info())
    finally:
        db.session.close()
        if error:
            abort(400)
        else:
            return jsonify(responseBody)


# JSON
@app.route("/todos/<int:id>", methods=["DELETE"])
def delete_todo(id):
    responseBody = {}
    error = False
    try:
        Todo.query.filter_by(id=id).delete()
        db.session.commit()
        responseBody['msg'] = "todo has been deleted !"
    except Exception as e:
        error = True
        db.session.rollback()
        print(sys.exc_info())
    finally:
        db.session.close()
        if error:
            abort(400)
        else:
            return jsonify(responseBody)


# JSON
@app.route('/lists/<int:list_id/complete', methods=['PUT'])
def update_list(list_id):
    responseBody = {}
    error = False
    try:
        completed = request.get_json()['completed']
        todos = Todo.query.filter_by(list_id=list_id).order_by(Todo.id).all()
        for todo in todos:
            todo.completed = completed
        db.session.commit()
        responseBody['msg'] = "list " + str(list_id) + " completed updated"
    except Exception as e:
        error = True
        db.session.rollback()
        print(sys.exc_info())
    finally:
        db.session.close()
        if error:
            abort(400)
        else:
            return jsonify(responseBody)


# JSON
@app.route('/todos/<int:id>', methods=['PUT'])
def update_todo(id):
    responseBody = {}
    error = False
    try:
        completed = request.get_json()['completed']
        todo = Todo.query.get(id)
        todo.completed = completed
        db.session.commit()
        responseBody['msg'] = "todo " + str(todo.id) + " completed updated"
    except Exception as e:
        error = True
        db.session.rollback()
        print(sys.exc_info())
    finally:
        db.session.close()
        if error:
            abort(400)
        else:
            return jsonify(responseBody)


# if running this module as a standalone program
# (cf. command in the Python Dockerfile)
if __name__ == "__main__":
    app.run(host="0.0.0.0")
