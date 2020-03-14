const mysql = require('mysql');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs')

var mysqlConnection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'employee',
    multipleStatements: true
});

mysqlConnection.connect((err) => {
    if (!err)
        console.log('DB connection succeded.');
    else
        console.log('DB connection failed \n Error : ' + JSON.stringify(err, undefined, 2));
});


app.listen(3000, () => console.log('Express server is runnig at port no : 3000'));

app.get('/', (req, res) => {
    res.render('home');
})

app.post('/submit', (req, res) => {
    console.log(req.body);

    let name = req.body.name,
        email = req.body.email,
        salary = req.body.salary,
        sql = "INSERT INTO user (name, email,salary) VALUES ('" + name + "', '" + email + "','" + salary + "')";
        mysqlConnection.query(sql, (err, rows) => {
        if (err) console.log("Oops... Something went wrong");
        res.redirect('/search');
    })
});

app.get('/search', (req, res) => {

    if (!req.query.salary && req.query.filter) {
        if (req.query.filter != 'all') {
            res.render("search", { data: "", error: "Please defined Salary!" });
        }
    }
    q = 'SELECT * FROM user order by id desc';

    if (req.query.filter == 'less_than') {
        q = 'SELECT * FROM user where salary < ' + req.query.salary + ' order by id desc';
    }

    if (req.query.filter == 'greater_than') {
        q = 'select * from user where salary > ' + req.query.salary + ' order by id desc';
    }

    mysqlConnection.query(q, (err, rows, fields) => {
        if (!err) {
            res.render('search', { data: rows, error: '' });
        }
        else
            console.log(err);
    })
})

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Node CRUD Operation @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@//

//Get all employees
app.get('/employees', (req, res) => {
    mysqlConnection.query('SELECT * FROM user', (err, rows, fields) => {
        if (!err) {
            res.send(rows);
        }
        else
            console.log(err);
    })
});

//Get an employees
app.get('/employees/:id', (req, res) => {
    mysqlConnection.query('SELECT * FROM user WHERE id = ?', [req.params.id], (err, rows, fields) => {
        if (!err)
            res.send(rows);
        else
            console.log(err);
    })
});

//Delete an employees
app.delete('/employees/:id', (req, res) => {
    mysqlConnection.query('DELETE FROM user WHERE id = ?', [req.params.id], (err, rows, fields) => {
        if (!err)
            res.send('Deleted successfully.');
        else
            console.log(err);
    })
});


//Insert an employees
app.post('/employees', (req, res) => {
    let name = req.body.name,
        email = req.body.email,
        salary = req.body.salary,
        sql = "INSERT INTO user SET ?";
    mysqlConnection.query(sql, [{ name, email, salary }], (err, rows, fields) => {
        if (err) console.log("Oops... Something went wrong");
        let result = JSON.stringify(rows.affectedRows);
        res.end(`Inserted employee successfully !!! Total affected rows :- ${result}`);
    })
});

// //Update an employees
app.put('/employees', function (req, res) {
    mysqlConnection.query('UPDATE `user` SET `name`=?,`salary`=?,`email`=? where `id`=?', [req.body.name, req.body.salary, req.body.email, req.body.id], function (err, rows, fields) {
        if (err) console.log("Oops... Something went wrong");
        let result = JSON.stringify(rows.affectedRows);
        res.end(`Total affected rows :- ${result}`);
    });
});