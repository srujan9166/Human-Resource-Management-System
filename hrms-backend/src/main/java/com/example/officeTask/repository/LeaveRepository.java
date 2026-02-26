package com.example.officeTask.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.officeTask.model.Employee;
import com.example.officeTask.model.Leave;

@Repository
public interface LeaveRepository extends JpaRepository<Leave, Long> {
   
        Optional<Leave> findByEmployee(Employee employee);
    List<Leave> findByEmployee_EmployeeId(Long employeeId);

    
   
}
