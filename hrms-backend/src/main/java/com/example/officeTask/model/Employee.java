package com.example.officeTask.model;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

import com.example.officeTask.enums.EmployeeStatus;
import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "employees")
@ToString(exclude = "department")
@EqualsAndHashCode(exclude = "department")

public class Employee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long employeeId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @ManyToOne
    @JoinColumn(name = "department_id")
     @JsonBackReference
    private Department department;

    private String designation;

    private LocalDate joiningDate;

    @Min(value = 1, message = "Salary must be greater than 0")
    @Column(nullable = false)
    private Double salary;
    @Enumerated(EnumType.STRING)
    private EmployeeStatus status;

    @OneToOne
    @JoinColumn(name = "manager_id")
    private Employee manager;

   



// @Override
// public int hashCode() {
//     return Objects.hash(employeeId, name, salary); //  do NOT include department
// }

// @Override
// public boolean equals(Object o) {
//     if (this == o) return true;
//     if (!(o instanceof Employee)) return false;
//     Employee that = (Employee) o;
//     return Objects.equals(employeeId, that.employeeId) &&
//            Objects.equals(name, that.name); //  no department
// }

  

   

    




}
