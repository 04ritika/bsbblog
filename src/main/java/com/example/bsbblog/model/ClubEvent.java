package com.example.bsbblog.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Document(collection = "club_events")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClubEvent {

    @Id
    private String id;

    private String clubId;

    @NotBlank(message = "Event title cannot be empty")
    private String title;

    private String description;

    private LocalDateTime eventDate;

    private LocalDateTime createdAt;
}
