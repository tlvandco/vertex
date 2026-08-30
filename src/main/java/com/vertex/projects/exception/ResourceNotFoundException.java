package com.vertex.projects.exception;

/**
 * Exception thrown when a requested resource is not found
 */
public class ResourceNotFoundException extends VertexException {
    
    private static final long serialVersionUID = 1L;
    
    public ResourceNotFoundException(String resource, Long id) {
        super(resource + " not found with ID: " + id, "RESOURCE_NOT_FOUND", 404);
    }

    public ResourceNotFoundException(String message) {
        super(message, "RESOURCE_NOT_FOUND", 404);
    }

    public ResourceNotFoundException(String message, String errorCode) {
        super(message, errorCode, 404);
    }
}
