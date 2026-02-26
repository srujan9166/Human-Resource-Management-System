package com.example.officeTask.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.officeTask.dto.LeaveRequestDTO;
import com.example.officeTask.dto.LeaveResponseDTO;
import com.example.officeTask.dto.LeaveSummaryDTO;
import com.example.officeTask.service.LeaveService;

@RestController
@RequestMapping("/leaves")
public class LeaveController {

    private final LeaveService leaveService;

    public LeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    @PostMapping("/leaveRequest")
    public ResponseEntity<LeaveResponseDTO> createLeave(@RequestBody LeaveRequestDTO requestDTO) {
        LeaveResponseDTO created = leaveService.createLeave(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<LeaveResponseDTO> approveLeave(@PathVariable Long id) {
        return ResponseEntity.ok(leaveService.approveLeave(id));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<LeaveResponseDTO> rejectLeave(@PathVariable Long id) {
        return ResponseEntity.ok(leaveService.rejectLeave(id));
    }

    @GetMapping("/allLeaves")
    public ResponseEntity<List<LeaveResponseDTO>> getAllLeaves() {
        return ResponseEntity.ok(leaveService.getAllLeaves());
    }

   
   @GetMapping("/leaveStatus")
    public ResponseEntity<List<LeaveResponseDTO>> leaveStatus() {
        return ResponseEntity.ok(leaveService.leaveStatus());
    }


    @GetMapping("/allApproved")
    public ResponseEntity<List<LeaveResponseDTO>> allApproved() {
        return ResponseEntity.ok(leaveService.allApproved());
    }

    @GetMapping("/active-today")
    public ResponseEntity<List<LeaveResponseDTO>> todayLeaves() {
        return ResponseEntity.ok(leaveService.todayLeaves());
    }

    @GetMapping("/{id}/leaves/summary")
    public ResponseEntity<LeaveSummaryDTO> note(@PathVariable Long id) {
        return ResponseEntity.ok(leaveService.note(id));
    }
}
