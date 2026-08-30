package com.vertex.projects.controller.team;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vertex.projects.dto.team.AssignMemberRequest;
import com.vertex.projects.dto.team.TeamRequest;
import com.vertex.projects.model.auth.Role;
import com.vertex.projects.model.auth.User;
import com.vertex.projects.repository.auth.UserRepository;
import com.vertex.projects.repository.team.TeamMemberRepository;
import com.vertex.projects.repository.team.TeamRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@WithMockUser(username = "integration", roles = {"USER"})
public class TeamControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private TeamMemberRepository teamMemberRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testUser;

    @BeforeEach
    public void setUp() {
        teamMemberRepository.deleteAll();
        teamRepository.deleteAll();
        userRepository.deleteAll();

        testUser = User.builder()
                .name("Team User")
                .email("teamuser@vertex.com")
                .password(passwordEncoder.encode("pass@123"))
                .role(Role.PROJECT_MANAGER)
                .active(true)
                .verified(true)
                .createdAt(LocalDateTime.now())
                .build();

        testUser = userRepository.save(testUser);
    }

    @Test
    public void testCreateTeamAssignAndRemoveMember() throws Exception {
        TeamRequest teamReq = new TeamRequest();
        teamReq.setName("Alpha Team");
        teamReq.setDescription("Integration test team");

        String teamRes = mockMvc.perform(post("/api/v2/teams")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(teamReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andReturn().getResponse().getContentAsString();

        Long teamId = objectMapper.readTree(teamRes).get("data").get("id").asLong();

        AssignMemberRequest assignReq = new AssignMemberRequest();
        assignReq.setUserId(testUser.getId());

        mockMvc.perform(post(String.format("/api/v2/teams/%d/members", teamId))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(assignReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true));

        String membersResponse = mockMvc.perform(get(String.format("/api/v2/teams/%d/members", teamId)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        System.out.println("Members response: " + membersResponse);

        String deleteResponse = mockMvc.perform(delete(String.format("/api/v2/teams/%d/members/%d", teamId, testUser.getId())))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        System.out.println("Delete response: " + deleteResponse);
        org.junit.jupiter.api.Assertions.assertTrue(deleteResponse.contains("\"success\":true"));
    }
}
