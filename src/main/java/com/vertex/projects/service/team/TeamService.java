package com.vertex.projects.service.team;

import com.vertex.projects.dto.team.AssignMemberRequest;
import com.vertex.projects.dto.team.TeamRequest;
import com.vertex.projects.model.auth.User;
import com.vertex.projects.model.team.Team;
import com.vertex.projects.model.team.TeamMember;
import com.vertex.projects.repository.auth.UserRepository;
import com.vertex.projects.repository.team.TeamMemberRepository;
import com.vertex.projects.repository.team.TeamRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;

    public TeamService(TeamRepository teamRepository, TeamMemberRepository teamMemberRepository, UserRepository userRepository) {
        this.teamRepository = teamRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.userRepository = userRepository;
    }

    public Team createTeam(TeamRequest req) {
        Team t = Team.builder()
                .name(req.getName())
                .description(req.getDescription())
                .build();
        return teamRepository.save(t);
    }

    public Optional<Team> getTeam(Long id) {
        return teamRepository.findById(id);
    }

    @Transactional
    public TeamMember assignUser(Long teamId, AssignMemberRequest req) {
        Team team = teamRepository.findById(teamId).orElseThrow(() -> new IllegalArgumentException("Team not found"));
        User user = userRepository.findById(req.getUserId()).orElseThrow(() -> new IllegalArgumentException("User not found"));
        TeamMember member = TeamMember.builder()
            .teamId(team.getId())
            .userId(user.getId())
            .role(req.getRole())
            .build();
        return teamMemberRepository.save(member);
    }

    @Transactional
    public void removeMember(Long teamId, Long userId) {
        teamMemberRepository.deleteByTeamIdAndUserId(teamId, userId);
    }

    public List<TeamMember> listMembers(Long teamId) {
        return teamMemberRepository.findByTeamId(teamId);
    }

    public List<Team> listTeamsForUser(Long userId) {
        return teamRepository.findAll();
    }
}
