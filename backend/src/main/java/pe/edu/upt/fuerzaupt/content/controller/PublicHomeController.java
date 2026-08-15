package pe.edu.upt.fuerzaupt.content.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import pe.edu.upt.fuerzaupt.content.dto.HomePublicResponse;
import pe.edu.upt.fuerzaupt.content.service.PublicHomeService;

@RestController
@RequiredArgsConstructor
public class PublicHomeController {

    private final PublicHomeService homeService;

    @GetMapping("/api/public/home")
    public HomePublicResponse home() {
        return homeService.home();
    }
}
