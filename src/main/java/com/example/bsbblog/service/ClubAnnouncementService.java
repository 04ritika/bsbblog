package com.example.bsbblog.service;

import com.example.bsbblog.dto.ClubAnnouncementRequest;
import com.example.bsbblog.model.Club;
import com.example.bsbblog.model.ClubAnnouncement;
import com.example.bsbblog.repository.ClubAnnouncementRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ClubAnnouncementService {

    private final ClubAnnouncementRepository announcementRepository;
    private final ClubService clubService;

    public ClubAnnouncementService(ClubAnnouncementRepository announcementRepository, ClubService clubService) {
        this.announcementRepository = announcementRepository;
        this.clubService = clubService;
    }

    public ClubAnnouncement addAnnouncement(String clubId, ClubAnnouncementRequest request, String username, boolean isAdmin) {
        Club club = clubService.getClubById(clubId);
        clubService.requireManagerOrAdmin(club, username, isAdmin);

        ClubAnnouncement announcement = new ClubAnnouncement();
        announcement.setClubId(clubId);
        announcement.setContent(request.getContent());
        announcement.setPostedBy(username);
        announcement.setCreatedAt(LocalDateTime.now());

        return announcementRepository.save(announcement);
    }

    public List<ClubAnnouncement> getAnnouncementsForClub(String clubId) {
        return announcementRepository.findByClubId(clubId);
    }

    public void deleteAnnouncement(String announcementId, String clubId, String username, boolean isAdmin) {
        Club club = clubService.getClubById(clubId);
        clubService.requireManagerOrAdmin(club, username, isAdmin);

        if (!announcementRepository.existsById(announcementId)) {
            throw new RuntimeException("Announcement not found");
        }
        announcementRepository.deleteById(announcementId);
    }
}
