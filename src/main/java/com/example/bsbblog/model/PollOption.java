package com.example.bsbblog.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.Set;
import java.util.HashSet;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PollOption {
    private String text;
    private Set<String> votedBy = new HashSet<>();
}
