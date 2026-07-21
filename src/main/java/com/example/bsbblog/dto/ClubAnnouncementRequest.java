package com.example.bsbblog.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ClubAnnouncementRequest {

    @NotBlank(message = "Announcement content cannot be empty")
    private String content;
}
