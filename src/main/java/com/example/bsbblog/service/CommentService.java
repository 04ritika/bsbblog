package com.example.bsbblog.service;

import com.example.bsbblog.exception.ForbiddenException;
import com.example.bsbblog.model.Comment;
import com.example.bsbblog.repository.CommentRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class CommentService {

    private final CommentRepository commentRepository;

    public CommentService(CommentRepository commentRepository) {
        this.commentRepository = commentRepository;
    }

    public Comment addComment(String postId, String content, String username) {
        Comment comment = new Comment();
        comment.setPostId(postId);
        comment.setAuthor(username);
        comment.setContent(content);
        comment.setCreatedAt(LocalDateTime.now());
        return commentRepository.save(comment);
    }

    public List<Comment> getCommentsForPost(String postId) {
        return commentRepository.findByPostId(postId);
    }

    public void deleteComment(String id, String username, boolean isAdmin) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getAuthor().equals(username) && !isAdmin) {
            throw new ForbiddenException("You can only delete your own comments");
        }

        commentRepository.deleteById(id);
    }
}
