package com.example.officeTask.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaveSummaryDTO {

    private Long employeeId;
    private long totalLeaves;
    private long approvedLeaves;
    private long rejectedLeaves;
    private long pendingLeaves;
    private long totalLeaveDays;
}
