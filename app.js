const express = require("express");
const fs = require("fs");
const app = express();
const http = require("http");
var mysql = require('mysql2'); 
var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "employee"
  });
  
  connection.connect( (err) => {
    if (err) throw err;
  })
app.use(express.json());

class EmployeeJSONRepository {
    store(data) {
        data.id = Math.random();
        let employees = fs.readFileSync("employees", {encoding: "utf8"});
        employees = JSON.parse(employees);
        employees.push(data);
        employees = JSON.stringify(employees);
        fs.writeFileSync("employees", employees);
    }
    update(data, _id) {
        let employees = fs.readFileSync("employees")
        employees = JSON.parse(employees)
        let employee = employees.find(each => each.id == _id);
        let {id} = employees[employees.indexOf(employee)]
        data.id = id
        employees[employees.indexOf(employee)] = data
        employees = JSON.stringify(employees);
        fs.writeFileSync("employees", employees);
    }
    remove(id) {
        let employees = fs.readFileSync("employees")
        employees = JSON.parse(employees)
        let storg = employees.filter(employee => employee.id != id)
        employees = []
        employees = JSON.stringify(storg)
        fs.writeFileSync("employees", employees)
    }
    find(id) {
        let employees = fs.readFileSync("employees")
        employees = JSON.parse(employees)
        let employee = employees.find(each => each.id == id);
        return employee
    }
    index() {
        return new Promise((resolve, reject) => {
            fs.readFile("employees", {encoding: "utf8"}, (err, employees) => {
                if(err) reject(err)
                employees = JSON.parse(employees);
                resolve(employees);
            });
        })
    }
}
class EmployeeMysqlRepository {
    store(data) {
        return new Promise((resolve, reject) => {
            connection.connect((err) => {
                if(err) reject(err);
                let sql = `INSERT INTO individual (name) VALUES ('${data.name}')`;
                connection.query(sql, (err, result) => {
                    if (err) reject(err);
                    resolve({ insertId: result.insertId })
                });
            });
            connection.end()
        })
    }
    index() {
        return new Promise((resolve, reject) => {
            connection.connect((err) => {
                if(err) reject(err);
                let sql =`SELECT id, name FROM individual`;
                connection.query(sql, (err, result) => {
                    if(err) reject(err);
                    resolve(result)
                })
            })
        })
    }
}

class EmployeeController {
    
    constructor(repository) {
        this.repo = repository;
    }

    index() {
        return async(req, res) => {
            let employees = await this.repo.index()
            res.json(employees);
        }
    }

    find() {
        return (req, res) => {
            let id = req.params.id;
    
            let employee = this.repo.find(id);
            if(!employee) {
                res.json({
                    message: "Employee Not Exists"
                })
            }
        
            res.json(employee);
        }
    }

    store() {
        return async (req, res) => {
            let data = req.body;
            let result = await this.repo.store(data);
        
            res.json({message: "success", record: result })
        }
    }

    update() {
        return (req, res) => {
            let id = req.params.id;
            let data = req.body  
        
            this.repo.update(data, id);
            res.json({message: "success"});
        }
    }

    remove() {
        return (req, res) => {
            let id = req.params.id
            this.repo.remove(id);
            res.json({ message: "Employee Deleted Success"})
        }
    }
}

var empController = new EmployeeController(new EmployeeMysqlRepository());

app.get("/employees", empController.index());
app.post("/employees", empController.store());
app.get("/employees/:id", empController.find());
app.put("/employees/:id", empController.update());
app.delete("/employees/:id", empController.remove());

const server = http.createServer(app);

// process.on("exit", () => {
//     server.close();
// })

// process.on("uncaughtException", () => {
//     server.close();
// })

// process.on("SIGTERM", () => {
//     server.close();
// })

server.listen(9091, () => console.log("running"))