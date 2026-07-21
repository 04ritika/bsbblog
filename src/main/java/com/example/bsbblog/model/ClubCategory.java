package com.example.bsbblog.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.NotBlank;

@Document(collection = "club_categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClubCategory {

    @Id
    private String id;

    @NotBlank(message = "Category name cannot be empty")
    private String name;
}
