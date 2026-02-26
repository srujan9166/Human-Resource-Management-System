package com.example.officeTask.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.officeTask.dto.DepartmentDTO;
import com.example.officeTask.dto.EmployeeDTO;
import com.example.officeTask.model.Department;
import com.example.officeTask.service.DepartmentService;
import java.util.List;

@RestController
@RequestMapping("/department")
public class DepartmentController {

    private final DepartmentService departmentService;

    public DepartmentController(DepartmentService departmentService) {
        this.departmentService = departmentService;
    }

    @PutMapping("/{department_id}/assign/{employee_id}")
    public ResponseEntity<DepartmentDTO> assignManagerToDepartment(@PathVariable Long department_id,
            @PathVariable Long employee_id) {
        DepartmentDTO result = departmentService.assignManagerToDepartment(department_id, employee_id);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/create")
    public ResponseEntity<DepartmentDTO> createDepartment(@RequestBody Department department) {
        DepartmentDTO created = departmentService.createDepartment(department);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DepartmentDTO> getDepartmentById(@PathVariable Long id) {
        return ResponseEntity.ok(departmentService.getDepartmentById(id));
    }

    @GetMapping("/departments")
    public ResponseEntity<List<DepartmentDTO>> getAllDepartments() {
        return ResponseEntity.ok(departmentService.getAllDepartments());
    }

    @GetMapping("/{id}/employees")
    public ResponseEntity<List<EmployeeDTO>> getEmployeesByDepartment(@PathVariable Long id) {
        return ResponseEntity.ok(departmentService.getEmployeesByDepartment(id));
    }

    @PostMapping("/{id}/employees")
    public ResponseEntity<EmployeeDTO> createEmployeeInDepartment(@PathVariable Long id,
            @RequestBody EmployeeDTO employeeDTO) {
        EmployeeDTO created = departmentService.createEmployeeInDepartment(id, employeeDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
