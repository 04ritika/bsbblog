package com.example.bsbblog.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Document(collection = "club_announcements")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClubAnnouncement {

    @Id
    private String id;

    private String clubId;

    @NotBlank(message = "Announcement content cannot be empty")
    private String content;

    private String postedBy;

    private LocalDateTime createdAt;
}
