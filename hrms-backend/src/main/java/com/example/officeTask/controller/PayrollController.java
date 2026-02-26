package com.example.officeTask.controller;

import com.example.officeTask.dto.DepartmentPayrollDTO;
import com.example.officeTask.dto.PayrollDTO;
import com.example.officeTask.service.PayrollService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/payroll")
public class PayrollController {

    private final PayrollService payrollService;

    public PayrollController(PayrollService payrollService) {
        this.payrollService = payrollService;
    }

    /**
     * GET /payroll/{employeeId}
     * Returns the full salary breakdown for one employee.
     *
     * Breakdown:
     *   Basic Salary  — as stored in DB
     *   HRA           — 40% of Basic
     *   PF Deduction  — 12% of Basic
     *   Net Salary    — Basic + HRA - PF
     */
    @GetMapping("/{employeeId}")
    public ResponseEntity<PayrollDTO> getEmployeePayroll(@PathVariable Long employeeId) {
        return ResponseEntity.ok(payrollService.getEmployeePayroll(employeeId));
    }

    /**
     * GET /payroll/department/{deptId}
     * Returns payroll breakdown for every ACTIVE employee in the department,
     * plus department-level totals and average net salary.
     */
    @GetMapping("/department/{deptId}")
    public ResponseEntity<DepartmentPayrollDTO> getDepartmentPayroll(@PathVariable Long deptId) {
        return ResponseEntity.ok(payrollService.getDepartmentPayroll(deptId));
    }
}
