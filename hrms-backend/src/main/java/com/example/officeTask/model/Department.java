package com.example.officeTask.model;

import java.util.List;
import java.util.Objects;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "departments")
@ToString(exclude = "employees")
@EqualsAndHashCode(exclude = "employees")
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long department_id;

    @Column(nullable = false)
    private String name;

    @OneToMany(mappedBy = "department")

    @JsonManagedReference
    private List<Employee> employee;

    @ManyToOne
    @JoinColumn(name = "manager_id")
    @JsonIgnore
    private Employee manager;

    // @Override
    // public int hashCode() {
    // return Objects.hash(department_id, name); // do NOT include employees list
    // }

    // @Override
    // public boolean equals(Object o) {
    // if (this == o) return true;
    // if (!(o instanceof Department)) return false;
    // Department that = (Department) o;
    // return Objects.equals(department_id, that.department_id) &&
    // Objects.equals(name, that.name); // no employees
    // }

}
