package com.example.officeTask.service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.officeTask.dto.DepartmentHeadCountDTO;
import com.example.officeTask.dto.LeaveTypeStatsDTO;
import com.example.officeTask.dto.ReportSummaryDTO;
import com.example.officeTask.enums.EmployeeStatus;
import com.example.officeTask.enums.LeaveStatus;
import com.example.officeTask.model.Employee;
import com.example.officeTask.model.Leave;
import com.example.officeTask.repository.DepartmentRepository;
import com.example.officeTask.repository.EmployeeRepository;
import com.example.officeTask.repository.LeaveRepository;
import com.example.officeTask.repository.UserRepository;

@Service
public class ReportService {

    private final EmployeeRepository   employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final LeaveRepository      leaveRepository;
    private final UserRepository       userRepository;

    public ReportService(EmployeeRepository employeeRepository,
                         DepartmentRepository departmentRepository,
                         LeaveRepository leaveRepository,
                         UserRepository userRepository) {
        this.employeeRepository   = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.leaveRepository      = leaveRepository;
        this.userRepository       = userRepository;
    }

    /** GET /report/top-earn?limit=5 — Top earners by salary */
    public List<Employee> getTopEarners(int limit) {
        return employeeRepository.findByStatus(EmployeeStatus.ACTIVE)
                .stream()
                .sorted((e1, e2) -> e2.getSalary().compareTo(e1.getSalary()))
                .limit(limit)
                .toList();
    }

    /** GET /report/recent-join?months=6 — Employees who joined within N months */
    public List<Employee> getRecentJoiners(int months) {
        return employeeRepository.findAll()
                .stream()
                .filter(e -> e.getJoiningDate() != null)
                .filter(e -> ChronoUnit.MONTHS.between(e.getJoiningDate(), LocalDate.now()) <= months)
                .collect(Collectors.toList());
    }

    /** GET /report/department-headcount — Headcount per department */
    public List<DepartmentHeadCountDTO> getDepartmentHeadCount() {
        return employeeRepository.findAll()
                .stream()
                .filter(e -> e.getDepartment() != null)
                .collect(Collectors.groupingBy(emp -> emp.getDepartment(), Collectors.counting()))
                .entrySet()
                .stream()
                .map(e -> new DepartmentHeadCountDTO(e.getKey(), e.getValue()))
                .toList();
    }

    /** GET /report/high-salary-departments?threshold=60000 — Depts above avg threshold */
    public Map<Object, Object> getHighSalaryDepartments(double threshold) {
        return employeeRepository.findAll()
                .stream()
                .filter(e -> e.getDepartment() != null)
                .collect(Collectors.groupingBy(Employee::getDepartment,
                        Collectors.averagingDouble(Employee::getSalary)))
                .entrySet()
                .stream()
                .filter(entry -> entry.getValue() > threshold)
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
    }

    /** GET /report/salary-partition — Split above / below average salary */
    public Map<String, List<Employee>> getSalaryPartition() {
        List<Employee> employees = employeeRepository.findAll();
        double avgSalary = employees.stream()
                .mapToDouble(Employee::getSalary)
                .average()
                .orElse(0.0);

        Map<Boolean, List<Employee>> partitioned = employees.stream()
                .collect(Collectors.partitioningBy(e -> e.getSalary() > avgSalary));

        Map<String, List<Employee>> result = new HashMap<>();
        result.put("aboveAverage", partitioned.get(true));
        result.put("belowAverage",  partitioned.get(false));
        return result;
    }

    /** GET /report/summary — Full dashboard summary for Reports page */
    public ReportSummaryDTO getOverallSummary() {
        List<Employee> allEmployees = employeeRepository.findAll();
        List<Leave>    allLeaves    = leaveRepository.findAll();

        long total    = allEmployees.size();
        long active   = allEmployees.stream().filter(e -> EmployeeStatus.ACTIVE.equals(e.getStatus())).count();
        long inactive = total - active;
        long deptCount = departmentRepository.count();

        long totalLeaves = allLeaves.size();
        long approved    = allLeaves.stream().filter(l -> LeaveStatus.APPROVED.equals(l.getLeaveStatus())).count();
        long pending     = allLeaves.stream().filter(l -> LeaveStatus.PENDING.equals(l.getLeaveStatus())).count();
        long rejected    = allLeaves.stream().filter(l -> LeaveStatus.REJECTED.equals(l.getLeaveStatus())).count();
        double approvalRate = totalLeaves > 0 ? Math.round((approved * 100.0) / totalLeaves) : 0.0;

        DoubleSummaryStatistics salaryStats = allEmployees.stream()
                .mapToDouble(Employee::getSalary)
                .summaryStatistics();

        double totalPayroll = allEmployees.stream()
                .filter(e -> EmployeeStatus.ACTIVE.equals(e.getStatus()))
                .mapToDouble(Employee::getSalary)
                .sum();

        return new ReportSummaryDTO(
                total, active, inactive, deptCount,
                totalLeaves, approved, pending, rejected, approvalRate,
                round(totalPayroll),
                round(salaryStats.getCount() > 0 ? salaryStats.getAverage() : 0),
                round(salaryStats.getCount() > 0 ? salaryStats.getMax()     : 0),
                round(salaryStats.getCount() > 0 ? salaryStats.getMin()     : 0)
        );
    }

    /** GET /report/leave-type-stats — Leave counts grouped by type */
    public List<LeaveTypeStatsDTO> getLeaveTypeStats() {
        return leaveRepository.findAll()
                .stream()
                .filter(l -> l.getLeaveType() != null)
                .collect(Collectors.groupingBy(l -> l.getLeaveType().name()))
                .entrySet()
                .stream()
                .map(e -> {
                    List<Leave> group = e.getValue();
                    long app = group.stream().filter(l -> LeaveStatus.APPROVED.equals(l.getLeaveStatus())).count();
                    long pen = group.stream().filter(l -> LeaveStatus.PENDING.equals(l.getLeaveStatus())).count();
                    long rej = group.stream().filter(l -> LeaveStatus.REJECTED.equals(l.getLeaveStatus())).count();
                    return new LeaveTypeStatsDTO(e.getKey(), group.size(), app, pen, rej);
                })
                .collect(Collectors.toList());
    }

    /** GET /report/salary-by-department — Salary analytics per department */
    public List<Map<String, Object>> getSalaryByDepartment() {
        return employeeRepository.findAll()
                .stream()
                .filter(e -> e.getDepartment() != null && EmployeeStatus.ACTIVE.equals(e.getStatus()))
                .collect(Collectors.groupingBy(e -> e.getDepartment().getName()))
                .entrySet()
                .stream()
                .map(entry -> {
                    DoubleSummaryStatistics stats = entry.getValue().stream()
                            .mapToDouble(Employee::getSalary).summaryStatistics();
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("department",  entry.getKey());
                    m.put("totalSalary", round(stats.getSum()));
                    m.put("avgSalary",   round(stats.getAverage()));
                    m.put("maxSalary",   round(stats.getMax()));
                    m.put("minSalary",   round(stats.getMin()));
                    m.put("headCount",   stats.getCount());
                    return m;
                })
                .sorted((a, b) -> Double.compare((Double) b.get("totalSalary"), (Double) a.get("totalSalary")))
                .collect(Collectors.toList());
    }

    /** GET /report/status-distribution — Employee ACTIVE/INACTIVE breakdown */
    public Map<String, Long> getStatusDistribution() {
        return employeeRepository.findAll()
                .stream()
                .collect(Collectors.groupingBy(
                        e -> e.getStatus() != null ? e.getStatus().name() : "UNKNOWN",
                        Collectors.counting()));
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
