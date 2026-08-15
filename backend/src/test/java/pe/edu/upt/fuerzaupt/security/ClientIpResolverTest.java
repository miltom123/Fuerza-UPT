package pe.edu.upt.fuerzaupt.security;

import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ClientIpResolverTest {

    @Test
    void usesForwardedAddressOnlyForTrustedProxy() {
        ClientIpResolver resolver = new ClientIpResolver("127.0.0.1");
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getRemoteAddr()).thenReturn("127.0.0.1");
        when(request.getHeader("X-Forwarded-For")).thenReturn("203.0.113.10, 127.0.0.1");
        assertEquals("203.0.113.10", resolver.resolve(request));
    }

    @Test
    void ignoresSpoofedHeaderFromUntrustedClient() {
        ClientIpResolver resolver = new ClientIpResolver("127.0.0.1");
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getRemoteAddr()).thenReturn("198.51.100.20");
        when(request.getHeader("X-Forwarded-For")).thenReturn("203.0.113.10");
        assertEquals("198.51.100.20", resolver.resolve(request));
    }
}
