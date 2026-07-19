package com.example.bsbblog.repository;

import com.example.bsbblog.model.Post;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface PostRepository extends MongoRepository<Post, String> {
    List<Post> findByAuthor(String author);
}
