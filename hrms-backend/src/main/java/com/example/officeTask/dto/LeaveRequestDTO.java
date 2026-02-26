package com.example.officeTask.dto;

import java.time.LocalDate;

import com.example.officeTask.enums.LeaveType;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaveRequestDTO {
    
    private LocalDate  startDate;
    private LocalDate endDate;
    private LeaveType leaveType;
    private String reason;

}
