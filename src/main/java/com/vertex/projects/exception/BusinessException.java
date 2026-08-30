package com.vertex.projects.exception;

/**
 * Exception thrown when business logic validation fails
 */
public class BusinessException extends VertexException {
    
    private static final long serialVersionUID = 1L;
    
    public BusinessException(String message) {
        super(message, "BUSINESS_ERROR", 400);
    }

    public BusinessException(String message, String errorCode) {
        super(message, errorCode, 400);
    }

    public BusinessException(String message, int statusCode) {
        super(message, "BUSINESS_ERROR", statusCode);
    }
}
