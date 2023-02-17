const inquirer = require('inquirer');
const mysql = require('mysql2/promise');

// Connect to database
async function main() {
    console.log(
        `
        ,________________________________________________________________.
        |                                                                 |
        |  ______                      __                                 |
        |  | ____| __ ___ __   _ ___  |  | _____  __   __
        |  | __|  |  '_ ''__ \| '__ \ |  |/ ___ \ | | | |
        |  | |___ |  | |  | | |  |_) ||  | (___) || |_| |
        |  |_____||__| |__| |_|  .__/ |__|\_____/ \____,|  
        |                     |__|                 |____/                 |
        |  +---+  +---        X      +----+  +   /   +---+   +---         |
        |    |    |   |      / x     |       |  /    |       |   |        |
        |    |    +---      /   x    |       |X      +-+     +---         |
        |    |    |  x     +-----+   |       |  x    |       |  x         |
        |    +    +   x   /       x  +----+  +   x   +---+   +   x        |
        |                                                                 |
        '________________________________________________________________'

        `
    );

    const db = await mysql.createConnection(
        {
            host: 'localhost',
            // MySQL username,
            user: 'root',
            // MySQL password
            password: 'password',
            database: 'employees_db',
        },
        console.log(`Connected to the employees_db database.`),
    );
    init(db);

}

// Function to check if val is only num(digits)
// Referenced from: https://stackoverflow.com/questions/1779013/check-if-string-contains-only-digits
isNum = function (val) {
    let isnum = /^\d+$/.test(val);
    return isnum;
}

//Initiate manageEmployee
async function init(db) {
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'choice',
                message: 'What would you like to do?',
                choices: ['View All Employees', 'Add Employee', 'Update Employee Role', 'View All Roles',
                    'Add Role', 'View All Departments', 'Add Departments', 'Quit'],
            },
        ])
        .then((data) => {
            if (data.choice === 'View All Employees') {
                viewAllEmp(db);
            }
            else if (data.choice === 'Add Employee') {
                addEmployee(db);
            }
            else if (data.choice === 'Update Employee Role') {
                updateEmployeeRole(db);
            }
            else if (data.choice === 'View All Roles') {
                viewAllRole(db);
            }
            else if (data.choice === 'Add Role') {
                addRole(db);
            }
            else if (data.choice === 'View All Departments') {
                viewAllDep(db);
            }
            else if (data.choice === 'Add Departments') {
                addDepartment(db);
            }
            else if (data.choice === 'Quit') {
                quit(db);
            }
        });
}

//View All Employees
async function viewAllEmp(db) {
    db.end();

    const conn = await mysql.createConnection(
        {
            host: 'localhost',
            // MySQL username,
            user: 'root',
            // MySQL password
            password: 'password',
            database: 'employees_db',
        },
    );

    const query = `
        SELECT employee.id, employee.first_name, employee.last_name, role.title, department.department_name AS department, role.salary, employee.manager_id
        FROM employee
        JOIN role ON employee.role_id = role.id
        JOIN department ON role.department_id = department.id
        ORDER BY employee.id;
        `;

    conn.query(query)
        .then(([rows, fields]) => {
            //console.log(rows);
            console.table(rows);
        })
        .catch(console.log)
        .then(() => init(conn));
}

//Inquirer for adding employee to db
async function addEmployee(db) {
    //Roles
    let roles = [];
    let roles_id = [];
    await db.query(`SELECT * FROM role`)
        .then(([rows, fields]) => {
            ;
            //console.table(rows);
            for (let i = 0; i < rows.length; i++) {
                roles.push(rows[i].title);
                roles_id.push(rows[i].id);
            }
        })
        .catch(console.log)
    //Managers
    let managers = [];
    let managers_id = [];
    await db.query(`SELECT * FROM employee`)
        .then(([rows, fields]) => {
            ;
            //console.table(rows);
            for (let i = 0; i < rows.length; i++) {
                managers.push(rows[i].first_name + " " + rows[i].last_name);
                managers_id.push(rows[i].id);
            }
            managers.push("None");
            managers_id.push(0);
        })
        .catch(console.log)


    inquirer
        .prompt([
            {
                type: "input",
                name: "first_name",
                message: "What is the employee's first name?",
                validate: function (input) {
                    if (input.length < 1) {
                        console.log("Please input fist name: ");
                        return false;
                    }
                    return true;
                }
            },
            {
                type: "input",
                name: "last_name",
                message: "What is the employee's last name?",
                validate: function (input) {
                    if (input.length < 1) {
                        console.log("Please input last name: ");
                        return false;
                    }
                    return true;
                }
            },
            {
                type: 'list',
                name: 'role',
                message: 'What is employee role?',
                choices: roles,
            },
            {
                type: 'list',
                name: 'manager',
                message: 'Who is the employeess manager?',
                choices: managers,
            },
        ])
        .then(data => {
            //db INSERT INTO
            let query = ``;

            let manager_id = managers_id[managers.indexOf(data.manager)];

            if (manager_id == 0) {
                query = `
                INSERT INTO employee(first_name, last_name, role_id, manager_id)
                VALUES ("${data.first_name}", "${data.last_name}", ${roles_id[roles.indexOf(data.role)]}, NULL)
                `;
            } else {
                query = `
                INSERT INTO employee(first_name, last_name, role_id, manager_id)
                VALUES ("${data.first_name}", "${data.last_name}", ${roles_id[roles.indexOf(data.role)]}, ${manager_id})
                `;
            }

            db.query(query)
                .then(() => {
                    console.log(`Employee ${data.first_name} ${data.last_name} has been added!`)
                })
                .catch(console.log)
                .then(() => init(db));
        });
}

// Update Employee Role
async function updateEmployeeRole(db) {
    //employees
    let employees = [];
    let employees_id = [];
    await db.query(`SELECT id, first_name, last_name FROM employee`)
        .then(([rows, fields]) => {
            for (let i = 0; i < rows.length; i++) {
                employees.push(rows[i].first_name + " " + rows[i].last_name);
                employees_id.push(rows[i].id);
            }
        })
        .catch(console.log)

    //Roles
    let roles = [];
    let roles_id = [];
    await db.query(`SELECT id, title FROM role`)
        .then(([rows, fields]) => {
            for (let i = 0; i < rows.length; i++) {
                roles.push(rows[i].title);
                roles_id.push(rows[i].id);
            }
        })
        .catch(console.log)

    inquirer
        .prompt([
            {
                type: 'list',
                name: 'employee',
                message: 'Which Employee role do you want to update?',
                choices: employees,
            },
            {
                type: 'list',
                name: 'role',
                message: 'Which role do you want to assign the selected employee?',
                choices: roles,
            },
        ])
        .then(data => {
            let employee_id = employees_id[employees.indexOf(data.employee)];
            let role_id = roles_id[roles.indexOf(data.role)];

            const query = `UPDATE employee SET role_id = ${role_id} WHERE id = ${employee_id}`;

            db.query(query)
                .then(() => {
                    console.log(`${data.employee}'s role has been upated as ${data.role}!`)
                })
                .catch(console.log)
                .then(() => init(db));
        });
}

//View All Roles
async function viewAllRole(db) {
    db.end();

    const conn = await mysql.createConnection(
        {
            host: 'localhost',
            // MySQL username,
            user: 'root',
            // MySQL password
            password: 'password',
            database: 'employees_db',
        },
    );

    const query = `
        SELECT role.id, role.title, department.department_name AS department, role.salary
        FROM role
        JOIN department ON role.department_id = department.id;
        `;

    conn.query(query)
        .then(([rows, fields]) => {
            console.table(rows);
        })
        .catch(console.log)
        .then(() => init(conn));
}

//Add Role
async function addRole(db) {
    //Roles
    let departments = [];
    let departments_id = [];
    await db.query(`SELECT * FROM department`)
        .then(([rows, fields]) => {
            ;
            for (let i = 0; i < rows.length; i++) {
                departments.push(rows[i].department_name);
                departments_id.push(rows[i].id);
            }
        })

    inquirer
        .prompt([
            {
                type: "input",
                name: "role",
                message: "What is the name of the role?",
                validate: function (input) {
                    if (input.length < 1) {
                        console.log("Please input the name of the role! ");
                        return false;
                    }
                    return true;
                }
            },
            {
                type: "input",
                name: "salary",
                message: "What is the salary of the role?",
                validate: function (input) {
                    if (!isNum(input)) {
                        console.log("Please input correct amount");
                        return false;
                    }
                    return true;
                }
            },
            {
                type: 'list',
                name: 'department',
                message: 'Which Department does the role belongs to??',
                choices: departments,
            },
        ])
        .then(data => {
            //db INSERT INTO
            let department_id = departments_id[departments.indexOf(data.department)];

            let query = `
            INSERT INTO role (title, salary, department_id)
            VALUES ("${data.role}", ${data.salary}, ${department_id})
            `;

            db.query(query)
                .then(() => {
                    console.log(`Employee ${data.role} has been added!`)
                })
                .catch(console.log)
                .then(() => init(db));
        });
}

//View All Departments
async function viewAllDep(db) {
    db.end();

    const conn = await mysql.createConnection(
        {
            host: 'localhost',
            // MySQL username,
            user: 'root',
            // MySQL password
            password: 'password',
            database: 'employees_db',
        },
    );

    const query = `SELECT id, department_name AS department FROM department;`;

    conn.query(query)
        .then(([rows, fields]) => {
            console.table(rows);
        })
        .catch(console.log)
        .then(() => init(conn));
}

//Add Departments
function addDepartment(db) {
    inquirer
        .prompt([
            {
                type: "input",
                name: "department",
                message: "What is the name of the department?",
                validate: function (input) {
                    if (input.length < 1) {
                        console.log("Please input the name of the department! ");
                        return false;
                    }
                    return true;
                }
            },
        ])
        .then(data => {
            //db INSERT INTO
            let query = `
            INSERT INTO department (department_name)
            VALUES ("${data.department}")
            `;

            db.query(query)
                .then(() => {
                    console.log(`Added Department: ${data.department} to the database`)
                })
                .catch(console.log)
                .then(() => init(db));
        });
}

//Quit
function quit(db) {
    console.log(`GoodBye!`);
    db.end();
    return;
}




module.exports = { main };