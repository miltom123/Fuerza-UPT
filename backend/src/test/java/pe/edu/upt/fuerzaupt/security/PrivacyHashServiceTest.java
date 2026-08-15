package pe.edu.upt.fuerzaupt.security;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class PrivacyHashServiceTest {

    private static final String TEST_SECRET = "test-secret-with-at-least-thirty-two-characters";

    @Test
    void producesStableScopedHashesWithoutExposingTheInput() {
        PrivacyHashService service = new PrivacyHashService(TEST_SECRET);

        String first = service.hash("203.0.113.10", "poll:one");
        String second = service.hash("203.0.113.10", "poll:one");

        assertEquals(first, second);
        assertEquals(64, first.length());
        assertNotEquals("203.0.113.10", first);
    }

    @Test
    void separatesTheSameIdentifierByScope() {
        PrivacyHashService service = new PrivacyHashService(TEST_SECRET);

        assertNotEquals(
                service.hash("203.0.113.10", "poll:one"),
                service.hash("203.0.113.10", "poll:two")
        );
    }

    @Test
    void rejectsWeakSecrets() {
        PrivacyHashService service = new PrivacyHashService("too-short");

        assertThrows(IllegalStateException.class, () -> service.hash("value", "scope"));
    }
}
