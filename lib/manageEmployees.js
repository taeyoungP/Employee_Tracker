const inquirer = require('inquirer');
const mysql = require('mysql2/promise'); //https://www.npmjs.com/package/mysql2
const { printTable } = require('console-table-printer'); //https://www.npmjs.com/package/console-table-printer

// Connect to database
async function main() {
    console.log(
        `
        ,________________________________________________________________.
        |                                                                 |
        |   ______                      __                                |
        |   | ____| __ ___ __   _ ___  |  | _____  __   __ ____  ____     |
        |   | __|  |  '_ ''__ \\| '__ \\ |  |/ ___ \\ | | | |/ __ \\/ __ \\    |
        |   | |___ |  | |  | | |  |_) ||  | (___) || |_| |  ___/  ___/    |
        |   |_____||__| |__| |_|  .__/ |__|\\_____/ \\____,|\\____|\\____|    |  
        |                      |__|                 |____/                |
        |    ___  ___                                                     |
        |   |   \\/   | ___ __ __ ____   ____ _  ___ __  ____  __ ___      |
        |   |  |\\/|  |/  _'  |  '__  \\ /  __' |/  __' |/ __ \\|  '___|     |
        |   |  |  |  |  (_|  |  |  |  |  (__| |  (__| |  ___/|  |         |
        |   |__|  |__|\\___,__|_ |  |__|\\___,__|\\____, |\\____||__|         |
        |                                       |____/                    |
        '_________________________________________________________________'

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
    //Whenever goes back to menu, end current opened database and make a new connection to get updated database
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

    inquirer
        .prompt([
            {
                type: 'list',
                name: 'choice',
                message: 'What would you like to do?',
                choices: ['View All Employees', 'Add Employee', 'Update Employee Role', 'View All Roles',
                    'Add Role', 'View All Departments', 'Add Departments', `Update Employee's Manager`, 'View Employees by Manager',
                    'View Employees by Department', 'Delete Departments, Roles, or Employees', 'View the Total Utilized Budget of Department', 'Quit'],
            },
        ])
        .then((data) => {
            if (data.choice === 'View All Employees') {
                viewAllEmp(conn);
            }
            else if (data.choice === 'Add Employee') {
                addEmployee(conn);
            }
            else if (data.choice === 'Update Employee Role') {
                updateEmployeeRole(conn);
            }
            else if (data.choice === 'View All Roles') {
                viewAllRole(conn);
            }
            else if (data.choice === 'Add Role') {
                addRole(conn);
            }
            else if (data.choice === 'View All Departments') {
                viewAllDep(conn);
            }
            else if (data.choice === 'Add Departments') {
                addDepartment(conn);
            }
            else if (data.choice === `Update Employee's Manager`) {
                updateEmpManager(conn);
            }
            else if (data.choice === 'View Employees by Manager') {
                viewEmpManager(conn);
            }
            else if (data.choice === 'View Employees by Department') {
                viewEmpDep(conn);
            }
            else if (data.choice === 'Delete Departments, Roles, or Employees') {
                deleteDB(conn);
            }
            else if (data.choice === 'View the Total Utilized Budget of Department') {
                totalDepBudget(conn);
            }
            else if (data.choice === 'Quit') {
                quit(conn);
            }
        });
}

//View All Employees
async function viewAllEmp(db) {
    const query = `
        SELECT emp.id, emp.first_name, emp.last_name, role.title, department.department_name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
        FROM employee emp
        JOIN role ON emp.role_id = role.id
        JOIN department ON role.department_id = department.id
        LEFT JOIN employee manager ON emp.manager_id = manager.id
        ORDER BY emp.id;
        `;

    db.query(query)
        .then(([rows, fields]) => {
            //console.log(rows);
            //console.table(rows);
            printTable(rows);
        })
        .catch(console.log)
        .then(() => init(db));
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
    const query = `
        SELECT role.id, role.title, department.department_name AS department, role.salary
        FROM role
        JOIN department ON role.department_id = department.id
        ORDER BY role.id;
        `;

    db.query(query)
        .then(([rows, fields]) => {
            //console.table(rows);
            printTable(rows);
        })
        .catch(console.log)
        .then(() => init(db));
}

//Add Role
async function addRole(db) {
    //departments
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
    const query = `SELECT id, department_name AS department FROM department;`;

    db.query(query)
        .then(([rows, fields]) => {
            //console.table(rows);
            printTable(rows);
        })
        .catch(console.log)
        .then(() => init(db));
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


//--------------------------------------------------Bonus


//Update employee managers
async function updateEmpManager(db) {
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

    //managers
    let managers = [];
    let managers_id = [];
    const managerQuery = `
    SELECT emp.manager_id, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
    FROM employee emp
    JOIN employee manager ON emp.manager_id = manager.id
    WHERE emp.manager_id IS NOT NULL
    GROUP BY emp.manager_id, manager.first_name, manager.last_name;
    `;

    await db.query(managerQuery)
        .then(([rows, fields]) => {
            ;
            //console.table(rows);
            for (let i = 0; i < rows.length; i++) {
                managers.push(rows[i].manager);
                managers_id.push(rows[i].manager_id);
            }
            managers.push("None");
            managers_id.push(0);
        })
        .catch(console.log)
    //----------------------------------------------

    inquirer
        .prompt([
            {
                type: 'list',
                name: 'employee',
                message: 'Which manager of employee(s) would you like to see?',
                choices: employees,
            },
            {
                type: 'list',
                name: 'manager',
                message: 'Please select new manager',
                choices: managers,
            },
        ])
        .then(data => {
            let employee_id = employees_id[employees.indexOf(data.employee)];
            let manager_id = managers_id[managers.indexOf(data.manager)];
            let query = ``;

            if (employee_id == manager_id) {
                console.log('Invalid choice: employee cannot set self to manager. Please try again with different manager.');
                init(db);
                return;
            }
            else {
                if (manager_id == 0) {
                    query = `UPDATE employee SET manager_id = NULL WHERE id = ${employee_id};`;
                } else {
                    query = `UPDATE employee SET manager_id = ${manager_id} WHERE id = ${employee_id};`;
                }

                db.query(query)
                    .then(([rows, fields]) => {
                        console.log(`Employee, ${data.employee} manager has been updated as ${data.manager}!`)
                        init(db);
                    })
                    .catch(console.log)
            }

        });
}

//View employees by manager
async function viewEmpManager(db) {
    //Managers
    let managers = [];
    let managers_id = [];
    const managerQuery = `
    SELECT emp.manager_id, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
    FROM employee emp
    JOIN employee manager ON emp.manager_id = manager.id
    WHERE emp.manager_id IS NOT NULL
    GROUP BY emp.manager_id, manager.first_name, manager.last_name;
    `;

    await db.query(managerQuery)
        .then(([rows, fields]) => {
            ;
            //console.table(rows);
            for (let i = 0; i < rows.length; i++) {
                managers.push(rows[i].manager);
                managers_id.push(rows[i].manager_id);
            }
        })
        .catch(console.log)

    inquirer
        .prompt([
            {
                type: 'list',
                name: 'manager',
                message: 'Which manager of employee(s) would you like to see?',
                choices: managers,
            },
        ])
        .then(data => {
            let manager_id = managers_id[managers.indexOf(data.manager)];

            let query = `
            SELECT CONCAT(manager.first_name, ' ', manager.last_name) AS manager, CONCAT(emp.first_name, ' ', emp.last_name) AS employee
            FROM employee emp
            LEFT JOIN employee manager ON emp.manager_id = manager.id
            WHERE emp.manager_id = ${manager_id};
            `;

            db.query(query)
                .then(([rows, fields]) => {
                    printTable(rows);
                })
                .catch(console.log)
                .then(() => init(db));
        });
}

//View Employees by Departments
async function viewEmpDep(db) {
    //departments
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
                type: 'list',
                name: 'department',
                message: 'Which Department of employees would you like to view?',
                choices: departments,
            },
        ])
        .then(data => {
            //db INSERT INTO
            let department_id = departments_id[departments.indexOf(data.department)];

            let query = `
                SELECT department.department_name AS department, employee.id, employee.first_name, employee.last_name
                FROM employee
                JOIN role ON employee.role_id = role.id
                JOIN department ON role.department_id = department.id
                WHERE department.id = ${department_id}; 
                `;

            db.query(query)
                .then(([rows, fields]) => {
                    printTable(rows);
                })
                .catch(console.log)
                .then(() => init(db));
        });
}

//Delete departments, roles, and employees.
async function deleteDepartment(db) {
    //departments
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
                type: 'list',
                name: 'department',
                message: 'Which department would you like to delete?',
                choices: departments,
            },
        ])
        .then(data => {
            let department_id = departments_id[departments.indexOf(data.department)];

            const query = `DELETE FROM department WHERE id = ${department_id}`;

            db.query(query)
                .then(() => {
                    console.log(`Department: ${data.department} has been deleted! (Please note employee(s) in ${data.department} data also has been removed.)`)
                })
                .catch(console.log)
                .then(() => init(db));
        });
}
async function deleteRole(db) {
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
                name: 'role',
                message: 'Which role would you like to delete?',
                choices: roles,
            },
        ])
        .then(data => {
            let role_id = roles_id[roles.indexOf(data.role)];

            const query = `DELETE FROM role WHERE id = ${role_id}`;

            db.query(query)
                .then(() => {
                    console.log(`Role: ${data.role} has been deleted! (Please note employee(s) in ${data.role} data also has been removed.)`)
                })
                .catch(console.log)
                .then(() => init(db));
        });
}
async function deleteEmployee(db) {
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

    inquirer
        .prompt([
            {
                type: 'list',
                name: 'employee',
                message: 'Who would you like to delete?',
                choices: employees,
            },
        ])
        .then(data => {
            let employee_id = employees_id[employees.indexOf(data.employee)];

            const query = `DELETE FROM employee WHERE id = ${employee_id}`;

            db.query(query)
                .then(() => {
                    console.log(`${data.employee} has been deleted!`)
                })
                .catch(console.log)
                .then(() => init(db));
        });
}
function deleteDB(db) {
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'choice',
                message: 'Which information/data would you like to delete?',
                choices: ['Departments', 'Roles', 'Employees']
            },
        ])
        .then(data => {
            if (data.choice === 'Departments') {
                deleteDepartment(db);
            }
            else if (data.choice === 'Roles') {
                deleteRole(db);
            }
            else if (data.choice === 'Employees') {
                deleteEmployee(db);
            }
        });
}

//View the total utilized budget of a department (the combined salaries of all employees in that department)
async function totalDepBudget(db) {
    //departments
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
                type: 'list',
                name: 'department',
                message: 'Which Department of total utilized budget would you like to view?',
                choices: departments,
            },
        ])
        .then(data => {
            let department_name = data.department;

            let query = `
            SELECT department.department_name AS department, SUM(role.salary) AS total_utilized_budget
            FROM employee
            JOIN role ON employee.role_id = role.id
            JOIN department ON role.department_id = department.id
            WHERE department_name = '${department_name}';
            `;

            db.query(query)
                .then(([rows, fields]) => {
                    console.log(rows);
                    printTable(rows);
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