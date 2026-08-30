package com.vertex.projects.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * JWT Utility for token generation and validation
 * 
 * @author VERTEX Development Team
 * @version 2.0.0
 */
@Component
@Slf4j
public class JwtUtil {

    @Value("${jwt.secret:VERTEX-ENTERPRISE-SECRET-KEY-FOR-JWT-TOKEN-OPERATIONS-MIN-512-BITS-64-BYTES-LENGTH-REQUIRED-FOR-HS512-ALGORITHM}")
    private String jwtSecret;

    @Value("${jwt.expiration:86400000}") // 24 hours in milliseconds
    private long jwtExpiration;

    /**
     * Generate JWT token for user
     * 
     * @param userId User ID
     * @param email User email
     * @param role User role
     * @return JWT token
     */
    public String generateToken(Long userId, String email, String role) {
        try {
            // Validate inputs
            if (email == null || email.isEmpty()) {
                throw new IllegalArgumentException("Email cannot be null or empty");
            }
            if (role == null || role.isEmpty()) {
                throw new IllegalArgumentException("Role cannot be null or empty");
            }
            
            Map<String, Object> claims = new HashMap<>();
            claims.put("userId", userId);
            claims.put("email", email);
            claims.put("role", role);
            
            Date now = new Date();
            Date expiryDate = new Date(now.getTime() + jwtExpiration);
            
            // Create key with proper 64-byte (512-bit) secret for HS512
            byte[] decodedKey = jwtSecret.getBytes(StandardCharsets.UTF_8);
            
            // Ensure the key is at least 512 bits (64 bytes) for HS512
            if (decodedKey.length < 64) {
                log.warn("JWT secret is {} bytes, which is less than the recommended 64 bytes for HS512", decodedKey.length);
                throw new IllegalStateException(
                    "JWT secret must be at least 64 bytes (512 bits) for HS512 algorithm. Current: " + 
                    decodedKey.length + " bytes"
                );
            }
            
            SecretKey key = Keys.hmacShaKeyFor(decodedKey);
            
            String token = Jwts.builder()
                    .setClaims(claims)
                    .setSubject(email)
                    .setIssuedAt(now)
                    .setExpiration(expiryDate)
                    .signWith(key, SignatureAlgorithm.HS512)
                    .compact();
            
            log.info("JWT token generated successfully for user: {}", email);
            return token;
        } catch (IllegalArgumentException e) {
            log.error("Invalid argument while generating JWT token: {}", e.getMessage());
            throw e;
        } catch (IllegalStateException e) {
            log.error("JWT configuration error: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error generating JWT token", e);
            throw new RuntimeException("Error generating JWT token: " + e.getMessage(), e);
        }
    }

    /**
     * Get user ID from token
     * 
     * @param token JWT token
     * @return User ID
     */
    public Long getUserIdFromToken(String token) {
        try {
            Claims claims = getClaimsFromToken(token);
            Object userId = claims.get("userId");
            if (userId instanceof Number) {
                return ((Number) userId).longValue();
            } else if (userId instanceof String) {
                return Long.parseLong((String) userId);
            }
            return null;
        } catch (Exception e) {
            log.error("Error extracting userId from token", e);
            return null;
        }
    }

    /**
     * Get email from token
     * 
     * @param token JWT token
     * @return Email
     */
    public String getEmailFromToken(String token) {
        try {
            return getClaimsFromToken(token).getSubject();
        } catch (Exception e) {
            log.error("Error extracting email from token", e);
            return null;
        }
    }

    /**
     * Get role from token
     * 
     * @param token JWT token
     * @return Role
     */
    public String getRoleFromToken(String token) {
        try {
            return (String) getClaimsFromToken(token).get("role");
        } catch (Exception e) {
            log.error("Error extracting role from token", e);
            return null;
        }
    }

    /**
     * Validate JWT token
     * 
     * @param token JWT token
     * @return true if valid, false otherwise
     */
    public boolean validateToken(String token) {
        try {
            if (token == null || token.isEmpty()) {
                return false;
            }
            
            // Remove "Bearer " prefix if present
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            
            getClaimsFromToken(token);
            return true;
        } catch (Exception e) {
            log.error("JWT validation failed", e);
            return false;
        }
    }

    /**
     * Get all claims from token
     * 
     * @param token JWT token
     * @return Claims
     */
    private Claims getClaimsFromToken(String token) {
        try {
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            
            SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
            
            return Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (Exception e) {
            log.error("Error parsing JWT token", e);
            throw new RuntimeException("Invalid JWT token", e);
        }
    }
}
