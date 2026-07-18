package com.example.bsbblog.controller;

import com.example.bsbblog.model.Post;
import com.example.bsbblog.service.PostService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @PostMapping
    public Post createPost(@Valid @RequestBody Post post, Authentication authentication) {
        return postService.createPost(post, authentication.getName());
    }

    @GetMapping
    public List<Post> getAllPosts() {
        return postService.getAllPosts();
    }

    @GetMapping("/{id}")
    public Post getPostById(@PathVariable String id) {
        return postService.getPostById(id);
    }

    @PutMapping("/{id}")
    public Post updatePost(@PathVariable String id, @Valid @RequestBody Post post, Authentication authentication) {
        return postService.updatePost(id, post, authentication.getName());
    }

    @DeleteMapping("/{id}")
    public String deletePost(@PathVariable String id, Authentication authentication) {
        postService.deletePost(id, authentication.getName());
        return "Post with id " + id + " deleted successfully";
    }
}
