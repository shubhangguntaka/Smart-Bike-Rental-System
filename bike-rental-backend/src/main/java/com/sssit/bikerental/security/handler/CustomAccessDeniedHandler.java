package com.sssit.bikerental.security.handler;

import java.io.IOException;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import com.sssit.bikerental.common.response.ErrorResponse;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class CustomAccessDeniedHandler implements AccessDeniedHandler {

    @Override
    public void handle(
            HttpServletRequest request,
            HttpServletResponse response,
            AccessDeniedException accessDeniedException)
            throws IOException, ServletException {

        response.setContentType("application/json");
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);

        ErrorResponse errorResponse = ErrorResponse.builder()
                .status(HttpServletResponse.SC_FORBIDDEN)
                .error("Forbidden")
                .message(accessDeniedException.getMessage())
                .path(request.getRequestURI())
                .timestamp(System.currentTimeMillis())
                .build();

        new ObjectMapper().writeValue(response.getOutputStream(), errorResponse);
    }
}
