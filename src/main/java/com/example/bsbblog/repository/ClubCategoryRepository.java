package com.example.bsbblog.repository;

import com.example.bsbblog.model.ClubCategory;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ClubCategoryRepository extends MongoRepository<ClubCategory, String> {
}
