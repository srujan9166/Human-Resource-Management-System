package com.example.officeTask.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentDTO {
    private Long department_id;
    private String name;
    private Long manager_id;
    private List<EmployeeDTO> employees;
}
