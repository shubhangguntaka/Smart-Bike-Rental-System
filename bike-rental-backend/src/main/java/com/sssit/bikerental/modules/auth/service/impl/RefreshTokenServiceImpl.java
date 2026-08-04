package com.sssit.bikerental.modules.auth.service.impl;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sssit.bikerental.common.exception.RefreshTokenException;
import com.sssit.bikerental.modules.auth.entity.RefreshToken;
import com.sssit.bikerental.modules.auth.repository.RefreshTokenRepository;
import com.sssit.bikerental.modules.auth.service.RefreshTokenService;
import com.sssit.bikerental.modules.user.User;

@Service
@Transactional
public class RefreshTokenServiceImpl implements RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${jwt.refresh-expiration}")
    private long refreshTokenDuration;

    public RefreshTokenServiceImpl(
            RefreshTokenRepository refreshTokenRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
    }

    @Override
    public RefreshToken createRefreshToken(User user) {

        refreshTokenRepository.deleteByUser(user);

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiryDate(
                        LocalDateTime.now()
                                .plusSeconds(refreshTokenDuration / 1000))
                .revoked(false)
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    @Override
    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    @Override
    public RefreshToken verifyExpiration(RefreshToken token) {

        if (token.getExpiryDate().isBefore(LocalDateTime.now())) {

            refreshTokenRepository.delete(token);

            throw new RefreshTokenException("Refresh token has expired");
        }

        return token;
    }

    @Override
    public void deleteByUser(User user) {
        refreshTokenRepository.deleteByUser(user);
    }

    @Override
    public void revokeToken(String token) {

        refreshTokenRepository.findByToken(token)
                .ifPresent(refresh -> {

                    refresh.setRevoked(true);

                    refreshTokenRepository.save(refresh);

                });

    }

    @Override
    public boolean isTokenValid(String token) {

        Optional<RefreshToken> optional = refreshTokenRepository.findByToken(token);

        if (optional.isEmpty())
            return false;

        RefreshToken refreshToken = optional.get();

        if (refreshToken.getRevoked())
            return false;

        return refreshToken.getExpiryDate()
                .isAfter(LocalDateTime.now());

    }

    @Override
    public void deleteToken(String token) {

        refreshTokenRepository.findByToken(token)
                .ifPresent(refreshTokenRepository::delete);

    }

}