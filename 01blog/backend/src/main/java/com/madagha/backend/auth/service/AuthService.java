package com.madagha.backend.auth.service;

import com.madagha.backend.auth.dto.AuthResponse;
import com.madagha.backend.auth.dto.LoginRequest;
import com.madagha.backend.auth.dto.RegisterRequest;
import com.madagha.backend.user.entity.Role;
import com.madagha.backend.user.entity.User;
import com.madagha.backend.user.entity.UserStatus;
import com.madagha.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtService jwtService;
        private final AuthenticationManager authenticationManager;

        public AuthResponse register(RegisterRequest request) {
                if (userRepository.existsByUsername(request.getUsername())) {
                        throw new RuntimeException("Username already exists");
                }
                if (userRepository.existsByEmail(request.getEmail())) {
                        throw new RuntimeException("Email already exists");
                }

                User user = User.builder()
                                .username(request.getUsername())
                                .email(request.getEmail())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .role(Role.USER)
                                .status(UserStatus.ACTIVE)
                                .build();

                userRepository.save(user);

                String jwtToken = jwtService.generateToken(user);

                return AuthResponse.builder()
                                .id(user.getId().toString())
                                .token(jwtToken)
                                .username(user.getUsername())
                                .email(user.getEmail())
                                .role(user.getRole().name())
                                .build();
        }

        public AuthResponse login(LoginRequest request) {
                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getUsername(),
                                                request.getPassword()));

                User user = userRepository.findByUsername(request.getUsername())
                                .orElseThrow(() -> new RuntimeException("User not found"));

                String jwtToken = jwtService.generateToken(user);

                return AuthResponse.builder()
                                .id(user.getId().toString())
                                .token(jwtToken)
                                .username(user.getUsername())
                                .email(user.getEmail())
                                .role(user.getRole().name())
                                .build();
        }
}
