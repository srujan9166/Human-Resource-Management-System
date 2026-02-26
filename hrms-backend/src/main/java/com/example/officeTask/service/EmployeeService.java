package com.example.officeTask.service;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.officeTask.dto.EmployeeDTO;
import com.example.officeTask.enums.EmployeeStatus;
import com.example.officeTask.enums.Role;
import com.example.officeTask.model.Employee;
import com.example.officeTask.model.User;
import com.example.officeTask.repository.EmployeeRepository;
import com.example.officeTask.repository.UserRepository;
import com.example.officeTask.repository.DepartmentRepository;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;

    
    public User getCurrentUser(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if(authentication != null && authentication.getPrincipal() instanceof User){
            return (User) authentication.getPrincipal();
        }
        return null;
    }
    

    public EmployeeService(EmployeeRepository employeeRepository, DepartmentRepository departmentRepository,PasswordEncoder passwordEncoder,UserRepository userRepository) {
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncoder = passwordEncoder;
        this.userRepository=userRepository;
    }

    public EmployeeDTO createEmployee(EmployeeDTO employeeDTO) {
        Employee employee = convertDTOToEmployee(employeeDTO);
        // Employee employee = new Employee();
        // employee.setName(employeeDTO.getName());
        // employee.setEmail(employeeDTO.getEmail());
        // employee.setDesignation(employeeDTO.getDesignation());
        // employee.setJoiningDate(employeeDTO.getJoiningDate());
        // employee.setSalary(employeeDTO.getSalary());
        // employee.setStatus(employeeDTO.getStatus());

        Employee savedEmployee = employeeRepository.save(employee);

        User newUser = new User();
        newUser.setUsername(employeeDTO.getEmail());
        newUser.setPassword(passwordEncoder.encode("bisag"));
        newUser.setRole(Role.EMPLOYEE);
        newUser.setEmployee(employee);

        userRepository.save(newUser);
        
        if (employeeDTO.getDepartment_id() != null) {
            employee.setDepartment(departmentRepository.findById(employeeDTO.getDepartment_id()).orElse(null));
        }
        
        
        return convertToDTO(savedEmployee);
    }

    
    public EmployeeDTO getEmployeeById(Long id) {
      return employeeRepository.findById(id)
                 .map(emp -> convertToDTO(emp))
                 .orElseThrow(() -> new RuntimeException("Employee not found"));
    }

    
    public List<EmployeeDTO> getAllEmployees() {
        return employeeRepository.findAll().stream()
                .map(emp -> convertToDTO(emp))
                .collect(Collectors.toList());
    }

    public EmployeeDTO updateEmployee(Long id, EmployeeDTO employeeDTO) {
        return employeeRepository.findById(id)
                .map(employee -> {
                    employee.setName(employeeDTO.getName());
                    employee.setEmail(employeeDTO.getEmail());
                    employee.setDesignation(employeeDTO.getDesignation());
                    employee.setJoiningDate(employeeDTO.getJoiningDate());
                    employee.setSalary(employeeDTO.getSalary());
                    employee.setStatus(employeeDTO.getStatus());
                    
                    if (employeeDTO.getDepartment_id() != null) {
                        employee.setDepartment(departmentRepository.findById(employeeDTO.getDepartment_id())
                            .orElseThrow(() -> new RuntimeException("Department not found")));
                    }
                    
                    return convertToDTO(employeeRepository.save(employee));
                })
                .orElseThrow(() -> new RuntimeException("Employee not found"));
    }

    public void deleteEmployee(Long id) {

        Employee emp = employeeRepository.findById(id).orElseThrow(()->new UsernameNotFoundException("User Not Found"));
        emp.setStatus(EmployeeStatus.INACTIVE);
        employeeRepository.save(emp);
    }

    private EmployeeDTO convertToDTO(Employee employee) {
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



    public Employee createManager(Employee employee) {
      employee.setDesignation("Manager");
      Employee savedEmployee = employeeRepository.save(employee);

      User newUser = new User();
      newUser.setUsername(employee.getEmail());
      newUser.setPassword(passwordEncoder.encode("bisag"));
      newUser.setRole(Role.MANAGER);


      newUser.setEmployee(savedEmployee);
      userRepository.save(newUser);

      return savedEmployee;
       
    }
    private Employee convertDTOToEmployee(EmployeeDTO dto) {
        Employee employee = new Employee();
        employee.setEmployeeId(dto.getEmployee_id());
        employee.setName(dto.getName());
        employee.setEmail(dto.getEmail());
        employee.setDesignation(dto.getDesignation());
        employee.setJoiningDate(dto.getJoiningDate());
        employee.setSalary(dto.getSalary());
        employee.setStatus(dto.getStatus());
        return employee;
    }


    // public void activeEmployees() {
    //     // TODO Auto-generated method stub
    //     throw new UnsupportedOperationException("Unimplemented method 'activeEmployees'");
    // }
}
