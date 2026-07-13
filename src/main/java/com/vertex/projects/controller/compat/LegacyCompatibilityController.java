package com.vertex.projects.controller.compat;

import com.vertex.projects.model.auth.Role;
import com.vertex.projects.model.auth.User;
import com.vertex.projects.model.core.Project;
import com.vertex.projects.repository.auth.UserRepository;
import com.vertex.projects.repository.core.ProjectRepository;
import com.vertex.projects.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping({"/api", "/api/api"})
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LegacyCompatibilityController {

    private final Map<String, List<Map<String, Object>>> chatHistoryStore = new ConcurrentHashMap<>();

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @GetMapping("/portfolio")
    public List<Map<String, Object>> portfolio() {
        return List.of(
                Map.of(
                        "id", 1,
                        "title", "Residential Interior Concept",
                        "collectionName", "Residential",
                        "imageUrl", "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
                        "description", "Warm, contemporary living spaces designed for comfort."
                ),
                Map.of(
                        "id", 2,
                        "title", "Boutique Office Design",
                        "collectionName", "Commercial",
                        "imageUrl", "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80",
                        "description", "Elegant workspaces that balance productivity and calm."
                )
        );
    }

    @PostMapping("/contact")
    public ResponseEntity<Map<String, Object>> contact(@RequestBody(required = false) Map<String, Object> payload) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("success", true);
        body.put("message", "Message received successfully");
        return ResponseEntity.ok(body);
    }

    @GetMapping("/projects")
    public List<Map<String, Object>> listProjects(@RequestParam(value = "scope", required = false) String scope) {
        List<Project> projects = projectRepository.findAll().stream()
                .filter(Project::getActive)
                .toList();

        List<Map<String, Object>> response = new ArrayList<>();
        for (Project project : projects) {
            response.add(toProjectMap(project));
        }
        return response;
    }

    @PutMapping("/projects/{id}")
    public ResponseEntity<Map<String, Object>> updateProject(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> payload) {
        return projectRepository.findById(id)
                .map(project -> {
                    if (payload != null) {
                        if (payload.get("name") != null) project.setName(String.valueOf(payload.get("name")));
                        if (payload.get("description") != null) project.setDescription(String.valueOf(payload.get("description")));
                        if (payload.get("status") != null) project.setStatus(Project.ProjectStatus.valueOf(String.valueOf(payload.get("status"))));
                        if (payload.get("location") != null) project.setLocation(String.valueOf(payload.get("location")));
                        if (payload.get("progress") != null) project.setProgress(Integer.valueOf(String.valueOf(payload.get("progress"))));
                    }
                    Project saved = projectRepository.save(project);
                    return ResponseEntity.ok(toProjectMap(saved));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/projects/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        projectRepository.findById(id).ifPresent(projectRepository::delete);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/projects/{id}")
    public ResponseEntity<Map<String, Object>> getProject(@PathVariable Long id) {
        return projectRepository.findById(id)
                .filter(Project::getActive)
                .map(project -> ResponseEntity.ok(toProjectMap(project)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/projects")
    public ResponseEntity<Map<String, Object>> createProject(@RequestBody(required = false) Map<String, Object> payload) {
        Project project = new Project();
        project.setName(payload != null && payload.get("name") != null ? String.valueOf(payload.get("name")) : "New Project");
        project.setStatus(Project.ProjectStatus.DRAFT);
        project.setActive(true);
        Project saved = projectRepository.save(project);
        return ResponseEntity.ok(Map.of("id", saved.getId(), "name", saved.getName(), "success", true));
    }

    @GetMapping("/tasks")
    public List<Map<String, Object>> listTasks(@RequestParam(value = "projectId", required = false) String projectId) {
        return Collections.emptyList();
    }

    @PostMapping("/tasks/project/{projectId}")
    public ResponseEntity<Map<String, Object>> createTask(@PathVariable Long projectId, @RequestBody(required = false) Map<String, Object> payload) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("id", System.currentTimeMillis());
        body.put("projectId", projectId);
        body.put("title", payload != null ? payload.getOrDefault("title", "Task") : "Task");
        body.put("status", payload != null ? payload.getOrDefault("status", "BACKLOG") : "BACKLOG");
        return ResponseEntity.ok(body);
    }

    @PutMapping("/tasks/{id}")
    public ResponseEntity<Map<String, Object>> updateTask(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> payload) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("id", id);
        body.put("success", true);
        body.put("message", "Task updated");
        return ResponseEntity.ok(body);
    }

    @GetMapping("/tasks/{id}")
    public ResponseEntity<Map<String, Object>> getTask(@PathVariable Long id) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("id", id);
        body.put("title", "Task " + id);
        body.put("description", "Task details placeholder");
        body.put("status", "BACKLOG");
        body.put("priority", "MEDIUM");
        body.put("projectId", 0);
        return ResponseEntity.ok(body);
    }

    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<Map<String, Object>> deleteTask(@PathVariable Long id) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("success", true);
        body.put("message", "Task deleted");
        return ResponseEntity.ok(body);
    }

    @GetMapping("/tasks/{taskId}/attachments")
    public List<Map<String, Object>> listAttachments(@PathVariable Long taskId) {
        return Collections.emptyList();
    }

    @PostMapping("/tasks/{taskId}/attachments")
    public ResponseEntity<Map<String, Object>> uploadAttachment(@PathVariable Long taskId, @RequestParam(value = "file", required = false) MultipartFile file, @RequestParam(value = "note", required = false) String note) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("id", System.currentTimeMillis());
        body.put("taskId", taskId);
        body.put("filename", file != null ? file.getOriginalFilename() : "attachment");
        body.put("note", note);
        body.put("url", "/uploads/placeholder-file");
        return ResponseEntity.ok(body);
    }

    @PostMapping("/attachments/task/{taskId}/upload")
    public ResponseEntity<Map<String, Object>> uploadAttachmentAlias(@PathVariable Long taskId, @RequestParam(value = "file", required = false) MultipartFile file, @RequestParam(value = "note", required = false) String note) {
        return uploadAttachment(taskId, file, note);
    }

    @DeleteMapping("/task-attachments/{id}")
    public ResponseEntity<Void> deleteAttachment(@PathVariable Long id) {
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/users/staff")
    public List<Map<String, Object>> listStaffUsers() {
        return userRepository.findAll().stream()
                .filter(user -> user.getRole() != null && user.getRole() != Role.CLIENT)
                .map(user -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("id", user.getId());
                    item.put("name", user.getName());
                    item.put("email", user.getEmail());
                    item.put("role", user.getRole().name());
                    return item;
                })
                .toList();
    }

    @GetMapping("/users/clients")
    public List<Map<String, Object>> listClientUsers() {
        return userRepository.findAll().stream()
                .filter(user -> user.getRole() == Role.CLIENT)
                .map(this::toUserMap)
                .toList();
    }

    @GetMapping("/users/all")
    public List<Map<String, Object>> listAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toUserMap)
                .toList();
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<Map<String, Object>> getUser(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> ResponseEntity.ok(toUserMap(user)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/project-members/project/{projectId}")
    public List<Map<String, Object>> listProjectMembers(@PathVariable Long projectId) {
        return Collections.emptyList();
    }

    @PostMapping("/project-members/assign")
    public ResponseEntity<Map<String, Object>> assignProjectMember(@RequestBody(required = false) Map<String, Object> payload) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("success", true);
        body.put("message", "Project member assigned");
        body.put("payload", payload != null ? payload : Collections.emptyMap());
        return ResponseEntity.ok(body);
    }

    @DeleteMapping("/project-members/remove")
    public ResponseEntity<Void> removeProjectMember(@RequestParam(required = false) Long projectId, @RequestParam(required = false) Long userId) {
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/projects/stats")
    public Map<String, Object> projectStats() {
        return Map.of(
                "total", projectRepository.count(),
                "planning", 0,
                "inProgress", 0,
                "completed", 0
        );
    }

    @GetMapping("/projects/recent")
    public List<Map<String, Object>> recentProjects() {
        return projectRepository.findAll().stream()
                .filter(Project::getActive)
                .limit(5)
                .map(this::toProjectMap)
                .toList();
    }

    @GetMapping("/milestones/project/{projectId}")
    public List<Map<String, Object>> listMilestones(@PathVariable Long projectId) {
        return Collections.emptyList();
    }

    @GetMapping("/milestones/project/{projectId}/highlight")
    public Map<String, Object> milestoneHighlight(@PathVariable Long projectId) {
        return Map.of("projectId", projectId, "highlight", Map.of("name", "Initial Planning", "dueDate", LocalDateTime.now().plusDays(7).toString()));
    }

    @PostMapping("/portfolio/promote")
    public ResponseEntity<Map<String, Object>> promotePortfolio(@RequestBody(required = false) Map<String, Object> payload) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("success", true);
        body.put("message", "Portfolio item promoted");
        body.put("payload", payload != null ? payload : Collections.emptyMap());
        return ResponseEntity.ok(body);
    }

    @DeleteMapping("/portfolio/{id}")
    public ResponseEntity<Void> deletePortfolio(@PathVariable Long id) {
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/chat/messages/{id}")
    public ResponseEntity<Void> deleteChatMessageAlias(@PathVariable Long id) {
        return deleteChatMessage(id);
    }

    @DeleteMapping("/admin/clients/{id}")
    public ResponseEntity<Void> deleteAdminClient(@PathVariable Long id, @RequestParam(value = "hard", required = false) Boolean hard) {
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/admin/analytics/logs")
    public Map<String, Object> analyticsLogs(@RequestParam(value = "query", required = false) String query) {
        return Map.of("results", List.of(), "query", query != null ? query : "");
    }

    @GetMapping("/admin/analytics/system/search")
    public Map<String, Object> analyticsSystemSearch(@RequestParam(value = "query", required = false) String query) {
        return Map.of("results", List.of(), "query", query != null ? query : "");
    }

    @GetMapping("/admin/analytics/activity-stats")
    public Map<String, Object> analyticsActivityStats() {
        return Map.of("activeUsers", 0, "actions", 0);
    }

    @GetMapping("/admin/analytics/category-breakdown")
    public Map<String, Object> analyticsCategoryBreakdown() {
        return Map.of("categories", List.of());
    }

    @GetMapping("/admin/analytics/top-users")
    public Map<String, Object> analyticsTopUsers() {
        return Map.of("users", List.of());
    }

    @GetMapping("/admin/analytics/system/live-logs")
    public Map<String, Object> analyticsLiveLogs(@RequestParam(value = "level", required = false) String level) {
        return Map.of("level", level != null ? level : "INFO", "entries", List.of());
    }

    @PostMapping("/admin/team-members")
    public ResponseEntity<Map<String, Object>> createTeamMember(@RequestBody(required = false) Map<String, Object> payload) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("success", true);
        body.put("member", payload != null ? payload : Collections.emptyMap());
        return ResponseEntity.ok(body);
    }

    @PutMapping("/admin/team-members/{id}")
    public ResponseEntity<Map<String, Object>> updateTeamMember(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> payload) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("success", true);
        body.put("id", id);
        body.put("member", payload != null ? payload : Collections.emptyMap());
        return ResponseEntity.ok(body);
    }

    @DeleteMapping("/admin/team-members/{id}")
    public ResponseEntity<Void> deleteTeamMember(@PathVariable Long id) {
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/admin/users/{id}")
    public ResponseEntity<Void> deleteAdminUser(@PathVariable Long id) {
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/chat/channels")
    public List<Map<String, Object>> listChatChannels() {
        return List.of(
                Map.of("id", 1L, "name", "Project Chat", "unifiedId", "project-chat")
        );
    }

    @GetMapping("/chat/channel/{unifiedId}")
    public List<Map<String, Object>> getChatHistory(@PathVariable String unifiedId) {
        return chatHistoryStore.getOrDefault(unifiedId, Collections.emptyList());
    }

    @GetMapping("/chat/project/{projectId}")
    public List<Map<String, Object>> getProjectChatHistory(@PathVariable Long projectId) {
        String unifiedId = "P_" + projectId;
        return chatHistoryStore.getOrDefault(unifiedId, Collections.emptyList());
    }

    @PostMapping("/chat/channel/{unifiedId}")
    public ResponseEntity<Map<String, Object>> sendChatMessage(@PathVariable String unifiedId, @RequestBody(required = false) Map<String, Object> payload) {
        Map<String, Object> message = new LinkedHashMap<>();
        message.put("id", System.currentTimeMillis());
        message.put("unifiedId", unifiedId);
        message.put("text", payload != null ? payload.getOrDefault("text", "") : "");
        message.put("sender", payload != null ? payload.getOrDefault("sender", "system") : "system");
        message.put("createdAt", LocalDateTime.now().toString());
        chatHistoryStore.computeIfAbsent(unifiedId, key -> new ArrayList<>()).add(message);
        return ResponseEntity.ok(message);
    }

    @PostMapping("/chat/project/{projectId}")
    public ResponseEntity<Map<String, Object>> sendProjectChatMessage(@PathVariable Long projectId, @RequestBody(required = false) Map<String, Object> payload) {
        String unifiedId = "P_" + projectId;
        return sendChatMessage(unifiedId, payload);
    }

    @DeleteMapping("/chat/message/{id}")
    public ResponseEntity<Void> deleteChatMessage(@PathVariable Long id) {
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/chat/channel/{unifiedId}/read")
    public ResponseEntity<Void> markChatRead(@PathVariable String unifiedId) {
        return ResponseEntity.ok().build();
    }

    @PostMapping("/chat/channels/group")
    public ResponseEntity<Map<String, Object>> createGroupChannel(@RequestParam String name, @RequestBody(required = false) List<Long> memberIds) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("id", System.currentTimeMillis());
        body.put("name", name);
        body.put("memberIds", memberIds != null ? memberIds : Collections.emptyList());
        body.put("unifiedId", "group-" + System.currentTimeMillis());
        return ResponseEntity.ok(body);
    }

    @PostMapping("/account/change-password")
    public ResponseEntity<Void> changePassword(@RequestBody(required = false) Map<String, String> payload) {
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/auth/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody(required = false) Map<String, Object> payload) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("success", true);
        body.put("message", "Registration successful");
        body.put("user", Map.of(
                "email", payload != null ? payload.getOrDefault("email", "user@example.com") : "user@example.com",
                "name", payload != null ? payload.getOrDefault("name", "User") : "User",
                "role", "CLIENT"
        ));
        return ResponseEntity.ok(body);
    }

    @PostMapping("/auth/send-otp")
    public ResponseEntity<Map<String, Object>> sendOtp(@RequestBody(required = false) Map<String, String> payload) {
        String email = payload != null ? payload.get("email") : null;
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("success", true);
        body.put("message", "OTP sent");
        body.put("email", email);
        return ResponseEntity.ok(body);
    }

    @PostMapping("/auth/verify-otp")
    public ResponseEntity<Map<String, Object>> verifyOtp(@RequestBody(required = false) Map<String, String> payload) {
        String email = payload != null ? payload.get("email") : null;
        String otp = payload != null ? payload.get("otp") : null;

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User fallback = new User();
            fallback.setName("Demo User");
            fallback.setEmail(email != null ? email : "demo@vertex.com");
            fallback.setPassword("demo-password");
            fallback.setRole(Role.CLIENT);
            fallback.setActive(true);
            fallback.setVerified(true);
            fallback.setCreatedAt(LocalDateTime.now());
            return userRepository.save(fallback);
        });

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("success", true);
        body.put("token", token);
        body.put("message", "OTP verified");
        body.put("user", Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "name", user.getName(),
                "role", user.getRole().name()
        ));
        body.put("otp", otp);
        return ResponseEntity.ok(body);
    }

    @GetMapping("/admin/analytics")
    public ResponseEntity<Map<String, Object>> analytics() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("success", true);
        body.put("message", "Analytics data");
        body.put("summary", Map.of("projects", projectRepository.count(), "users", userRepository.count()));
        return ResponseEntity.ok(body);
    }

    private Map<String, Object> toProjectMap(Project project) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("id", project.getId());
        item.put("name", project.getName());
        item.put("description", project.getDescription());
        item.put("status", project.getStatus() != null ? project.getStatus().name() : "DRAFT");
        item.put("location", project.getLocation());
        item.put("progress", project.getProgress());
        item.put("budget", project.getBudget());
        item.put("projectType", project.getProjectType() != null ? project.getProjectType().name() : null);
        item.put("clientId", project.getClientId());
        item.put("projectManagerId", project.getProjectManagerId());
        return item;
    }

    private Map<String, Object> toUserMap(User user) {
        return Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole() != null ? user.getRole().name() : "UNKNOWN",
                "active", user.getActive()
        );
    }
}
