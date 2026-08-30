package com.vertex.projects.exception;

/**
 * Base exception class for VERTEX application
 * All custom exceptions should extend this class
 */
public class VertexException extends RuntimeException {
    
    private static final long serialVersionUID = 1L;
    
    private String errorCode;
    private int statusCode;

    public VertexException(String message) {
        super(message);
        this.statusCode = 500;
    }

    public VertexException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
        this.statusCode = 500;
    }

    public VertexException(String message, int statusCode) {
        super(message);
        this.statusCode = statusCode;
    }

    public VertexException(String message, String errorCode, int statusCode) {
        super(message);
        this.errorCode = errorCode;
        this.statusCode = statusCode;
    }

    public VertexException(String message, Throwable cause) {
        super(message, cause);
        this.statusCode = 500;
    }

    public VertexException(String message, String errorCode, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
        this.statusCode = 500;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public int getStatusCode() {
        return statusCode;
    }

    public void setStatusCode(int statusCode) {
        this.statusCode = statusCode;
    }
}
