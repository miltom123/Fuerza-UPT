package pe.edu.upt.fuerzaupt.common.web;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.ShallowEtagHeaderFilter;

import java.util.Set;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 21)
public class PublicEtagFilter extends ShallowEtagHeaderFilter {

    private static final Set<String> PUBLIC_PREFIXES = Set.of(
            "/api/public/", "/api/representacion", "/api/proyectos", "/api/eventos",
            "/api/oportunidades", "/api/equipo", "/api/estadisticas",
            "/api/encuestas", "/api/configuracion-publica"
    );

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        return !"GET".equals(request.getMethod())
                || PUBLIC_PREFIXES.stream().noneMatch(request.getRequestURI()::startsWith);
    }
}
