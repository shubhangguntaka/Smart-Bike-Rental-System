package com.sssit.bikerental.modules.user.service.impl;

import java.util.List;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sssit.bikerental.common.exception.ResourceNotFoundException;
import com.sssit.bikerental.common.exception.FileStorageException;
import com.sssit.bikerental.common.exception.ValidationException;
import com.sssit.bikerental.modules.user.User;
import com.sssit.bikerental.modules.user.dto.ChangePasswordRequest;
import com.sssit.bikerental.modules.user.dto.UpdateProfileRequest;
import com.sssit.bikerental.modules.user.dto.UpdateUserRequest;
import com.sssit.bikerental.modules.user.dto.UserProfileResponse;
import com.sssit.bikerental.modules.user.dto.UserResponse;
import com.sssit.bikerental.modules.user.repository.UserRepository;
import com.sssit.bikerental.modules.user.service.UserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

        private final UserRepository userRepository;

        private final PasswordEncoder passwordEncoder;

        private User getLoggedInUser() {
                Authentication authentication = SecurityContextHolder
                                .getContext()
                                .getAuthentication();

                String email = authentication.getName();

                return userRepository.findByEmail(email)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        }

        @Override
        public UserProfileResponse getCurrentUser() {

                User user = getLoggedInUser();

                return UserProfileResponse.builder()
                                .id(user.getId())
                                .fullName(user.getFullName())
                                .email(user.getEmail())
                                .phoneNumber(user.getPhoneNumber())
                                .role(user.getRole().name())
                                .enabled(user.getEnabled())
                                .profileImage(user.getProfileImage())
                                .build();

        }

        @Override
        public UserProfileResponse updateProfile(
                        UpdateProfileRequest request) {

                User user = getLoggedInUser();

                if (request.getEmail() != null && !request.getEmail().equalsIgnoreCase(user.getEmail())) {
                        if (userRepository.existsByEmail(request.getEmail())) {
                                throw new IllegalArgumentException("Email is already in use by another account.");
                        }
                        user.setEmail(request.getEmail().toLowerCase());
                }

                if (request.getPhoneNumber() != null && !request.getPhoneNumber().equals(user.getPhoneNumber())) {
                        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
                                throw new IllegalArgumentException("Phone number is already in use by another account.");
                        }
                        user.setPhoneNumber(request.getPhoneNumber());
                }

                user.setFullName(request.getFullName());

                userRepository.save(user);

                return getCurrentUser();

        }

        @Override
        public UserProfileResponse uploadProfileImage(MultipartFile file) {
                User user = getLoggedInUser();
                if (file == null || file.isEmpty()) {
                        throw new IllegalArgumentException("File cannot be empty.");
                }

                try {
                        String uploadDir = "uploads/profile-images/";
                        Files.createDirectories(Paths.get(uploadDir));
                        
                        String originalName = file.getOriginalFilename();
                        String extension = "";
                        if (originalName != null && originalName.contains(".")) {
                                extension = originalName.substring(originalName.lastIndexOf("."));
                        }
                        String fileName = "avatar_" + user.getId() + "_" + System.currentTimeMillis() + extension;
                        Path path = Paths.get(uploadDir + fileName);

                        Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);

                        user.setProfileImage("/uploads/profile-images/" + fileName);
                        userRepository.save(user);

                        return getCurrentUser();
                } catch (Exception e) {
                        throw new FileStorageException("Failed to upload profile image: " + e.getMessage(), e);
                }
        }

        @Override
        public void changePassword(
                        ChangePasswordRequest request) {

                User user = getLoggedInUser();

                if (!passwordEncoder.matches(
                                request.getOldPassword(),
                                user.getPassword())) {

                        throw new ValidationException(
                                        "Old password is incorrect");

                }

                user.setPassword(

                                passwordEncoder.encode(
                                                request.getNewPassword())

                );

                userRepository.save(user);

        }

        private UserResponse map(User user) {

                return UserResponse.builder()
                                .id(user.getId())
                                .fullName(user.getFullName())
                                .email(user.getEmail())
                                .phoneNumber(user.getPhoneNumber())
                                .role(user.getRole().name())
                                .enabled(user.getEnabled())
                                .profileImage(user.getProfileImage())
                                .build();

        }

        @Override
        public List<UserResponse> getAllUsers() {

                return userRepository.findAll()

                                .stream()

                                .map(this::map)

                                .toList();

        }

        @Override
        public UserResponse getUserById(Long id) {

                User user = userRepository.findById(id)

                                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

                return map(user);

        }

        @Override
        public UserResponse updateUser(Long id,
                        UpdateUserRequest request) {

                User user = userRepository.findById(id)

                                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

                user.setFullName(request.getFullName());

                user.setPhoneNumber(request.getPhoneNumber());

                if (request.getEnabled() != null) {

                        user.setEnabled(request.getEnabled());

                }

                userRepository.save(user);

                return map(user);

        }

        @Override
        public void deleteUser(Long id) {

                User user = userRepository.findById(id)

                                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

                userRepository.delete(user);

        }

        @Override
        public UserResponse changeUserStatus(Long id,
                        Boolean enabled) {

                User user = userRepository.findById(id)

                                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

                user.setEnabled(enabled);

                userRepository.save(user);

                return map(user);

        }

        @Override
        public UserResponse lockUser(Long id, Boolean locked) {

                User user = userRepository.findById(id)

                                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

                user.setAccountNonLocked(!Boolean.TRUE.equals(locked));

                userRepository.save(user);

                return map(user);

        }

}
