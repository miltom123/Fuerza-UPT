package pe.edu.upt.fuerzaupt.submission.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class RequestRateLimitId implements Serializable {

    @Column(name = "operation", length = 50, nullable = false)
    private String operation;

    @Column(name = "client_key", length = 255, nullable = false)
    private String clientKey;
}
