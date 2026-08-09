package com.sssit.bikerental.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.sssit.bikerental.security.handler.CustomAccessDeniedHandler;
import com.sssit.bikerental.security.jwt.JwtAuthenticationEntryPoint;
import com.sssit.bikerental.security.jwt.JwtFilter;
import com.sssit.bikerental.security.user.CustomUserDetailsService;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtFilter jwtFilter;
    private final JwtAuthenticationEntryPoint authenticationEntryPoint;
    private final CustomAccessDeniedHandler accessDeniedHandler;
    private final CustomUserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;

        public SecurityConfig(JwtFilter jwtFilter,
                                                  JwtAuthenticationEntryPoint authenticationEntryPoint,
                                                  CustomAccessDeniedHandler accessDeniedHandler,
                                                  CustomUserDetailsService userDetailsService,
                                                  PasswordEncoder passwordEncoder) {
                this.jwtFilter = jwtFilter;
                this.authenticationEntryPoint = authenticationEntryPoint;
                this.accessDeniedHandler = accessDeniedHandler;
                this.userDetailsService = userDetailsService;
                this.passwordEncoder = passwordEncoder;
        }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                .cors(Customizer.withDefaults())

                .httpBasic(Customizer.withDefaults())

                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler))

                .authenticationProvider(authenticationProvider())

                .authorizeHttpRequests(auth -> auth

                        // Public endpoints
                        .requestMatchers(
                                "/",
                                "/error",
                                "/api/auth/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**",
                                "/uploads/**"
                        ).permitAll()
                        .requestMatchers(
                                org.springframework.http.HttpMethod.GET,
                                "/api/bikes",
                                "/api/bikes/**"
                        ).permitAll()

                        // User profile/change-password endpoints accessible by authenticated users
                        .requestMatchers(
                                "/api/users/profile",
                                "/api/users/change-password",
                                "/api/users/profile-image"
                        ).hasAnyRole("CUSTOMER", "OWNER", "ADMIN")

                        // ADMIN
                        .requestMatchers(
                                "/api/admin/**",
                                "/api/users/**",
                                "/api/reports/**"
                        ).hasRole("ADMIN")

                        // OWNER
                        .requestMatchers(
                                "/api/owner/**",
                                "/api/owner/bikes/**",
                                "/api/owner/bookings/**"
                        ).hasRole("OWNER")

                        // CUSTOMER
                        .requestMatchers(
                        	    "/api/reviews/**",
                        	    "/api/notifications/**"
                        	).permitAll()

                        	.requestMatchers(
                        	    "/api/customer/**",
                        	    "/api/bookings/**",
                        	    "/api/cart/**",
                        	    "/api/profile/**"
                        	).hasRole("CUSTOMER")

                        // All other APIs require authentication
                        .anyRequest().authenticated()
                )

                .addFilterBefore(jwtFilter,
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}