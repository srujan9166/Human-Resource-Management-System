package com.example.officeTask.service;

import com.example.officeTask.enums.EmployeeStatus;
import com.example.officeTask.enums.LeaveStatus;
import com.example.officeTask.enums.LeaveType;
import com.example.officeTask.enums.Role;
import com.example.officeTask.model.Department;
import com.example.officeTask.model.Employee;
import com.example.officeTask.model.Leave;
import com.example.officeTask.model.User;
import com.example.officeTask.repository.DepartmentRepository;
import com.example.officeTask.repository.EmployeeRepository;
import com.example.officeTask.repository.LeaveRepository;
import com.example.officeTask.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final UserRepository       userRepository;
    private final EmployeeRepository   employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final LeaveRepository      leaveRepository;
    private final PasswordEncoder      passwordEncoder;

    @Override
    public void run(String... args) {

        // Run only on fresh startup (empty DB)
        if (userRepository.count() > 0) return;

        // ─────────────────────────────────────────────
        // SYSTEM USERS  (no linked Employee)
        // ─────────────────────────────────────────────
        User admin = createUser("admin", "admin123", Role.ADMIN, null);
        User ceo   = createUser("ceo",   "ceo123",   Role.CEO,   null);
        userRepository.save(admin);
        userRepository.save(ceo);

        // ─────────────────────────────────────────────
        // DEPARTMENT 1 — IT
        // ─────────────────────────────────────────────
        Employee itManager = createEmployee(
                "Ravi Kumar", "ravi.kumar@company.com", "Engineering Manager",
                LocalDate.of(2018, 3, 10), 85000.0, EmployeeStatus.ACTIVE);
        employeeRepository.save(itManager);
        userRepository.save(createUser("ravi.kumar@company.com", "manager123", Role.MANAGER, itManager));

        Department itDept = createDepartment("IT Department", itManager);
        departmentRepository.save(itDept);
        itManager.setDepartment(itDept);
        employeeRepository.save(itManager);

        Employee emp1 = createEmployee(
                "Srujan Rallabandi", "srujan@company.com", "Software Engineer",
                LocalDate.of(2020, 1, 15), 60000.0, EmployeeStatus.ACTIVE);
        emp1.setDepartment(itDept);
        employeeRepository.save(emp1);
        userRepository.save(createUser("srujan@company.com", "emp123", Role.EMPLOYEE, emp1));

        Employee emp2 = createEmployee(
                "Priya Sharma", "priya.sharma@company.com", "Senior Developer",
                LocalDate.of(2019, 6, 20), 75000.0, EmployeeStatus.ACTIVE);
        emp2.setDepartment(itDept);
        employeeRepository.save(emp2);
        userRepository.save(createUser("priya.sharma@company.com", "emp123", Role.EMPLOYEE, emp2));

        Employee emp3 = createEmployee(
                "Arjun Mehta", "arjun.mehta@company.com", "Junior Developer",
                LocalDate.of(2022, 9, 1), 40000.0, EmployeeStatus.ACTIVE);
        emp3.setDepartment(itDept);
        employeeRepository.save(emp3);
        userRepository.save(createUser("arjun.mehta@company.com", "emp123", Role.EMPLOYEE, emp3));

        // Inactive employee in IT
        Employee emp4 = createEmployee(
                "Neha Patel", "neha.patel@company.com", "QA Engineer",
                LocalDate.of(2021, 4, 5), 50000.0, EmployeeStatus.INACTIVE);
        emp4.setDepartment(itDept);
        employeeRepository.save(emp4);
        userRepository.save(createUser("neha.patel@company.com", "emp123", Role.EMPLOYEE, emp4));

        // ─────────────────────────────────────────────
        // DEPARTMENT 2 — HR
        // ─────────────────────────────────────────────
        Employee hrManager = createEmployee(
                "Sneha Reddy", "sneha.reddy@company.com", "HR Manager",
                LocalDate.of(2017, 7, 1), 90000.0, EmployeeStatus.ACTIVE);
        employeeRepository.save(hrManager);
        userRepository.save(createUser("sneha.reddy@company.com", "manager123", Role.MANAGER, hrManager));

        Department hrDept = createDepartment("HR Department", hrManager);
        departmentRepository.save(hrDept);
        hrManager.setDepartment(hrDept);
        employeeRepository.save(hrManager);

        Employee emp5 = createEmployee(
                "Karan Joshi", "karan.joshi@company.com", "HR Executive",
                LocalDate.of(2021, 2, 14), 45000.0, EmployeeStatus.ACTIVE);
        emp5.setDepartment(hrDept);
        employeeRepository.save(emp5);
        userRepository.save(createUser("karan.joshi@company.com", "emp123", Role.EMPLOYEE, emp5));

        Employee emp6 = createEmployee(
                "Anjali Singh", "anjali.singh@company.com", "Recruitment Specialist",
                LocalDate.of(2023, 1, 10), 48000.0, EmployeeStatus.ACTIVE);
        emp6.setDepartment(hrDept);
        employeeRepository.save(emp6);
        userRepository.save(createUser("anjali.singh@company.com", "emp123", Role.EMPLOYEE, emp6));

        // ─────────────────────────────────────────────
        // DEPARTMENT 3 — Finance
        // ─────────────────────────────────────────────
        Employee finManager = createEmployee(
                "Vikram Desai", "vikram.desai@company.com", "Finance Manager",
                LocalDate.of(2016, 11, 20), 95000.0, EmployeeStatus.ACTIVE);
        employeeRepository.save(finManager);
        userRepository.save(createUser("vikram.desai@company.com", "manager123", Role.MANAGER, finManager));

        Department finDept = createDepartment("Finance Department", finManager);
        departmentRepository.save(finDept);
        finManager.setDepartment(finDept);
        employeeRepository.save(finManager);

        Employee emp7 = createEmployee(
                "Rohit Gupta", "rohit.gupta@company.com", "Accountant",
                LocalDate.of(2020, 8, 3), 55000.0, EmployeeStatus.ACTIVE);
        emp7.setDepartment(finDept);
        employeeRepository.save(emp7);
        userRepository.save(createUser("rohit.gupta@company.com", "emp123", Role.EMPLOYEE, emp7));

        Employee emp8 = createEmployee(
                "Divya Nair", "divya.nair@company.com", "Financial Analyst",
                LocalDate.of(2021, 5, 17), 65000.0, EmployeeStatus.ACTIVE);
        emp8.setDepartment(finDept);
        employeeRepository.save(emp8);
        userRepository.save(createUser("divya.nair@company.com", "emp123", Role.EMPLOYEE, emp8));

        // ─────────────────────────────────────────────
        // LEAVE RECORDS
        // ─────────────────────────────────────────────

        // emp1 — APPROVED sick leave (past)
        leaveRepository.save(createLeave(emp1,
                LocalDate.of(2025, 1, 6),  LocalDate.of(2025, 1, 8),
                LeaveType.SICK_LEAVE, LeaveStatus.APPROVED, "Fever and cold"));

        // emp1 — PENDING casual leave (future)
        leaveRepository.save(createLeave(emp1,
                LocalDate.of(2026, 3, 10), LocalDate.of(2026, 3, 12),
                LeaveType.CASUAL_LEAVE, LeaveStatus.PENDING, "Family function"));

        // emp2 — APPROVED earned leave (active today: covers Feb 2026)
        leaveRepository.save(createLeave(emp2,
                LocalDate.of(2026, 2, 23), LocalDate.of(2026, 2, 26),
                LeaveType.EARNED_LEAVE, LeaveStatus.APPROVED, "Vacation"));

        // emp2 — REJECTED leave
        leaveRepository.save(createLeave(emp2,
                LocalDate.of(2025, 12, 24), LocalDate.of(2025, 12, 26),
                LeaveType.CASUAL_LEAVE, LeaveStatus.REJECTED, "Christmas travel"));

        // emp3 — PENDING sick leave
        leaveRepository.save(createLeave(emp3,
                LocalDate.of(2026, 2, 25), LocalDate.of(2026, 2, 25),
                LeaveType.SICK_LEAVE, LeaveStatus.PENDING, "Doctor appointment"));

        // emp5 — APPROVED casual leave (past)
        leaveRepository.save(createLeave(emp5,
                LocalDate.of(2025, 11, 3), LocalDate.of(2025, 11, 5),
                LeaveType.CASUAL_LEAVE, LeaveStatus.APPROVED, "Personal work"));

        // emp7 — APPROVED earned leave (active today: covers Feb 2026)
        leaveRepository.save(createLeave(emp7,
                LocalDate.of(2026, 2, 24), LocalDate.of(2026, 2, 28),
                LeaveType.EARNED_LEAVE, LeaveStatus.APPROVED, "Annual leave"));

        // emp8 — PENDING leave
        leaveRepository.save(createLeave(emp8,
                LocalDate.of(2026, 4, 1), LocalDate.of(2026, 4, 3),
                LeaveType.CASUAL_LEAVE, LeaveStatus.PENDING, "Trip"));

        System.out.println("====================================================");
        System.out.println("  DataLoader: Sample data loaded successfully!");
        System.out.println("  Departments : IT, HR, Finance");
        System.out.println("  Employees   : 8 (1 INACTIVE)");
        System.out.println("  Managers    : 3");
        System.out.println("  Leave records: 8");
        System.out.println("----------------------------------------------------");
        System.out.println("  SYSTEM CREDENTIALS:");
        System.out.println("  admin / admin123   (ADMIN)");
        System.out.println("  ceo   / ceo123     (CEO)");
        System.out.println("----------------------------------------------------");
        System.out.println("  MANAGER CREDENTIALS:");
        System.out.println("  ravi.kumar@company.com  / manager123  (IT)");
        System.out.println("  sneha.reddy@company.com / manager123  (HR)");
        System.out.println("  vikram.desai@company.com/ manager123  (Finance)");
        System.out.println("----------------------------------------------------");
        System.out.println("  EMPLOYEE CREDENTIALS (all use: emp123):");
        System.out.println("  srujan@company.com     (IT)");
        System.out.println("  priya.sharma@company.com (IT)");
        System.out.println("  arjun.mehta@company.com  (IT)");
        System.out.println("  neha.patel@company.com   (IT, INACTIVE)");
        System.out.println("  karan.joshi@company.com  (HR)");
        System.out.println("  anjali.singh@company.com (HR)");
        System.out.println("  rohit.gupta@company.com  (Finance)");
        System.out.println("  divya.nair@company.com   (Finance)");
        System.out.println("====================================================");
    }

    // ─────────────────────────────────────────────────────────
    // Helper builders
    // ─────────────────────────────────────────────────────────

    private Employee createEmployee(String name, String email, String designation,
                                    LocalDate joiningDate, Double salary, EmployeeStatus status) {
        Employee e = new Employee();
        e.setName(name);
        e.setEmail(email);
        e.setDesignation(designation);
        e.setJoiningDate(joiningDate);
        e.setSalary(salary);
        e.setStatus(status);
        return e;
    }

    private User createUser(String username, String rawPassword, Role role, Employee employee) {
        User u = new User();
        u.setUsername(username);
        u.setPassword(passwordEncoder.encode(rawPassword));
        u.setRole(role);
        u.setEmployee(employee);
        return u;
    }

    private Department createDepartment(String name, Employee manager) {
        Department d = new Department();
        d.setName(name);
        
        return d;
    }

    private Leave createLeave(Employee employee, LocalDate start, LocalDate end,
                              LeaveType type, LeaveStatus status, String reason) {
        Leave l = new Leave();
        l.setEmployee(employee);
        l.setStartDate(start);
        l.setEndDate(end);
        l.setLeaveType(type);
        l.setLeaveStatus(status);
        l.setReason(reason);
        return l;
    }
}
