package com.example.bsbblog.controller;

import com.example.bsbblog.dto.ClubEventRequest;
import com.example.bsbblog.model.ClubEvent;
import com.example.bsbblog.service.ClubEventService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/clubs/{clubId}/events")
public class ClubEventController {

    private final ClubEventService eventService;

    public ClubEventController(ClubEventService eventService) {
        this.eventService = eventService;
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals("ROLE_ADMIN"));
    }

    @PostMapping
    public ClubEvent addEvent(@PathVariable String clubId, @Valid @RequestBody ClubEventRequest request, Authentication authentication) {
        return eventService.addEvent(clubId, request, authentication.getName(), isAdmin(authentication));
    }

    @GetMapping
    public List<ClubEvent> getEvents(@PathVariable String clubId) {
        return eventService.getEventsForClub(clubId);
    }

    @DeleteMapping("/{eventId}")
    public String deleteEvent(@PathVariable String clubId, @PathVariable String eventId, Authentication authentication) {
        eventService.deleteEvent(eventId, clubId, authentication.getName(), isAdmin(authentication));
        return "Event deleted successfully";
    }
}
