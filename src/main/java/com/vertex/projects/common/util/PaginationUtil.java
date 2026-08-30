package com.vertex.projects.common.util;

import lombok.experimental.UtilityClass;
import java.util.ArrayList;
import java.util.List;

/**
 * Pagination utility for handling page calculations
 */
@UtilityClass
public class PaginationUtil {

    public static <T> Page<T> createPage(List<T> items, int page, int size, long total) {
        int start = page * size;
        int end = Math.min(start + size, items.size());
        List<T> pageContent = items.subList(start, end);
        
        return Page.<T>builder()
            .content(pageContent)
            .pageNumber(page)
            .pageSize(size)
            .totalElements(total)
            .totalPages((int) Math.ceil((double) total / size))
            .isLast(end >= items.size())
            .hasNext(end < items.size())
            .build();
    }

    /**
     * Simple page wrapper
     */
    public static class Page<T> {
        public List<T> content;
        public int pageNumber;
        public int pageSize;
        public long totalElements;
        public int totalPages;
        public boolean isLast;
        public boolean hasNext;

        public Page(List<T> content, int pageNumber, int pageSize, long totalElements, int totalPages, boolean isLast, boolean hasNext) {
            this.content = content;
            this.pageNumber = pageNumber;
            this.pageSize = pageSize;
            this.totalElements = totalElements;
            this.totalPages = totalPages;
            this.isLast = isLast;
            this.hasNext = hasNext;
        }

        public static <T> PageBuilder<T> builder() {
            return new PageBuilder<>();
        }
    }

    public static class PageBuilder<T> {
        private List<T> content;
        private int pageNumber;
        private int pageSize;
        private long totalElements;
        private int totalPages;
        private boolean isLast;
        private boolean hasNext;

        public PageBuilder<T> content(List<T> content) {
            this.content = content;
            return this;
        }

        public PageBuilder<T> pageNumber(int pageNumber) {
            this.pageNumber = pageNumber;
            return this;
        }

        public PageBuilder<T> pageSize(int pageSize) {
            this.pageSize = pageSize;
            return this;
        }

        public PageBuilder<T> totalElements(long totalElements) {
            this.totalElements = totalElements;
            return this;
        }

        public PageBuilder<T> totalPages(int totalPages) {
            this.totalPages = totalPages;
            return this;
        }

        public PageBuilder<T> isLast(boolean isLast) {
            this.isLast = isLast;
            return this;
        }

        public PageBuilder<T> hasNext(boolean hasNext) {
            this.hasNext = hasNext;
            return this;
        }

        public Page<T> build() {
            return new Page<>(content, pageNumber, pageSize, totalElements, totalPages, isLast, hasNext);
        }
    }
}
