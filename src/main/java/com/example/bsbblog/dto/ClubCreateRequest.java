package com.example.bsbblog.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.List;

@Data
public class ClubCreateRequest {

    @NotBlank(message = "Club name cannot be empty")
    private String name;

    private String description;

    @NotBlank(message = "Category is required")
    private String categoryId;

    private List<String> initialManagers;
}
