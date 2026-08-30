package com.vertex.projects.config;

import com.vertex.projects.common.dto.ApiResponse;
import com.vertex.projects.exception.BusinessException;
import com.vertex.projects.exception.ResourceNotFoundException;
import com.vertex.projects.exception.VertexException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.util.ArrayList;
import java.util.List;

/**
 * Global exception handler for all VERTEX application exceptions
 * Provides consistent error responses across all endpoints
 * 
 * @author VERTEX Development Team
 * @version 2.0.0
 */
@Slf4j
@ControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    /**
     * Handle VERTEX custom exceptions
     */
    @ExceptionHandler(VertexException.class)
    public ResponseEntity<ApiResponse<?>> handleVertexException(
            VertexException ex,
            WebRequest request) {
        
        log.error("VertexException occurred: {}", ex.getMessage(), ex);
        
        ApiResponse<?> response = ApiResponse.error(
                ex.getMessage(),
                ex.getErrorCode() != null ? ex.getErrorCode() : "VERTEX_ERROR",
                ex.getStatusCode()
        );
        
        return new ResponseEntity<>(response, HttpStatus.valueOf(ex.getStatusCode()));
    }

    /**
     * Handle ResourceNotFoundException
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<?>> handleResourceNotFoundException(
            ResourceNotFoundException ex,
            WebRequest request) {
        
        log.warn("ResourceNotFoundException: {}", ex.getMessage());
        
        ApiResponse<?> response = ApiResponse.error(
                ex.getMessage(),
                ex.getErrorCode() != null ? ex.getErrorCode() : "NOT_FOUND",
                404
        );
        
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    /**
     * Handle BusinessException
     */
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<?>> handleBusinessException(
            BusinessException ex,
            WebRequest request) {
        
        log.error("BusinessException: {}", ex.getMessage());
        
        ApiResponse<?> response = ApiResponse.error(
                ex.getMessage(),
                ex.getErrorCode() != null ? ex.getErrorCode() : "BUSINESS_ERROR",
                ex.getStatusCode()
        );
        
        return new ResponseEntity<>(response, HttpStatus.valueOf(ex.getStatusCode()));
    }

    /**
     * Handle validation errors
     */
    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex,
            org.springframework.http.HttpHeaders headers,
            org.springframework.http.HttpStatusCode status,
            WebRequest request) {
        
        List<String> errors = new ArrayList<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.add(fieldName + ": " + errorMessage);
        });
        
        log.warn("Validation failed: {}", errors);
        
        ApiResponse<?> response = ApiResponse.error(
                "Validation failed",
                errors,
                400
        );
        
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle generic exceptions
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> handleGlobalException(
            Exception ex,
            WebRequest request) {
        
        log.error("Unexpected exception occurred", ex);
        
        ApiResponse<?> response = ApiResponse.error(
                "An unexpected error occurred: " + ex.getMessage(),
                "INTERNAL_ERROR",
                500
        );
        
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Handle illegal argument exceptions
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<?>> handleIllegalArgumentException(
            IllegalArgumentException ex,
            WebRequest request) {
        
        log.error("IllegalArgumentException: {}", ex.getMessage());
        
        ApiResponse<?> response = ApiResponse.error(
                ex.getMessage(),
                "INVALID_ARGUMENT",
                400
        );
        
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }
}
