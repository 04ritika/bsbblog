package com.example.bsbblog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.util.List;

@Data
public class PollPostRequest {

    @NotBlank(message = "Question cannot be empty")
    private String title;

    @NotEmpty(message = "A poll needs at least 2 options")
    @Size(min = 2, message = "A poll needs at least 2 options")
    private List<String> options;

    private boolean allowMultipleChoice;
}
