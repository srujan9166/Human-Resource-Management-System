package com.example.officeTask.dto;

import java.time.LocalDate;
import com.example.officeTask.enums.EmployeeStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDTO {
    private Long employee_id;
    private String name;
    private String email;
    private String designation;
    private LocalDate joiningDate;
    private Double salary;
    private EmployeeStatus status;
    private Long department_id;
}
