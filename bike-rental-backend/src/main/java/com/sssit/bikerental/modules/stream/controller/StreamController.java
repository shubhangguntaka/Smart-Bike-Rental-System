package com.sssit.bikerental.modules.stream.controller;

import com.sssit.bikerental.modules.stream.service.SseService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/stream")
@RequiredArgsConstructor
public class StreamController {

    private final SseService sseService;

    @GetMapping("/bikes")
    public SseEmitter streamBikes() {
        return sseService.subscribe();
    }
}
