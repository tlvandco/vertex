# Stage 1: Build Stage
FROM gradle:8.14-jdk24 AS builder

WORKDIR /app

# Copy gradle configuration files
COPY build.gradle .
COPY settings.gradle .
COPY gradlew .
COPY gradlew.bat .
COPY gradle/ gradle/

# Copy source code
COPY src/ src/

# Build the application
RUN gradle build -x test --no-daemon

# Stage 2: Runtime Stage
FROM eclipse-temurin:24-jdk-alpine

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy the built JAR from the builder stage
COPY --from=builder /app/build/libs/vertex-projects-2.0.0.jar /app/vertex-projects.jar

# Create logs directory
RUN mkdir -p /app/logs

# Expose the default port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/api/v1/health || exit 1

# Set JVM options for optimal performance
ENV JAVA_OPTS="-Xmx512m -Xms256m -XX:+UseG1GC -XX:MaxGCPauseMillis=200"

# Run the application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/vertex-projects.jar"]

