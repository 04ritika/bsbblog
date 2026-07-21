package com.example.bsbblog.controller;

import com.example.bsbblog.dto.ClubCreateRequest;
import com.example.bsbblog.dto.ClubUpdateRequest;
import com.example.bsbblog.model.Club;
import com.example.bsbblog.service.ClubService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/clubs")
public class ClubController {

    private final ClubService clubService;

    public ClubController(ClubService clubService) {
        this.clubService = clubService;
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals("ROLE_ADMIN"));
    }

    @GetMapping
    public List<Club> getAllClubs(@RequestParam(required = false) String categoryId) {
        if (categoryId != null) {
            return clubService.getClubsByCategory(categoryId);
        }
        return clubService.getAllClubs();
    }

    @GetMapping("/{id}")
    public Club getClubById(@PathVariable String id) {
        return clubService.getClubById(id);
    }

    @PutMapping("/{id}")
    public Club updateClub(@PathVariable String id, @RequestBody ClubUpdateRequest request, Authentication authentication) {
        return clubService.updateClub(id, request, authentication.getName(), isAdmin(authentication));
    }

    @PostMapping("/{id}/members")
    public Club addMember(@PathVariable String id, @RequestBody Map<String, String> body, Authentication authentication) {
        return clubService.addMember(id, body.get("username"), authentication.getName(), isAdmin(authentication));
    }

    @DeleteMapping("/{id}/members/{username}")
    public Club removeMember(@PathVariable String id, @PathVariable String username, Authentication authentication) {
        return clubService.removeMember(id, username, authentication.getName(), isAdmin(authentication));
    }
}
