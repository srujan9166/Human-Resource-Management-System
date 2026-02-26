package com.example.officeTask.service;

import org.springframework.stereotype.Service;

import com.example.officeTask.dto.DepartmentDTO;
import com.example.officeTask.dto.EmployeeDTO;
import com.example.officeTask.model.Department;
import com.example.officeTask.model.Employee;
import com.example.officeTask.repository.DepartmentRepository;
import com.example.officeTask.repository.EmployeeRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;
   

    public DepartmentService(DepartmentRepository departmentRepository, EmployeeService employeeService, EmployeeRepository employeeRepository) {
        this.departmentRepository = departmentRepository;
        this.employeeRepository = employeeRepository;
        
    }

    public DepartmentDTO createDepartment(Department department) {
        Department savedDept = departmentRepository.save(department);
        return convertToDTO(savedDept);
    }

    public DepartmentDTO getDepartmentById(Long id) {
        return departmentRepository.findById(id)
                .map(dep -> convertToDTO(dep))
                .orElseThrow(() -> new RuntimeException("Department not found"));
    }

    public List<EmployeeDTO> getEmployeesByDepartment(Long departmentId) {
        return departmentRepository.findById(departmentId)
                .map(department -> department.getEmployee().stream()
                        .map(this::convertEmployeeToDTO)
                        .collect(Collectors.toList()))
                .orElse(List.of());
    }

    public EmployeeDTO createEmployeeInDepartment(Long departmentId, EmployeeDTO employeeDTO) {
      return departmentRepository.findById(departmentId)
              .map(department -> {
                  Employee employee = new Employee();
                  employee.setName(employeeDTO.getName());
                  employee.setEmail(employeeDTO.getEmail());
                  employee.setDesignation(employeeDTO.getDesignation());
                  employee.setJoiningDate(employeeDTO.getJoiningDate());
                  employee.setSalary(employeeDTO.getSalary());
                  employee.setStatus(employeeDTO.getStatus());
                  employee.setDepartment(department);
                  return convertEmployeeToDTO(employeeRepository.save(employee));
              })
              .orElseThrow(() -> new RuntimeException("Department not found"));
    }

    

    public List<DepartmentDTO> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(dep -> convertToDTO(dep))
                .collect(Collectors.toList());
    }

    private DepartmentDTO convertToDTO(Department department) {
        DepartmentDTO dto = new DepartmentDTO();
        dto.setDepartment_id(department.getDepartment_id());
        dto.setName(department.getName());
        
        if (department.getManager() != null) {
            dto.setManager_id(department.getManager().getEmployeeId());
        }
        
        if (department.getEmployee() != null) {
            dto.setEmployees(department.getEmployee().stream()
                    .map(dep -> convertEmployeeToDTO(dep))
                    .collect(Collectors.toList()));
        }
        
        return dto;
    }

    private EmployeeDTO convertEmployeeToDTO(Employee employee) {
        EmployeeDTO dto = new EmployeeDTO();
        dto.setEmployee_id(employee.getEmployeeId());
        dto.setName(employee.getName());
        dto.setEmail(employee.getEmail());
        dto.setDesignation(employee.getDesignation());
        dto.setJoiningDate(employee.getJoiningDate());
        dto.setSalary(employee.getSalary());
        dto.setStatus(employee.getStatus());
        
        if (employee.getDepartment() != null) {
            dto.setDepartment_id(employee.getDepartment().getDepartment_id());
        }
        
        return dto;
    }

    public DepartmentDTO assignManagerToDepartment(Long dep_id, Long emp_id) {
       Department department = departmentRepository.findById(dep_id)
           .orElseThrow(() -> new RuntimeException("Department not found"));
       Employee employee = employeeRepository.findById(emp_id)
           .orElseThrow(() -> new RuntimeException("Employee not found"));
       department.setManager(employee);
       employee.setDepartment(department);
       return convertToDTO(departmentRepository.save(department));
    }
}
