package com.vertex.projects.dto.response;

import com.vertex.projects.model.auth.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Login response DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {
    
    private Long userId;
    private String name;
    private String email;
    private String token;
    private Role role;
    private String message;
}
