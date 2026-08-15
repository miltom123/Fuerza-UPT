package pe.edu.upt.fuerzaupt.representation.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "representation_evidence")
@IdClass(RepresentationEvidenceId.class)
public class RepresentationEvidence {
    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "representation_id", nullable = false)
    private RepresentationItem representation;

    @Id
    @Column(name = "media_asset_id", nullable = false)
    private UUID mediaAssetId;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;
}
