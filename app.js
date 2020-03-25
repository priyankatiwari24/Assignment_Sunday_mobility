const mysql = require('mysql');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cookieParser());
app.use(session({ secret: "priyanka" ,cookie: { maxAge: 5000 }}));

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

//signup api

app.get('/signup', (req, res) => {
    res.render('signup');
})

app.post('/signup', (req, res) => {
    let uname = req.body.uname,
        email = req.body.email,
        password = req.body.password,
        query = "INSERT INTO users (uname,email,password) VALUES ('" + uname + "', '" + email + "','" + password + "')";
    mysqlConnection.query(query, (err, rows) => {
        if (!err) {
            res.redirect('/login');
        } else {
            console.log(err);
        }
    })
})

//login api
app.get('/login', (req, res) => {
    res.render('login');
})

app.post('/login', (req, res) => {
    console.log(req.body);
    let email = req.body.uname,
        password = req.body.email,
        query = 'SELECT count(*) as count FROM users WHERE uname = ? AND email = ?';
    mysqlConnection.query(query, [email, password], (err, rows) => {
        if (!err) {
            console.log(rows)
            if (rows[0].count >= 1) {          //prevent authentication
                req.session.login = true;   //set sesssion after login
                res.redirect('/search')
            } else {
                res.redirect('/login');
            }
        } else {
            console.log(err);
        }
    })
})

//Add employee record using form subbmission

app.get('/', (req, res) => {
    if (!req.session.login) {
        res.redirect('/login');
    } else {
        res.render('home');
    }
})

app.post('/submit', (req, res) => {
    let name = req.body.name,
        email = req.body.email,
        salary = req.body.salary,
        sql = "INSERT INTO user (name, email, salary) VALUES ('" + name + "', '" + email + "','" + salary + "')";
    mysqlConnection.query(sql, (err, rows) => {
        if (!err) {
            res.redirect('/search');
        } else {
            console.log(err);
        }
    })
});

//filter page and get all the records basis on that

app.get('/search', (req, res) => {
    if (!req.session.login) {
        res.redirect('/login')
    } else {

        if (!req.query.salary && req.query.filter) {
            if (req.query.filter != 'all') {
                res.render("search", { data: "", error: "Please Enter Salary!" });
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
    }
})

//Edit Employee Profile

app.get('/edit/:id', (req, res) => {
    if (!req.session.login) {
        res.redirect('/login')
    } else {

        let id = req.params.id;
        let q = "SELECT * FROM `user` WHERE id = '" + id + "' ";
        mysqlConnection.query(q, (err, rows, fields) => {
            if (!err) {
                res.render('edit', { data: rows[0], error: '' });
            }
            else
                console.log(err);
        })
    }
})
app.post('/edit/:id', (req, res) => {
    let id = req.params.id,
        name = req.body.name,
        email = req.body.email,
        salary = req.body.salary,
        q = 'UPDATE user SET name=?,salary=?,email=? where id=?';
    mysqlConnection.query(q, [name, salary, email, id], (err, rows, fields) => {
        if (!err) {
            res.redirect('/search');
        } else {
            console.log(err);
        }
    })
})

//Delete the each employee record

app.get('/delete/:id', (req, res) => {
    if (!req.session.login) {
        res.redirect('/login')
    } else {
        let id = req.params.id;
        let q = "DELETE FROM `user` WHERE id = '" + id + "' ";
        mysqlConnection.query(q, (err, rows) => {
            if (!err) {
                res.redirect('/search');
            } else {
                console.log(err);
            }
        })
    }
})
app.get('/logout', (req, res) => {
    console.log('Destroying session');
    req.session.destroy();          //Destroying session
    res.redirect('/login');
   });
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
``