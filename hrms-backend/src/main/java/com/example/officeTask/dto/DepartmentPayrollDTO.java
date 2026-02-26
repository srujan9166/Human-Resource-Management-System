package com.example.officeTask.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentPayrollDTO {
private Long         departmentId;
    private String       departmentName;
    private List<PayrollDTO> employeePayrolls;

  
    private Double totalBasicSalary;
    private Double totalHra;
    private Double totalPfDeduction;
    private Double totalNetSalary;
    private Double averageNetSalary;
}
