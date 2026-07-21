package com.example.bsbblog.controller;

import com.example.bsbblog.dto.ClubAnnouncementRequest;
import com.example.bsbblog.model.ClubAnnouncement;
import com.example.bsbblog.service.ClubAnnouncementService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/clubs/{clubId}/announcements")
public class ClubAnnouncementController {

    private final ClubAnnouncementService announcementService;

    public ClubAnnouncementController(ClubAnnouncementService announcementService) {
        this.announcementService = announcementService;
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals("ROLE_ADMIN"));
    }

    @PostMapping
    public ClubAnnouncement addAnnouncement(@PathVariable String clubId, @Valid @RequestBody ClubAnnouncementRequest request, Authentication authentication) {
        return announcementService.addAnnouncement(clubId, request, authentication.getName(), isAdmin(authentication));
    }

    @GetMapping
    public List<ClubAnnouncement> getAnnouncements(@PathVariable String clubId) {
        return announcementService.getAnnouncementsForClub(clubId);
    }

    @DeleteMapping("/{announcementId}")
    public String deleteAnnouncement(@PathVariable String clubId, @PathVariable String announcementId, Authentication authentication) {
        announcementService.deleteAnnouncement(announcementId, clubId, authentication.getName(), isAdmin(authentication));
        return "Announcement deleted successfully";
    }
}
