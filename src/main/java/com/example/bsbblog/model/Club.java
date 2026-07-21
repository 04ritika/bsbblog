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

@Document(collection = "clubs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Club {

    @Id
    private String id;

    @NotBlank(message = "Club name cannot be empty")
    private String name;

    private String description;

    private String categoryId;

    private String imageUrl;

    private Set<String> managers = new HashSet<>();

    private Set<String> members = new HashSet<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
