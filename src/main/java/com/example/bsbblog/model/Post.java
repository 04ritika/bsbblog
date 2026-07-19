package com.example.bsbblog.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.HashSet;
import java.util.List;

@Document(collection = "posts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Post {

    @Id
    private String id;

    private String author;

    private String type = "BLOG"; // BLOG, IMAGE, or POLL

    private String title;

    private String content;

    // IMAGE type only
    private String imageUrl;

    // POLL type only
    private List<PollOption> pollOptions;
    private boolean allowMultipleChoice;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private Set<String> likedBy = new HashSet<>();
}
