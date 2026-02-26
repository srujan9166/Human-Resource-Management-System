package com.example.officeTask.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PayrollResponseDTO {

  private Long employeeId;
  private String employeeName;
  private Double basicSalary;
  private Double hra;
  private Double pf;
  private Double netSalary;
}
