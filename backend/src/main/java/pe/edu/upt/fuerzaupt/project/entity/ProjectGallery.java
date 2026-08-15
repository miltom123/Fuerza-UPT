package pe.edu.upt.fuerzaupt.project.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "project_gallery")
public class ProjectGallery {
    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "media_asset_id", nullable = false)
    private UUID mediaAssetId;

    @Column(name = "alternative_text", length = 255)
    private String alternativeText;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;
}
