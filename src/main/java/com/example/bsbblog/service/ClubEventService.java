package com.example.bsbblog.service;

import com.example.bsbblog.dto.ClubEventRequest;
import com.example.bsbblog.model.Club;
import com.example.bsbblog.model.ClubEvent;
import com.example.bsbblog.repository.ClubEventRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ClubEventService {

    private final ClubEventRepository eventRepository;
    private final ClubService clubService;

    public ClubEventService(ClubEventRepository eventRepository, ClubService clubService) {
        this.eventRepository = eventRepository;
        this.clubService = clubService;
    }

    public ClubEvent addEvent(String clubId, ClubEventRequest request, String username, boolean isAdmin) {
        Club club = clubService.getClubById(clubId);
        clubService.requireManagerOrAdmin(club, username, isAdmin);

        ClubEvent event = new ClubEvent();
        event.setClubId(clubId);
        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setEventDate(request.getEventDate());
        event.setCreatedAt(LocalDateTime.now());

        return eventRepository.save(event);
    }

    public List<ClubEvent> getEventsForClub(String clubId) {
        return eventRepository.findByClubId(clubId);
    }

    public void deleteEvent(String eventId, String clubId, String username, boolean isAdmin) {
        Club club = clubService.getClubById(clubId);
        clubService.requireManagerOrAdmin(club, username, isAdmin);

        if (!eventRepository.existsById(eventId)) {
            throw new RuntimeException("Event not found");
        }
        eventRepository.deleteById(eventId);
    }
}
