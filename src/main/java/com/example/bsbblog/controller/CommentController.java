package com.example.bsbblog.controller;

import com.example.bsbblog.dto.CommentRequest;
import com.example.bsbblog.model.Comment;
import com.example.bsbblog.service.CommentService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @PostMapping("/{postId}")
    public Comment addComment(@PathVariable String postId,
                               @Valid @RequestBody CommentRequest request,
                               Authentication authentication) {
        return commentService.addComment(postId, request.getContent(), authentication.getName());
    }

    @GetMapping("/{postId}")
    public List<Comment> getComments(@PathVariable String postId) {
        return commentService.getCommentsForPost(postId);
    }

    @DeleteMapping("/{id}")
    public String deleteComment(@PathVariable String id, Authentication authentication) {
        boolean isAdmin = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals("ROLE_ADMIN"));

        commentService.deleteComment(id, authentication.getName(), isAdmin);
        return "Comment deleted successfully";
    }
}
