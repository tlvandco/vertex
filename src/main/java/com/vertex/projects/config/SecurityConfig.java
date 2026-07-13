package com.vertex.projects.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

/**
 * Security Configuration for VERTEX Project Management System
 * 
 * @author VERTEX Development Team
 * @version 2.0.0
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * Password encoder bean
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * CORS configuration
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(false);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /**
     * Security filter chain configuration
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf
                // Disable CSRF for API endpoints
                .ignoringRequestMatchers("/api/**")
            )
            .authorizeHttpRequests(authz -> authz
                // Allow public access to auth endpoints
                .requestMatchers("/api/v2/auth/**").permitAll()
                // Allow public access to legacy static frontend compatibility endpoints
                .requestMatchers(
                    "/api/portfolio/**",
                    "/api/contact",
                    "/api/projects/**",
                    "/api/tasks/**",
                    "/api/task-attachments/**",
                    "/api/attachments/**",
                    "/api/users/**",
                    "/api/project-members/**",
                    "/api/milestones/**",
                    "/api/chat/**",
                    "/api/account/change-password",
                    "/api/auth/**",
                    "/api/admin/**",
                    "/api/api/**"
                ).permitAll()
                // Allow public access to static resources
                .requestMatchers("/", "/index.html", "/login.html", "/admin-dashboard.html", "/pm-dashboard.html", 
                    "/designer-dashboard.html", "/client-dashboard.html", "/css/**", "/js/**", "/images/**").permitAll()
                // Allow swagger and actuator
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/actuator/**").permitAll()
                // Everything else requires authentication
                .anyRequest().authenticated()
            )
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .formLogin(form -> form
                .loginPage("/login.html")
                .permitAll()
            )
            .logout(logout -> logout.permitAll());

        return http.build();
    }
}
