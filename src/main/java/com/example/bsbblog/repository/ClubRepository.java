package com.example.bsbblog.repository;

import com.example.bsbblog.model.Club;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ClubRepository extends MongoRepository<Club, String> {
    List<Club> findByCategoryId(String categoryId);
}
