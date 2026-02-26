package com.example.officeTask.mapper;

import com.example.officeTask.dto.LeaveRequestDTO;
import com.example.officeTask.dto.LeaveResponseDTO;
import com.example.officeTask.enums.LeaveStatus;
import com.example.officeTask.model.Employee;
import com.example.officeTask.model.Leave;

public class LeaveMapper {

    public static Leave toEntity(LeaveRequestDTO requestDTO , Employee employee){
       
        Leave leave = new Leave();
        leave.setEmployee(employee);
        leave.setStartDate(requestDTO.getStartDate());
        leave.setEndDate(requestDTO.getEndDate());
        leave.setLeaveStatus(LeaveStatus.PENDING);
        leave.setLeaveType(requestDTO.getLeaveType());
        leave.setReason(requestDTO.getReason());

        return leave;

    }

    public static LeaveResponseDTO toResponse(Leave leave){
         LeaveResponseDTO response = new LeaveResponseDTO();
        response.setId(leave.getLeaveId());
        response.setEmployeeId(leave.getEmployee().getEmployeeId());
        response.setStartDate(leave.getStartDate());
        response.setEndDate(leave.getEndDate());
        response.setLeaveStatus(leave.getLeaveStatus());
        return response;
    }

}
