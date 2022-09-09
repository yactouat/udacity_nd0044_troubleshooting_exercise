const extractIdFromInput = (inputId) => {
    return inputId.split('_')[0];
}

/**
 * @description checks if all todos of current active list are completed
 *              if so, completes the list from a display perspective
 */
 const markListAsCompletedIfIs = async (listId, parentListCheckbox) => {
    let todos;
    let allCompleted = true;
    try {
        const APICallRes = await fetch("/lists/" + extractIdFromInput(listId) + "/todos");
        todos = await APICallRes.json();
    } catch (error) {
        console.error(error);
    }
    if (todos) {
        todos.data.forEach(todo => {
            if (!todo.completed) {
                allCompleted = false;
            }
        });
    }
    if (allCompleted) {
        parentListCheckbox.checked = true;
    }
}

const showError = (show = true) => {
    if (show) {
      document.getElementById("error").className='';
    } else {
      document.getElementById("error").classname="hidden";
    }
};

const showNoActiveListSelectedMsg = () => {
    const activeListNameH3 = document.getElementById("activeListNameH3");
    if (activeListNameH3) {
        activeListNameH3.innerText = "no active list selected";
    }
}

/**
 * 
 * @param {number} listId 
 * @param {string} todoDescription 
 * @returns {Object} - an object containing a representation of the todo after it has been created on the backend
 */
const createTodo = async (listId, todoDescription) => {
    // we create an empty var that MAY be filled with the backend response
    let postJsonResponse;
    try {
        // this is the call to our backend
        const APICallRes = await fetch("/todos", {
            method: "POST",
            // we format the list id and the todo description into a JSON string to be ingested by the backend
            body: JSON.stringify({
              "description": todoDescription, 
              "list_id": listId
            }),
            // we specify to the backend that we're sending JSON
            headers: {
                "Content-Type": "application/json",
            }
        });
        // after we have received the response from the backend API, we turn it into a usable JSON
        postJsonResponse = await APICallRes.json();
    } catch (error) {
        console.error(error);
    }
    return postJsonResponse;
}

const createTodoList = async (listName) => {
    let postJsonResponse;
    try {
        const APICallRes = await fetch("/lists", {
            method: "POST",
            body: JSON.stringify({
              "name": listName
            }),
            headers: {
                "Content-Type": "application/json",
            }
        });
        postJsonResponse = await APICallRes.json();
    } catch (error) {
        console.error(error);
    }
    return postJsonResponse;
}

const handleListCheckboxChange = async e => {
    const completedState = e.target.checked;
    const id = extractIdFromInput(e.target.id);
    try {
      const APICall = await fetch(`/lists/${id}/complete`, {
        method: 'PUT',
        body: JSON.stringify({'completed': completedState}),
        headers: {
            'Content-Type': 'application/json',
        }
      })  
      if (APICall.status != 200) {
        throw "unable to update list's completed state";
      }    
      document.querySelectorAll(`ul[data-id="ul_${id}"] .todoDescription`).forEach(span => {
        if (completedState) {
          span.classList.add("strikedThrough");
        } else {
          span.classList.remove("strikedThrough");
        }
      });
      document.querySelectorAll(`ul[data-id="ul_${id}"] .todoCheckbox`).forEach(checkbx => {
        checkbx.checked = completedState;
      });
    } catch (error) {
      console.error(error);
      showError();
      document.getElementById(`${id}_listCheckbox`).checked = !completedState;
    }
};

const handleListDelBtnClick = async e => {
    const id = extractIdFromInput(e.target.id);
    activeTodosListId = extractIdFromInput(document.querySelector(".todos").id);
    try {
      const APICall = await fetch(`/lists${id}`, {
        method: 'DELETE'
      })  
      if (APICall.status != 200) {
        throw "unable to delete the list";
      }     
      document.getElementById(`${id}_list_li`).remove();
      if (activeTodosListId == id) {
        document.querySelectorAll(".todos li").forEach(li => {
          li.remove();
        });
        showNoActiveListSelectedMsg();
      }
    } catch (error) {
      console.error(error);
      showError();
    }
};

const handleTodoCheckboxChange = async e => {
    const completedState = e.target.checked;
    const id = extractIdFromInput(e.target.id);
    try {
      const APICall = await fetch(`/todos/${id}`, {
        method: 'PUT',
        body: JSON.stringify({'completed': completedState}),
        headers: {
            'Content-Type': 'application/json',
        }
      })  
      if (APICall.status != 200) {
        throw "unable to update todo's completed state";
      }
      const todoDescription = document.querySelector(`span[data-id="span_${id}"]`);
      const listId = todoDescription.parentElement.parentElement.id;
      const parentListCheckbox = document.querySelector(`input[data-id="listCheckbox_${extractIdFromInput(listId)}"]`);
      if (completedState) {
        try {
            await markListAsCompletedIfIs(listId, parentListCheckbox);
            todoDescription.classList.add("strikedThrough");
        } catch (error) {
            throw "unable to get todos associated to list";
        }
      } else {
        todoDescription.classList.remove("strikedThrough");  
        parentListCheckbox.checked = false;
      }
    } catch (error) {
      console.error(error);
      showError();
      document.getElementById(`${id}_todocheckbox`).checked = !completedState;
    }
};

const handleTodoDelBtnClick = async e => {
    const id = extractIdFromInput(e.target.id);
    try {
      const APICall = await fetch(`/todos/${id}`, {
        method: 'DELETE'
      })  
      if (APICall.status != 200) {
        throw "unable to delete the todo";
      }     
      document.getElementById(`${id}_li`).remove();
    } catch (error) {
      console.log(error);
      showError();
    }
};

const updateDisplayWithNewTodo = (newTodoJson) => {
    const liItem= document.createElement("li");
    liItem.classList.add("todoItem");
    liItem.id = `${newTodoJson["id"]}_li`;
    liItem.innerHTML = `<input 
        class="todoCheckbox" 
        type="checkbox" 
        name="completedInput"
        id="${newTodoJson["id"]}_todocheckbox"
      />
      <span class="todoDescription" data-id="span_${newTodoJson["id"]}">${newTodoJson["description"]}</span>
      <button id="${newTodoJson["id"]}_button" class="todoButton">&cross;</button>`;
    document.querySelector(".todos").appendChild(liItem);
    document.getElementById(`${newTodoJson["id"]}_todocheckbox`)
      .addEventListener("change", handleTodoCheckboxChange);
    document.getElementById(`${newTodoJson["id"]}_button`)
      .addEventListener("click", handleTodoDelBtnClick);
    showError(false);
}

const updateDisplayWithNewTodoList = (newListJson) => {
    const liItem= document.createElement("li");
    liItem.classList.add("listItem");
    liItem.id = `${newListJson["id"]}_list_li`;
    liItem.innerHTML = `<input 
        class="listCheckbox" 
        type="checkbox" 
        name="completedInput"
        id="${newListJson["id"]}_listCheckbox"
      /><a href="/lists/${newListJson["id"]}">${newListJson["name"]}</a>
      <button id="${newListJson["id"]}_list_button" class="listButton">&cross;</button>`;
    document.querySelector('.lists').appendChild(liItem);
    document.getElementById(`${newListJson["id"]}_listCheckbox`)
        .addEventListener("change", handleListCheckboxChange);
    document.getElementById(`${newListJson["id"]}_list_button`)
      .addEventListener("click", handleListDelBtnClick);
    showError(false);
}

window.addEventListener("DOMContentLoaded", () => {

    if (document.getElementById("activeListNameH3").innerText == '') {
        showNoActiveListSelectedMsg();
        document.getElementById("create_todo_btn").disabled = true;
    }

    const todoDescriptionInput = document.getElementById('descriptionInput');
    const todoCheckboxes = document.querySelectorAll(".todoCheckbox");
    const todoDelBtns = document.querySelectorAll(".todoButton");
    const listCheckboxes = document.querySelectorAll(".listCheckbox");
    const listDelBtns = document.querySelectorAll(".listButton");

    const inputs = [
      {inputs: todoCheckboxes, handler: handleTodoCheckboxChange, event: "onchange"},
      {inputs: todoDelBtns, handler: handleTodoDelBtnClick, event: "onclick"},
      {inputs: listCheckboxes, handler: handleListCheckboxChange, event: "onchange"},
      {inputs: listDelBtns, handler: handleListDelBtnClick, event: "onclick"},
    ];

    // listening to create todo form submit event
    document.getElementById("todo_form").onsubmit = async function (e) {
        // we tell the page not to reload on submit
        e.preventDefault();
        // we get the todo description value from an input field we saved in a JS var when the page was loaded
        const description = todoDescriptionInput.value;
        // we call our createTodo method, which is async and should return our formatted todo from the backend
        let postJsonResponse = await createTodo(
            // we extract the list id to associate it to a todo
            extractIdFromInput(document.querySelector(".todos").id),
            description
        );
        // if we do get a response from the backend we update the display by inserting the new todo in the DOM
        if (postJsonResponse) {
            updateDisplayWithNewTodo(postJsonResponse);
        } else { // if not we show an error
            showError();
        }
    } 

    // listening to create list form submit event
    document.getElementById("list_form").onsubmit = async function (e) {
      e.preventDefault();
      const listName = nameInput.value;
      let postJsonResponse = await createTodoList(listName);
      if (postJsonResponse) {
        updateDisplayWithNewTodoList(postJsonResponse);
      } else {
        showError();
      }
    } 

    // listening to todo completed updates
    // listening to todos deletion input
    inputs.forEach(inputObj => {
      for (let i = 0; i < inputObj.inputs.length; i++) {
        const inputItem = inputObj.inputs[i];
        inputItem[inputObj.event] = inputObj.handler
      }
    });

});