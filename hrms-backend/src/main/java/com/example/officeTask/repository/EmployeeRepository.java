package com.example.officeTask.repository;

import java.util.Collection;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.officeTask.enums.EmployeeStatus;
import com.example.officeTask.model.Employee;

@Repository

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    
        Optional<Employee> findByEmail(String email);

        Collection<Employee> findByStatus(EmployeeStatus status);

}
