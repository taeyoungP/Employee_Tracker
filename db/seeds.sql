
INSERT INTO department (department_name)
VALUES ("Sales"), -- 1 --
       ("Engineering"), -- 2 --
       ("Finance"), -- 3 --
       ("Legal"); -- 4 --


INSERT INTO role (title, salary, department_id)
VALUES ("Sales Lead", 100000, 1), -- 1 --
       ("Salesperson", 80000, 1), -- 2 --
       ("Lead Engineer", 150000, 2), -- 3 --
       ("Software Engineer", 120000, 2), -- 4 --
       ("Account Manager", 160000, 3), -- 5 --
       ("Accountant", 125000, 3), -- 6 --
       ("Legal Team Lead", 250000, 4), -- 7 --
       ("Lawyer", 190000, 4); -- 8 --


INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("John", "Doe", 1, NULL), -- 1 -
       ("Mike", "Chan", 2, 1), 
       ("Ashley", "Rodriguez", 3, NULL), -- 3 -
       ("Kevin", "Tupik", 4, 3), 
       ("Kunal", "Singh", 5, NULL), -- 5 -
       ("Malia", "Brown", 6, 5),
       ("Sarah", "Lourd", 7, NULL),
       ("Tom", "Allen", 8, 7);