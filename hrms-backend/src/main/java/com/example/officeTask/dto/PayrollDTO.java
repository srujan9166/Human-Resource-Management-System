package com.example.officeTask.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PayrollDTO {
   
    private Long   employeeId;
    private String employeeName;
    private String designation;

    // Salary breakdown
    private Double basicSalary;
    private Double hra;              // 40% of basic
    private Double pfDeduction;     // 12% of basic
    private Double netSalary;       // basic + hra - pf

}
