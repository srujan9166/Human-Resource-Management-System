package com.example.officeTask.service;

import java.util.List;
import java.util.stream.Collectors;


import org.springframework.stereotype.Service;

import com.example.officeTask.dto.DepartmentPayrollDTO;
import com.example.officeTask.dto.PayrollDTO;
import com.example.officeTask.enums.EmployeeStatus;
import com.example.officeTask.model.Department;
import com.example.officeTask.model.Employee;
import com.example.officeTask.repository.DepartmentRepository;
import com.example.officeTask.repository.EmployeeRepository;
@Service
public class PayrollService {
// Salary formula constants
    private static final double HRA_PERCENT  = 0.40;
    private static final double PF_PERCENT   = 0.12;

    private final EmployeeRepository   employeeRepository;
    private final DepartmentRepository departmentRepository;

    public PayrollService(EmployeeRepository employeeRepository,
                          DepartmentRepository departmentRepository) {
        this.employeeRepository   = employeeRepository;
        this.departmentRepository = departmentRepository;
    }

    // -------------------------------------------------------
    // Core formula — used across both endpoints
    // -------------------------------------------------------
    private PayrollDTO computePayroll(Employee employee) {
        double basic = employee.getSalary();
        double hra   = basic * HRA_PERCENT;
        double pf    = basic * PF_PERCENT;
        double net   = basic + hra - pf;

        return new PayrollDTO(
                employee.getEmployeeId(),
                employee.getName(),
                employee.getDesignation(),
                round(basic),
                round(hra),
                round(pf),
                round(net)
        );
    }

    // -------------------------------------------------------
    // GET /payroll/{employeeId}
    // -------------------------------------------------------
    public PayrollDTO getEmployeePayroll(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + employeeId));
        return computePayroll(employee);
    }

    // -------------------------------------------------------
    // GET /payroll/department/{deptId}
    // -------------------------------------------------------
    public DepartmentPayrollDTO getDepartmentPayroll(Long deptId) {
        Department department = departmentRepository.findById(deptId)
                .orElseThrow(() -> new RuntimeException("Department not found with id: " + deptId));

        // Only include ACTIVE employees — filter via Stream
        List<PayrollDTO> employeePayrolls = department.getEmployee().stream()
                .filter(emp -> EmployeeStatus.ACTIVE.equals(emp.getStatus()))
                .map(this::computePayroll)
                .collect(Collectors.toList());

        // Aggregates using Java 8 Streams
        double totalBasic  = employeePayrolls.stream().mapToDouble(PayrollDTO::getBasicSalary).sum();
        double totalHra    = employeePayrolls.stream().mapToDouble(PayrollDTO::getHra).sum();
        double totalPf     = employeePayrolls.stream().mapToDouble(PayrollDTO::getPfDeduction).sum();
        double totalNet    = employeePayrolls.stream().mapToDouble(PayrollDTO::getNetSalary).sum();
        double averageNet  = employeePayrolls.stream()
                .mapToDouble(PayrollDTO::getNetSalary)
                .average()
                .orElse(0.0);

        return new DepartmentPayrollDTO(
                department.getDepartment_id(),
                department.getName(),
                employeePayrolls,
                round(totalBasic),
                round(totalHra),
                round(totalPf),
                round(totalNet),
                round(averageNet)
        );
    }

    // -------------------------------------------------------
    // Helper — round to 2 decimal places
    // -------------------------------------------------------
    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
