package com.example.officeTask.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LeaveTypeStatsDTO {
    private String leaveType;
    private long count;
    private long approved;
    private long pending;
    private long rejected;
}
