package com.sssit.bikerental.modules.user.service.impl;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
                                .orElseThrow(() -> new RuntimeException("User not found"));
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

                user.setFullName(request.getFullName());

                user.setPhoneNumber(request.getPhoneNumber());

                userRepository.save(user);

                return getCurrentUser();

        }

        @Override
        public void changePassword(
                        ChangePasswordRequest request) {

                User user = getLoggedInUser();

                if (!passwordEncoder.matches(
                                request.getOldPassword(),
                                user.getPassword())) {

                        throw new RuntimeException(
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

                                .orElseThrow(() -> new RuntimeException("User not found"));

                return map(user);

        }

        @Override
        public UserResponse updateUser(Long id,
                        UpdateUserRequest request) {

                User user = userRepository.findById(id)

                                .orElseThrow(() -> new RuntimeException("User not found"));

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

                                .orElseThrow(() -> new RuntimeException("User not found"));

                userRepository.delete(user);

        }

        @Override
        public UserResponse changeUserStatus(Long id,
                        Boolean enabled) {

                User user = userRepository.findById(id)

                                .orElseThrow(() -> new RuntimeException("User not found"));

                user.setEnabled(enabled);

                userRepository.save(user);

                return map(user);

        }

}
