package com.example.officeTask.service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.example.officeTask.dto.LeaveRequestDTO;
import com.example.officeTask.dto.LeaveResponseDTO;
import com.example.officeTask.dto.LeaveSummaryDTO;
import com.example.officeTask.enums.LeaveStatus;
import com.example.officeTask.mapper.LeaveMapper;
import com.example.officeTask.model.Employee;
import com.example.officeTask.model.Leave;
import com.example.officeTask.model.User;
import com.example.officeTask.repository.EmployeeRepository;
import com.example.officeTask.repository.LeaveRepository;
@Service
public class LeaveService {

    private final LeaveRepository leaveRepository;
    private final EmployeeRepository employeeRepository;
  

    public Employee getCurrentEmployee(){
      Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
      User user = (User)authentication.getPrincipal();
      Employee employee = employeeRepository
          .findByEmail(user.getUsername())
          .orElseThrow(()-> new RuntimeException("Employee Not Found"));

          return employee;
    }

    public LeaveService(LeaveRepository leaveRepository, EmployeeRepository employeeRepository){
        this.leaveRepository= leaveRepository;
        this.employeeRepository = employeeRepository;
    }

    public LeaveResponseDTO createLeave(LeaveRequestDTO requestDTO) {
      if(requestDTO.getStartDate().isAfter(requestDTO.getEndDate())){
        throw new RuntimeException("Start date must not be after end date");
      }
      Employee employee = getCurrentEmployee();
       Leave leave = LeaveMapper.toEntity(requestDTO, employee);
      return  LeaveMapper.toResponse(leaveRepository.save(leave));

    }


   public LeaveResponseDTO approveLeave(Long id){
   Leave leave = leaveRepository.findById(id).orElseThrow(()-> new RuntimeException("Leave ID is Not Found"));
   leave.setLeaveStatus(LeaveStatus.APPROVED);
   
   return LeaveMapper.toResponse(leaveRepository.save(leave));
   }

   public LeaveResponseDTO rejectLeave(Long id) {
    Leave leave = leaveRepository.findById(id).orElseThrow(()-> new RuntimeException("Leave ID is Not Found"));
    leave.setLeaveStatus(LeaveStatus.REJECTED);
    return LeaveMapper.toResponse(leaveRepository.save(leave));
   }

   public List<LeaveResponseDTO> getAllLeaves() {
    return leaveRepository.findAll()
                           .stream()
                           .map(leave -> LeaveMapper.toResponse(leave))
                           .toList();
   }

  public List<LeaveResponseDTO> leaveStatus() {
        Employee employee = getCurrentEmployee();
        return leaveRepository.findByEmployee_EmployeeId(employee.getEmployeeId())
                .stream()
                .map(LeaveMapper::toResponse)
                .toList();
    }

   public List<LeaveResponseDTO> allApproved() {
    return leaveRepository.findAll().stream()
    .filter(leave -> leave.getLeaveStatus().equals(LeaveStatus.APPROVED))
    .map(leave -> LeaveMapper.toResponse(leave))
    .toList();
   }

   public List<LeaveResponseDTO> todayLeaves() {
    return leaveRepository.findAll().stream()
      .filter(leave -> !(leave.getStartDate().isAfter(LocalDate.now()))
                && !leave.getEndDate().isBefore(LocalDate.now()))
      .map(leave -> LeaveMapper.toResponse(leave))
      .toList();
   }

   public LeaveSummaryDTO note(Long id) {
  
      List<Leave> leavesPerEmployee = leaveRepository.findByEmployee_EmployeeId(id);

      LeaveSummaryDTO leaveSummaryDTO = new LeaveSummaryDTO();

      leaveSummaryDTO.setEmployeeId(id);
      leaveSummaryDTO.setTotalLeaves(leavesPerEmployee.size());
      leaveSummaryDTO.setApprovedLeaves(
                      leavesPerEmployee.stream()
                      .filter(l -> l.getLeaveStatus().equals(LeaveStatus.APPROVED))
                      .count()
                    );
      leaveSummaryDTO.setRejectedLeaves(leavesPerEmployee
                      .stream()
                      .filter(l -> l.getLeaveStatus().equals(LeaveStatus.REJECTED))
                      .count()
                    );    
      leaveSummaryDTO.setPendingLeaves(leavesPerEmployee
                      .stream()
                      .filter(l->l.getLeaveStatus().equals(LeaveStatus.PENDING))
                      .count()
                    );        
      leaveSummaryDTO.setTotalLeaveDays(leavesPerEmployee
                      .stream()
                      .mapToLong(
                          l-> ChronoUnit.DAYS.between(l.getStartDate(),l.getEndDate())+1
                      )
                      .sum()
                     );    
                     
                     return leaveSummaryDTO;

      
      
   }

  //  public Long workDays() {
    
  //  }





}
