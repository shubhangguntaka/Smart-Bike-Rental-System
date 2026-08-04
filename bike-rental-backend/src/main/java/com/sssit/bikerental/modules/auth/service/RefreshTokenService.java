package com.sssit.bikerental.modules.auth.service;

import java.util.Optional;

import com.sssit.bikerental.modules.auth.entity.RefreshToken;
import com.sssit.bikerental.modules.user.User;

public interface RefreshTokenService {

    RefreshToken createRefreshToken(User user);

    Optional<RefreshToken> findByToken(String token);

    RefreshToken verifyExpiration(RefreshToken token);

    void deleteByUser(User user);

    void revokeToken(String token);

    boolean isTokenValid(String token);

    void deleteToken(String token);

}