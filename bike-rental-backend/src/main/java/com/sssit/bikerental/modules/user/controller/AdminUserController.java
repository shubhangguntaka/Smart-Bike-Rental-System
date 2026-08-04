package com.sssit.bikerental.modules.user.controller;

import com.sssit.bikerental.modules.user.dto.*;
import com.sssit.bikerental.modules.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<?> getAllUsers(){

        return ResponseEntity.ok(

                userService.getAllUsers()

        );

    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUser(

            @PathVariable Long id){

        return ResponseEntity.ok(

                userService.getUserById(id)

        );

    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(

            @PathVariable Long id,

            @Valid
            @RequestBody
            UpdateUserRequest request){

        return ResponseEntity.ok(

                userService.updateUser(id,request)

        );

    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(

            @PathVariable Long id){

        userService.deleteUser(id);

        return ResponseEntity.ok("User deleted successfully");

    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> changeStatus(

            @PathVariable Long id,

            @RequestParam Boolean enabled){

        return ResponseEntity.ok(

                userService.changeUserStatus(id,enabled)

        );

    }

}