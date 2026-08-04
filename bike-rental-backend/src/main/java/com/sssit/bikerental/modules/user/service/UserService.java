package com.sssit.bikerental.modules.user.service;

import java.util.List;

import com.sssit.bikerental.modules.user.dto.*;

public interface UserService {

        UserProfileResponse getCurrentUser();

        UserProfileResponse updateProfile(
                        UpdateProfileRequest request);

        void changePassword(
                        ChangePasswordRequest request);

        List<UserResponse> getAllUsers();

        UserResponse getUserById(Long id);

        UserResponse updateUser(Long id,
                        UpdateUserRequest request);

        void deleteUser(Long id);

        UserResponse changeUserStatus(Long id,
                        Boolean enabled);

}