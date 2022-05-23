const express = require("express");
const fs = require("fs");
const app = express();

app.use(express.json());

app.get("/employees", (req, res) => {
    let employees = fs.readFileSync("employees", {encoding: "utf8"});
    employees = JSON.parse(employees);
    res.json(employees);
});

app.post("/employees", (req, res) => {
    let data = req.body;
    data.id = Math.random();

    let employees = fs.readFileSync("employees", {encoding: "utf8"});
    employees = JSON.parse(employees);
    employees.push(data);
    
    employees = JSON.stringify(employees);
    fs.writeFileSync("employees", employees);
    
    res.json({message: "success"})
});

app.get("/employees/:id", (req, res) => {
    let id = req.params.id;
    let employees = fs.readFileSync("employees")
    employees = JSON.parse(employees)
    let employee = employees.find(each => each.id == id);
    res.json(employee);
});

app.put("/employees/:id", (req, res) => {
    let _id = req.params.id;
    let data = req.body  
    let employees = fs.readFileSync("employees")
    employees = JSON.parse(employees)
    let employee = employees.find(each => each.id == _id);
    let {id} = employees[employees.indexOf(employee)]
    data.id = id
    employees[employees.indexOf(employee)] = data
    employees = JSON.stringify(employees);
    fs.writeFileSync("employees", employees);
    res.json({message: "success"});

});
app.delete("/employees/:id", (req, res) => {
    let _id = req.params.id
    console.log(_id)
    let employees = fs.readFileSync("employees")
    employees = JSON.parse(employees)
    let storg = employees.filter(employee => employee.id != _id)
    console.log(storg)
    employees = []
    employees = JSON.stringify(storg)
    fs.writeFileSync("employees", employees)
    res.json({ message: "Employee Deleted Success"})
})
app.listen(3000, () => console.log("running"))