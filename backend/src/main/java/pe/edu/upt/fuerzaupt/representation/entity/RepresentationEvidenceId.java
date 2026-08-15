package pe.edu.upt.fuerzaupt.representation.entity;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.UUID;

@Getter
@Setter
@EqualsAndHashCode
public class RepresentationEvidenceId implements Serializable {
    private UUID representation;
    private UUID mediaAssetId;
}
