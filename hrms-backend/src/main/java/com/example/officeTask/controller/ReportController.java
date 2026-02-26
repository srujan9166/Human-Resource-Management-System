package com.example.officeTask.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.officeTask.service.ReportService;

@RestController
@RequestMapping("/report")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    /** GET /report/top-earn?limit=5 */
    @GetMapping("/top-earn")
    public ResponseEntity<?> topEarn(@RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(reportService.getTopEarners(limit));
    }

    /** GET /report/recent-join?months=6 */
    @GetMapping("/recent-join")
    public ResponseEntity<?> getRecentJoiners(@RequestParam(defaultValue = "6") int months) {
        return ResponseEntity.ok(reportService.getRecentJoiners(months));
    }

    /** GET /report/department-headcount */
    @GetMapping("/department-headcount")
    public ResponseEntity<?> getDepartmentHeadCount() {
        return ResponseEntity.ok(reportService.getDepartmentHeadCount());
    }

    /** GET /report/high-salary-departments?threshold=60000 */
    @GetMapping("/high-salary-departments")
    public ResponseEntity<?> getHighSalaryDepartments(@RequestParam double threshold) {
        return ResponseEntity.ok(reportService.getHighSalaryDepartments(threshold));
    }

    /** GET /report/salary-partition */
    @GetMapping("/salary-partition")
    public ResponseEntity<?> getSalaryPartition() {
        return ResponseEntity.ok(reportService.getSalaryPartition());
    }

    /** GET /report/summary — Full KPI summary for the Reports dashboard */
    @GetMapping("/summary")
    public ResponseEntity<?> getSummary() {
        return ResponseEntity.ok(reportService.getOverallSummary());
    }

    /** GET /report/leave-type-stats — Leave breakdown by type */
    @GetMapping("/leave-type-stats")
    public ResponseEntity<?> getLeaveTypeStats() {
        return ResponseEntity.ok(reportService.getLeaveTypeStats());
    }

    /** GET /report/salary-by-department — Salary analytics per dept */
    @GetMapping("/salary-by-department")
    public ResponseEntity<?> getSalaryByDepartment() {
        return ResponseEntity.ok(reportService.getSalaryByDepartment());
    }

    /** GET /report/status-distribution — Employee status breakdown */
    @GetMapping("/status-distribution")
    public ResponseEntity<?> getStatusDistribution() {
        return ResponseEntity.ok(reportService.getStatusDistribution());
    }
}
