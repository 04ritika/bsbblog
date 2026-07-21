package com.example.bsbblog.repository;

import com.example.bsbblog.model.ClubAnnouncement;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ClubAnnouncementRepository extends MongoRepository<ClubAnnouncement, String> {
    List<ClubAnnouncement> findByClubId(String clubId);
}
