# Step to run ```app.js```

## Step 1: Clone Codebase
```git clone https://github.com/priyankatiwari24/Assignment_Sunday_mobility.git```  
```cd Assignment_Sunday_mobility/```

## Step 2: Create Database
```create database employee;```

## Step 3: MySQL DB Import
```sudo mysql -h localhost -u root -p employee < employee.sql```

## Step 4: Change DB configs
Go to the app.js file check the mysql connection code and check the user,password and database according to your Mysql username and password.

## Step 5: Install Dependency
```npm i```

## Step 6: Run app.js
```node app.js```

### output
`Express server is runnig at port no : 3000`   
`DB connection succeded.`  



> **NOTE**:
> You can use nodemon also. It automatically restarting the node application when file changes in the directory are detected:
```npm install -g nodemon```

## Step 7: Visit to browser
Navigate ```http://localhost:3000/```
