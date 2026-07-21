package com.example.bsbblog.repository;

import com.example.bsbblog.model.ClubEvent;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ClubEventRepository extends MongoRepository<ClubEvent, String> {
    List<ClubEvent> findByClubId(String clubId);
}
