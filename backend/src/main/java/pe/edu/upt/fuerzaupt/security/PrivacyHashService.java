package pe.edu.upt.fuerzaupt.security;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;

@Service
public class PrivacyHashService {

    private final byte[] secret;
    private final Environment environment;

    @Autowired
    public PrivacyHashService(@Value("${app.privacy.hmac-secret:}") String secret, Environment environment) {
        this.secret = secret.getBytes(StandardCharsets.UTF_8);
        this.environment = environment;
    }

    public PrivacyHashService(String secret) {
        this.secret = secret.getBytes(StandardCharsets.UTF_8);
        this.environment = null;
    }

    @PostConstruct
    public void validate() {
        if (environment != null && environment.acceptsProfiles(Profiles.of("production"))) {
            if (secret.length < 32) {
                throw new IllegalStateException("PRIVACY_HMAC_SECRET debe contener al menos 32 caracteres en entorno productivo.");
            }
        }
    }

    public String hash(String value, String scope) {
        if (secret.length < 32) {
            throw new IllegalStateException("PRIVACY_HMAC_SECRET debe contener al menos 32 caracteres.");
        }
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret, "HmacSHA256"));
            return HexFormat.of().formatHex(mac.doFinal((scope + "|" + value).getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new IllegalStateException("No se pudo proteger el identificador privado.", exception);
        }
    }
}
