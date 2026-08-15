package pe.edu.upt.fuerzaupt.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class ClientIpResolver {

    private final Set<String> trustedProxyAddresses;

    public ClientIpResolver(
            @Value("${app.security.trusted-proxy-addresses:127.0.0.1,0:0:0:0:0:0:0:1,::1}") String addresses
    ) {
        trustedProxyAddresses = Arrays.stream(addresses.split(","))
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .collect(Collectors.toUnmodifiableSet());
    }

    public String resolve(HttpServletRequest request) {
        String remoteAddress = request.getRemoteAddr();
        if (!trustedProxyAddresses.contains(remoteAddress)) {
            return remoteAddress;
        }
        String forwardedFor = request.getHeader("X-Forwarded-For");
        return forwardedFor == null || forwardedFor.isBlank()
                ? remoteAddress
                : forwardedFor.split(",")[0].trim();
    }
}
