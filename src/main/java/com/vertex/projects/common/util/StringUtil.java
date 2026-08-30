package com.vertex.projects.common.util;

import lombok.experimental.UtilityClass;

/**
 * Utility for string operations
 */
@UtilityClass
public class StringUtil {

    /**
     * Check if string is blank
     */
    public static boolean isBlank(String str) {
        return str == null || str.trim().isEmpty();
    }

    /**
     * Check if string is not blank
     */
    public static boolean isNotBlank(String str) {
        return !isBlank(str);
    }

    /**
     * Truncate string
     */
    public static String truncate(String str, int length) {
        if (str == null || str.length() <= length) {
            return str;
        }
        return str.substring(0, length) + "...";
    }

    /**
     * Capitalize string
     */
    public static String capitalize(String str) {
        if (isBlank(str)) {
            return str;
        }
        return str.substring(0, 1).toUpperCase() + str.substring(1).toLowerCase();
    }

    /**
     * Generate slug from string
     */
    public static String generateSlug(String str) {
        if (isBlank(str)) {
            return "";
        }
        return str.toLowerCase()
            .replaceAll("\\s+", "-")
            .replaceAll("[^a-z0-9-]", "")
            .replaceAll("-+", "-")
            .replaceAll("^-|-$", "");
    }

    /**
     * Sanitize for SQL
     */
    public static String sanitizeForSql(String str) {
        if (isBlank(str)) {
            return "";
        }
        return str.replaceAll("'", "''");
    }
}
