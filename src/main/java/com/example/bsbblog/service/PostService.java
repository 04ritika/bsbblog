package com.example.bsbblog.service;

import com.example.bsbblog.exception.ForbiddenException;
import com.example.bsbblog.model.Post;
import com.example.bsbblog.repository.PostRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PostService {

    private final PostRepository postRepository;

    public PostService(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    public Post createPost(Post post, String username) {
        post.setAuthor(username);
        post.setCreatedAt(LocalDateTime.now());
        return postRepository.save(post);
    }

    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }

    public Post getPostById(String id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));
    }

    public Post updatePost(String id, Post updatedPost, String username) {
        Post existingPost = getPostById(id);

        if (!existingPost.getAuthor().equals(username)) {
            throw new ForbiddenException("You can only edit your own posts");
        }

        existingPost.setTitle(updatedPost.getTitle());
        existingPost.setContent(updatedPost.getContent());
        existingPost.setUpdatedAt(LocalDateTime.now());

        return postRepository.save(existingPost);
    }

    public void deletePost(String id, String username) {
        Post existingPost = getPostById(id);

        if (!existingPost.getAuthor().equals(username)) {
            throw new ForbiddenException("You can only delete your own posts");
        }

        postRepository.deleteById(id);
    }
}
