package com.example.officeTask.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.officeTask.model.Department;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
        
}
