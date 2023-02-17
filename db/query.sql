-- SELECT * FROM department; 

-- SELECT * FROM role;

-- SELECT * FROM employee;

-- View All Departments -- 
SELECT id, department_name FROM department;

-- View ALL Roles --
SELECT role.id, role.title, department.department_name, role.salary
FROM role
JOIN department ON role.department_id = department.id;

-- View All Employees -- 

SELECT employee.id, employee.first_name, employee.last_name, role.title, department.department_name AS department, role.salary, employee.manager_id
FROM employee
JOIN role ON employee.role_id = role.id
JOIN department ON role.department_id = department.id
ORDER BY employee.id;

-- Update employee role
-- UPDATE employee SET role_id = [new_role] WHERE id = [empoloyee_id]

-- * Update employee managers.
-- UPDATE employee SET manager_id = [new_manager] WHERE id = [empoloyee_id]

-- * View employees by manager.


-- * View employees by department.
SELECT department.department_name AS department, employee.id, employee.first_name, employee.last_name
FROM employee
JOIN role ON employee.role_id = role.id
JOIN department ON role.department_id = department.id;

-- * Delete departments, roles, and employees.
-- DELETE FROM department WHERE id = ? //please assign new department to the roles if needed, or ask to delete roles first
-- DELETE FROM roles WHERE id = ? //please assign new roles to employee if needed
-- DELETE FROM employees WHERE id = ?

-- * View the total utilized budget of a department&mdash;in other words, the combined salaries of all employees in that department. --
