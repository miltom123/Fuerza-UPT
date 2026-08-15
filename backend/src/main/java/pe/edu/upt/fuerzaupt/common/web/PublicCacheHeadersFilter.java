package pe.edu.upt.fuerzaupt.common.web;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 20)
public class PublicCacheHeadersFilter extends OncePerRequestFilter {

    private static final Set<String> PUBLIC_PREFIXES = Set.of(
            "/api/public/", "/api/representacion", "/api/proyectos", "/api/eventos",
            "/api/oportunidades", "/api/equipo", "/api/estadisticas",
            "/api/encuestas", "/api/configuracion-publica"
    );

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        if ("GET".equals(request.getMethod()) && isPublicContent(request.getRequestURI())) {
            response.setHeader("Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=600");
        }
        filterChain.doFilter(request, response);
    }

    private boolean isPublicContent(String uri) {
        return PUBLIC_PREFIXES.stream().anyMatch(uri::startsWith);
    }
}
