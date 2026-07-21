package com.example.bsbblog.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ClubCategoryRequest {

    @NotBlank(message = "Category name cannot be empty")
    private String name;
}
