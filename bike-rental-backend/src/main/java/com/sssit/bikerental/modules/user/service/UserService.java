package com.sssit.bikerental.modules.user.service;

import java.util.List;

import com.sssit.bikerental.modules.user.dto.*;

public interface UserService {

        UserProfileResponse getCurrentUser();

        UserProfileResponse updateProfile(
                        UpdateProfileRequest request);

        UserProfileResponse uploadProfileImage(org.springframework.web.multipart.MultipartFile file);

        void changePassword(
                        ChangePasswordRequest request);

        List<UserResponse> getAllUsers();

        UserResponse getUserById(Long id);

        UserResponse updateUser(Long id,
                        UpdateUserRequest request);

        void deleteUser(Long id);

        UserResponse changeUserStatus(Long id,
                        Boolean enabled);

        UserResponse lockUser(Long id,
                        Boolean locked);

        void deleteCurrentAccount();

}