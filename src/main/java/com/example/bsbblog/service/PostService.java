package com.example.bsbblog.service;

import com.example.bsbblog.dto.BlogPostRequest;
import com.example.bsbblog.dto.PollPostRequest;
import com.example.bsbblog.exception.ForbiddenException;
import com.example.bsbblog.model.PollOption;
import com.example.bsbblog.model.Post;
import com.example.bsbblog.repository.PostRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PostService {

    private final PostRepository postRepository;

    public PostService(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    public Post createBlogPost(BlogPostRequest request, String username) {
        Post post = new Post();
        post.setType("BLOG");
        post.setAuthor(username);
        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setCreatedAt(LocalDateTime.now());
        return postRepository.save(post);
    }

    public Post createImagePost(String caption, String imageUrl, String username) {
        Post post = new Post();
        post.setType("IMAGE");
        post.setAuthor(username);
        post.setContent(caption);
        post.setImageUrl(imageUrl);
        post.setCreatedAt(LocalDateTime.now());
        return postRepository.save(post);
    }

    public Post createPollPost(PollPostRequest request, String username) {
        Post post = new Post();
        post.setType("POLL");
        post.setAuthor(username);
        post.setTitle(request.getTitle());
        post.setAllowMultipleChoice(request.isAllowMultipleChoice());

        List<PollOption> options = request.getOptions().stream()
                .map(text -> new PollOption(text, new java.util.HashSet<>()))
                .collect(Collectors.toList());
        post.setPollOptions(options);

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

    public List<Post> getPostsByAuthor(String username) {
        return postRepository.findByAuthor(username);
    }

    public Post updatePost(String id, BlogPostRequest request, String username) {
        Post existingPost = getPostById(id);

        if (!existingPost.getAuthor().equals(username)) {
            throw new ForbiddenException("You can only edit your own posts");
        }

        existingPost.setTitle(request.getTitle());
        existingPost.setContent(request.getContent());
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

    public void deletePostAsAdmin(String id) {
        if (!postRepository.existsById(id)) {
            throw new RuntimeException("Post not found with id: " + id);
        }
        postRepository.deleteById(id);
    }

    public Post toggleLike(String id, String username) {
        Post post = getPostById(id);

        if (post.getLikedBy().contains(username)) {
            post.getLikedBy().remove(username);
        } else {
            post.getLikedBy().add(username);
        }

        return postRepository.save(post);
    }

    public Post votePoll(String id, List<Integer> optionIndexes, String username) {
        Post post = getPostById(id);

        if (!"POLL".equals(post.getType())) {
            throw new RuntimeException("This post is not a poll");
        }

        if (!post.isAllowMultipleChoice() && optionIndexes.size() > 1) {
            throw new RuntimeException("This poll only allows a single choice");
        }

        for (PollOption option : post.getPollOptions()) {
            option.getVotedBy().remove(username);
        }

        for (Integer index : optionIndexes) {
            if (index < 0 || index >= post.getPollOptions().size()) {
                throw new RuntimeException("Invalid option index: " + index);
            }
            post.getPollOptions().get(index).getVotedBy().add(username);
        }

        return postRepository.save(post);
    }
}
