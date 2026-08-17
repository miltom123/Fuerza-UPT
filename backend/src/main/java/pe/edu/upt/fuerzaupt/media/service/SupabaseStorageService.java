package pe.edu.upt.fuerzaupt.media.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.multipart.MultipartFile;
import pe.edu.upt.fuerzaupt.common.exception.BusinessException;
import pe.edu.upt.fuerzaupt.common.exception.ResourceNotFoundException;
import pe.edu.upt.fuerzaupt.media.dto.MediaAssetResponse;
import pe.edu.upt.fuerzaupt.media.dto.SignedMediaUrlResponse;
import pe.edu.upt.fuerzaupt.media.entity.MediaAsset;
import pe.edu.upt.fuerzaupt.media.repository.MediaAssetRepository;
import pe.edu.upt.fuerzaupt.security.CustomUserDetails;

import java.io.IOException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
public class SupabaseStorageService {

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;
    private static final long TEAM_IMAGE_MAX_FILE_SIZE = 5 * 1024 * 1024;
    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"
    );
    private static final Set<String> TEAM_IMAGE_TYPES = Set.of("image/jpeg", "image/png", "image/webp");

    private final MediaAssetRepository mediaAssetRepository;
    private final RestClient restClient;
    private final String supabaseUrl;
    private final String serviceRoleKey;
    private final String publicBucket;
    private final String privateBucket;
    private final String teamBucket;

    public SupabaseStorageService(
            MediaAssetRepository mediaAssetRepository,
            RestClient.Builder restClientBuilder,
            @Value("${app.supabase.url:}") String supabaseUrl,
            @Value("${app.supabase.service-role-key:}") String serviceRoleKey,
            @Value("${app.supabase.public-bucket:public-content}") String publicBucket,
            @Value("${app.supabase.private-bucket:representation-evidence}") String privateBucket,
            @Value("${app.supabase.team-bucket:team-members}") String teamBucket
    ) {
        this.mediaAssetRepository = mediaAssetRepository;
        this.restClient = restClientBuilder.build();
        this.supabaseUrl = supabaseUrl.replaceAll("/$", "");
        this.serviceRoleKey = serviceRoleKey;
        this.publicBucket = publicBucket;
        this.privateBucket = privateBucket;
        this.teamBucket = teamBucket;
    }

    @Transactional(readOnly = true)
    public List<MediaAssetResponse> list(int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 100));
        return mediaAssetRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, safeLimit))
                .stream()
                .map(this::map)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MediaAssetResponse get(UUID id) {
        return mediaAssetRepository.findById(id)
                .map(this::map)
                .orElseThrow(() -> new ResourceNotFoundException("Archivo no encontrado."));
    }

    @Transactional
    public MediaAssetResponse upload(MultipartFile file, boolean privateAsset, Authentication authentication) {
        return upload(file, MAX_FILE_SIZE, ALLOWED_TYPES, privateAsset ? privateBucket : publicBucket,
                privateAsset ? "evidence/" : "content/", privateAsset, authentication);
    }

    @Transactional
    public MediaAssetResponse uploadTeamMemberImage(
            UUID teamMemberId,
            MultipartFile file,
            Authentication authentication
    ) {
        return upload(file, TEAM_IMAGE_MAX_FILE_SIZE, TEAM_IMAGE_TYPES, teamBucket,
                teamMemberId + "/", false, authentication);
    }

    private MediaAssetResponse upload(
            MultipartFile file,
            long maxFileSize,
            Set<String> allowedTypes,
            String bucket,
            String prefix,
            boolean privateAsset,
            Authentication authentication
    ) {
        boolean useLocal = serviceRoleKey == null || serviceRoleKey.isBlank();
        byte[] bytes = read(file, maxFileSize);
        String detectedType = detectContentType(bytes, allowedTypes);
        String originalName = file.getOriginalFilename() == null ? "archivo" : file.getOriginalFilename();
        String storedName = prefix + UUID.randomUUID() + extensionFor(detectedType);
        String objectUrl = supabaseUrl + "/storage/v1/object/" + bucket + "/" + storedName;
        String storedUrl = privateAsset
                ? objectUrl
                : supabaseUrl + "/storage/v1/object/public/" + bucket + "/" + storedName;

        if (useLocal) {
            try {
                java.io.File uploadDir = new java.io.File("../frontend/public/uploads");
                if (!uploadDir.exists()) uploadDir.mkdirs();
                String flatName = storedName.replace("/", "_");
                java.io.File target = new java.io.File(uploadDir, flatName);
                java.nio.file.Files.write(target.toPath(), bytes);
                storedUrl = "/uploads/" + flatName;
                log.info("Simulated local upload: saved to {}", target.getAbsolutePath());
            } catch (IOException e) {
                throw new BusinessException("Error al simular la subida local: " + e.getMessage());
            }
        } else {
            try {
                restClient.post()
                        .uri(objectUrl)
                        .header("Authorization", "Bearer " + serviceRoleKey)
                        .header("apikey", serviceRoleKey)
                        .contentType(MediaType.parseMediaType(detectedType))
                        .body(bytes)
                        .retrieve()
                        .toBodilessEntity();
            } catch (RestClientResponseException exception) {
                int status = exception.getStatusCode().value();
                log.warn("Supabase Storage upload failed: op=UPLOAD bucket={} status={}", bucket, status);
                if (status == 400) {
                    throw new BusinessException("El archivo seleccionado no es válido.");
                } else if (status == 413 || status == 422) {
                    throw new BusinessException("La imagen supera el tamaño máximo permitido.");
                } else if (status == 401 || status == 403) {
                    throw new BusinessException("Error de autenticación con el servicio de almacenamiento.");
                } else if (status == 404) {
                    throw new BusinessException("El contenedor de almacenamiento '" + bucket + "' no fue encontrado o no está configurado.");
                } else {
                    throw new BusinessException("No se pudo almacenar la imagen en el proveedor de almacenamiento.");
                }
            } catch (RuntimeException exception) {
                log.warn("Supabase Storage upload error: op=UPLOAD bucket={} error={}", bucket, exception.getMessage());
                throw new BusinessException("No se pudo almacenar la imagen. Inténtalo nuevamente.");
            }
        }

        UUID id = UUID.randomUUID();
        UUID userId = authentication != null && authentication.getPrincipal() instanceof CustomUserDetails principal
                ? principal.getId()
                : null;
        MediaAssetResponse pending = new MediaAssetResponse(
                id, storedName, originalName, detectedType, bytes.length, bucket, storedUrl, privateAsset, Instant.now()
        );
        try {
            MediaAsset entity = new MediaAsset();
            entity.setId(id);
            entity.setFileName(storedName);
            entity.setOriginalName(originalName);
            entity.setContentType(detectedType);
            entity.setSizeBytes((long) bytes.length);
            entity.setBucketName(bucket);
            entity.setUrl(storedUrl);
            entity.setUploadedBy(userId);
            entity.setPrivateAsset(privateAsset);

            MediaAsset saved = mediaAssetRepository.save(entity);
            return map(saved);
        } catch (RuntimeException databaseFailure) {
            try {
                deleteRemote(pending);
            } catch (RuntimeException cleanupFailure) {
                databaseFailure.addSuppressed(cleanupFailure);
                log.error("Could not compensate object after media database failure: {}/{}", bucket, storedName,
                        cleanupFailure);
            }
            throw databaseFailure;
        }
    }

    @Transactional
    public MediaAssetResponse delete(UUID id) {
        MediaAssetResponse asset = get(id);
        deleteRemote(asset);
        mediaAssetRepository.deleteById(id);
        return asset;
    }

    public void discard(MediaAssetResponse asset) {
        if (asset == null) return;
        try {
            deleteRemote(asset);
        } catch (RuntimeException exception) {
            log.error("Could not compensate uploaded object {}/{}", asset.bucketName(), asset.fileName(), exception);
        }
        try {
            mediaAssetRepository.deleteById(asset.id());
        } catch (RuntimeException exception) {
            log.debug("The compensated media row will be removed by transaction rollback: {}", asset.id());
        }
    }

    @Transactional(readOnly = true)
    public SignedMediaUrlResponse signedUrl(UUID id, int expiresInSeconds) {
        MediaAssetResponse asset = get(id);
        if (!asset.privateAsset()) {
            return new SignedMediaUrlResponse(asset.url(), null);
        }
        if (serviceRoleKey == null || serviceRoleKey.isBlank()) {
            return new SignedMediaUrlResponse(asset.url(), Instant.now().plus(expiresInSeconds, ChronoUnit.SECONDS));
        }
        int safeExpiration = Math.max(60, Math.min(expiresInSeconds, 3600));
        try {
            Map<?, ?> result = restClient.post()
                    .uri(supabaseUrl + "/storage/v1/object/sign/" + asset.bucketName() + "/" + asset.fileName())
                    .header("Authorization", "Bearer " + serviceRoleKey)
                    .header("apikey", serviceRoleKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("expiresIn", safeExpiration))
                    .retrieve()
                    .body(Map.class);
            Object signedPath = result == null ? null : result.get("signedURL");
            if (signedPath == null && result != null) signedPath = result.get("signedUrl");
            if (signedPath == null) throw new BusinessException("Storage no devolvio una URL firmada.");
            String value = signedPath.toString();
            String url = value.startsWith("http") ? value : supabaseUrl + "/storage/v1" + value;
            return new SignedMediaUrlResponse(url, Instant.now().plus(safeExpiration, ChronoUnit.SECONDS));
        } catch (BusinessException exception) {
            throw exception;
        } catch (RuntimeException exception) {
            log.warn("Supabase signed URL failed: {}", exception.getMessage());
            throw new BusinessException("No se pudo firmar el acceso al archivo.");
        }
    }

    private void deleteRemote(MediaAssetResponse asset) {
        if ("frontend-public".equals(asset.bucketName())) return;
        if (serviceRoleKey == null || serviceRoleKey.isBlank()) {
            if (asset.url() != null && asset.url().startsWith("/uploads/")) {
                java.io.File file = new java.io.File("../frontend/public" + asset.url());
                if (file.exists()) file.delete();
            }
            return;
        }
        try {
            restClient.delete()
                    .uri(supabaseUrl + "/storage/v1/object/" + asset.bucketName() + "/" + asset.fileName())
                    .header("Authorization", "Bearer " + serviceRoleKey)
                    .header("apikey", serviceRoleKey)
                    .retrieve()
                    .toBodilessEntity();
        } catch (RuntimeException exception) {
            log.warn("Supabase Storage delete failed: {}", exception.getMessage());
            throw new BusinessException("No se pudo eliminar el archivo del almacenamiento.");
        }
    }

    private byte[] read(MultipartFile file, long maxFileSize) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("El archivo seleccionado está vacío.");
        }
        if (file.getSize() > maxFileSize) {
            long maxMb = maxFileSize / (1024 * 1024);
            throw new BusinessException("La imagen supera el tamaño máximo permitido de " + maxMb + " MB.");
        }
        try {
            return file.getBytes();
        } catch (IOException exception) {
            throw new BusinessException("No se pudo leer el archivo recibido.");
        }
    }

    private String detectContentType(byte[] bytes, Set<String> allowedTypes) {
        String type = null;
        if (startsWith(bytes, 0xFF, 0xD8, 0xFF)) type = "image/jpeg";
        else if (startsWith(bytes, 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A)) type = "image/png";
        else if (ascii(bytes, 0, "GIF87a") || ascii(bytes, 0, "GIF89a")) type = "image/gif";
        else if (ascii(bytes, 0, "RIFF") && ascii(bytes, 8, "WEBP")) type = "image/webp";
        else if (ascii(bytes, 0, "%PDF-")) type = "application/pdf";
        if (type == null || !allowedTypes.contains(type)) {
            throw new BusinessException("El formato del archivo no está permitido. Formatos admitidos: JPG, PNG, WEBP.");
        }
        return type;
    }

    private boolean startsWith(byte[] bytes, int... signature) {
        if (bytes.length < signature.length) return false;
        for (int index = 0; index < signature.length; index++) {
            if ((bytes[index] & 0xFF) != signature[index]) return false;
        }
        return true;
    }

    private boolean ascii(byte[] bytes, int offset, String expected) {
        if (bytes.length < offset + expected.length()) return false;
        for (int index = 0; index < expected.length(); index++) {
            if (bytes[offset + index] != (byte) expected.charAt(index)) return false;
        }
        return true;
    }

    private String extensionFor(String contentType) {
        return switch (contentType.toLowerCase(Locale.ROOT)) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            case "application/pdf" -> ".pdf";
            default -> "";
        };
    }

    private MediaAssetResponse map(MediaAsset asset) {
        return new MediaAssetResponse(
                asset.getId(), asset.getFileName(), asset.getOriginalName(),
                asset.getContentType(), asset.getSizeBytes(), asset.getBucketName(),
                asset.getUrl(), asset.getPrivateAsset(), asset.getCreatedAt()
        );
    }
}
