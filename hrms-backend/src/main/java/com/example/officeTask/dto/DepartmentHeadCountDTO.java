package com.example.officeTask.dto;

import com.example.officeTask.model.Department;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DepartmentHeadCountDTO {

    private Department department;
    private Long headCount;

}
