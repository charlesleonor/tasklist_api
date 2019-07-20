const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const knex = require('knex');

const db = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'charlesleonor',
    password : '',
    database : 'db_tasks'
  }
});

/*
db_tasks - TASK LIST PROJECT
db_checklist - HOUSE CHORES
db_work - WORK
*/

const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());

//HOME PAGE
app.get('/', (req, res) => {
  db.select("*").from('task')
    .orderBy('id')
    //.orderByRaw('CASE WHEN priority = \'high\' THEN 1 WHEN priority = \'moderate\' THEN 2 WHEN priority = \'low\' THEN 3 END')
    .then(tasks => {
      res.json(tasks)
    })
    .catch(err => res.status(400).json('Unable to fetch task list.'))
});

app.get('/department', (req, res) => {
  db.select("*").from('department')
    .then(tasks => {
      res.json(tasks)
    })
    .catch(err => res.status(400).json('Unable to fetch department list.'))
});

app.get('/date', (req, res) => {
  console.log("HERE")
  db.select("*").from('task')
    .orderBy('created_on', 'asc')
    .then(tasks => {
      res.json(tasks)
    })
    .catch(err => res.status(400).json('Unable to fetch task list.'))
});

//ADD TASK
app.post('/add', (req, res) => {
  const {name, remarks} = req.body;
  db.insert({
    name: name,
    remarks: remarks
  })
    .into('task')
    .returning("*")
    .then(data => {
      res.json(data[0])
    })
    .catch(err => {
      res.status(400).json('Unable to add task.');
    })
});

//UPDATE TASK
app.post('/update', (req, res) => {
  const {id, remarks, status, priority, dept_id} = req.body;
  db.update({
    remarks: remarks,
    status: status,
    priority: priority,
    dept_id: dept_id,
    updated_on: db.fn.now()
  })
  .from('task')
  .where('id', id)
  .returning('*')
  .then(data => {
    res.json(data[0])
  })
  .catch(err => res.status(400).json('Unable to update task.'))


});

//CLEAR TASK
app.delete('/clear', (req, res) => {
  db('task')
    .where("status", "done")
    .del()
    .returning('*')
    .then(data => {
      if(data.length) {
        res.json(data[0])
      }
    })
    .catch(err => res.status(400).json(err))
    
});

//DELETE TASK
app.delete('/delete', (req, res) => {
  const {id} = req.body;
  db('task')
    .where("id", id)
    .del()
    .returning('*')
    .then(data => {
      if(data.length) {
        res.json(data[0])
      }
    })
    .catch(err => res.status(400).json(err))
})

//ADD SUBTASK
app.post('/addSubtask', (req, res) => {
  const {name, parent_id} = req.body;
  db.insert({
    name: name,
    parent_id: parent_id
  })
    .into('subtask')
    .returning("*")
    .then(data => {
      res.json(data[0])
    })
    .catch(err => {
      res.status(400).json('Unable to add subtask.');
    })
});

//DELETE SUBTASK
app.delete('/deleteSubtask', (req, res) => {
  const {id} = req.body;
  db('subtask')
    .where("id", id)
    .del()
    .returning('*')
    .then(data => {
      if(data.length) {
        res.json(data[0])
      }
    })
    .catch(err => res.status(400).json(err))
})

//GET SUBTASK
app.get('/getSubtask:id', (req, res) => {
  const {id} = req.params;

  db.select("*").from('subtask')
    .where("parent_id", "=", id)
    .then(subtasks => {
      res.json(subtasks)
    })
    .catch(err => res.status(400).json('Unable to get subtasks.'))
})

//ADD DEPARTMENT
app.post('/addDepartment', (req, res) => {
  const {name} = req.body;
  db.insert({
    name: name
  })
    .into('department')
    .returning("*")
    .then(data => {
      res.json(data[0])
    })
    .catch(err => {
      res.status(400).json('Unable to add department.');
    })
});

//DELETE DEPARTMENT
app.delete('/deleteDepartment', (req, res) => {
  const {id} = req.body;
  db('department')
    .where("id", id)
    .del()
    .returning('*')
    .then(data => {
      if(data.length) {
        res.json(data[0])
      }
    })
    .catch(err => res.status(400).json(err))
})

app.listen(3000, () => {
  console.log('App is running on PORT 3000')
});

/*
/             --> POST = task list
/add          --> POST = task
/update/:task --> POST = task
/clear       --> POST = success/fail
*/