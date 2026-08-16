-- =============================================================================
-- Fuerza UPT Backend — Baseline PostgreSQL Aligned with Current JPA Model
-- 100% Relational Schema Baseline
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SEGURIDAD Y USUARIOS
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    display_name VARCHAR(255) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS user_identities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    provider_subject VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_user_identity_provider_subject UNIQUE (provider, provider_subject)
);

CREATE TABLE IF NOT EXISTS login_attempts (
    attempt_key VARCHAR(320) PRIMARY KEY,
    failures INT NOT NULL DEFAULT 1,
    window_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    blocked_until TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS request_rate_limits (
    operation VARCHAR(50) NOT NULL,
    client_key VARCHAR(255) NOT NULL,
    window_started_at TIMESTAMPTZ NOT NULL,
    request_count INT NOT NULL DEFAULT 1,
    PRIMARY KEY (operation, client_key)
);

-- 2. MULTIMEDIA
CREATE TABLE IF NOT EXISTS media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    size_bytes BIGINT NOT NULL,
    bucket_name VARCHAR(100) NOT NULL,
    url TEXT NOT NULL,
    is_private BOOLEAN NOT NULL DEFAULT FALSE,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. REPRESENTACION ESTUDIANTIL
CREATE TABLE IF NOT EXISTS representation_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    summary TEXT NOT NULL,
    kind VARCHAR(50) NOT NULL DEFAULT 'PROPOSAL',
    progress VARCHAR(50) NOT NULL DEFAULT 'PRESENTADO',
    progress_percentage INT DEFAULT 0,
    impact_level VARCHAR(50),
    beneficiary_area VARCHAR(255) NOT NULL,
    identified_problem TEXT,
    proposal_or_management TEXT NOT NULL,
    result TEXT,
    last_update TIMESTAMPTZ,
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    content_status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    display_order INT NOT NULL DEFAULT 0,
    cover_image_url VARCHAR(1000),
    related_project_id UUID,
    related_event_id UUID,
    related_opportunity_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS representation_evidence (
    representation_id UUID NOT NULL REFERENCES representation_items(id) ON DELETE CASCADE,
    media_asset_id UUID NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
    display_order INT NOT NULL DEFAULT 0,
    PRIMARY KEY (representation_id, media_asset_id)
);

CREATE TABLE IF NOT EXISTS representation_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    representation_id UUID NOT NULL REFERENCES representation_items(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    action_date DATE,
    display_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(180) NOT NULL UNIQUE,
    author_name VARCHAR(180) NOT NULL,
    author_career VARCHAR(180) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'Experiencia',
    quote TEXT NOT NULL,
    full_story TEXT,
    image_url TEXT,
    video_url TEXT,
    featured_in_hero BOOLEAN NOT NULL DEFAULT FALSE,
    content_status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    display_order INT NOT NULL DEFAULT 0,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL DEFAULT 0
);

-- 4. PROYECTOS
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(180) NOT NULL,
    slug VARCHAR(180) NOT NULL UNIQUE,
    summary VARCHAR(600),
    description TEXT,
    problem TEXT,
    objective TEXT,
    category VARCHAR(100),
    project_status VARCHAR(30) NOT NULL DEFAULT 'PLANNING',
    beneficiaries VARCHAR(255),
    start_date DATE,
    end_date DATE,
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    content_status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    display_order INT NOT NULL DEFAULT 0,
    cover_image_url TEXT,
    cover_media_id UUID REFERENCES media_assets(id) ON DELETE SET NULL,
    cover_alt_text VARCHAR(255),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS project_gallery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    media_asset_id UUID REFERENCES media_assets(id) ON DELETE CASCADE,
    image_url VARCHAR(1000),
    alternative_text VARCHAR(255),
    display_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS project_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    description VARCHAR(500) NOT NULL,
    display_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS project_responsibles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    display_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS project_partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    logo_url VARCHAR(1000),
    display_order INT NOT NULL DEFAULT 0
);

-- 5. EVENTOS
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(180) NOT NULL,
    slug VARCHAR(180) NOT NULL UNIQUE,
    summary VARCHAR(600),
    description TEXT,
    cover_image_url TEXT,
    category VARCHAR(100),
    start_date DATE,
    end_date DATE,
    event_time VARCHAR(50),
    modality VARCHAR(30) NOT NULL DEFAULT 'PRESENCIAL',
    location VARCHAR(255),
    organizer VARCHAR(255),
    registration_mode VARCHAR(20) NOT NULL DEFAULT 'NONE',
    registration_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    registration_url TEXT,
    capacity INT,
    event_status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    content_status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    display_order INT NOT NULL DEFAULT 0,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_event_registration_mode CHECK (registration_mode IN ('NONE', 'INTERNAL', 'EXTERNAL'))
);

CREATE TABLE IF NOT EXISTS event_speakers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    display_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    career VARCHAR(255),
    student_code VARCHAR(50),
    registration_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status VARCHAR(20) NOT NULL DEFAULT 'NEW',
    notes TEXT,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_hash VARCHAR(64),
    user_agent VARCHAR(512)
);

-- 6. OPORTUNIDADES
CREATE TABLE IF NOT EXISTS opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(180) NOT NULL,
    slug VARCHAR(180) NOT NULL UNIQUE,
    summary VARCHAR(600),
    description TEXT,
    cover_image_url TEXT,
    opportunity_type VARCHAR(50) NOT NULL,
    institution VARCHAR(255),
    deadline DATE,
    country_or_modality VARCHAR(100),
    official_url TEXT,
    application_url TEXT,
    opportunity_status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    content_status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    display_order INT NOT NULL DEFAULT 0,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS opportunity_benefits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    display_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS opportunity_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    display_order INT NOT NULL DEFAULT 0
);

-- 7. EQUIPO
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100),
    career VARCHAR(100),
    description TEXT,
    category VARCHAR(50) NOT NULL DEFAULT 'MEMBER',
    location VARCHAR(100),
    email VARCHAR(255),
    notification_email VARCHAR(255),
    receive_applications BOOLEAN NOT NULL DEFAULT FALSE,
    image_media_id UUID REFERENCES media_assets(id) ON DELETE SET NULL,
    content_status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    display_order INT NOT NULL DEFAULT 0,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_team_notification_email CHECK (
        receive_applications = FALSE
        OR (
            notification_email IS NOT NULL
            AND btrim(notification_email) <> ''
        )
    )
);

CREATE TABLE IF NOT EXISTS team_social_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    url VARCHAR(1000) NOT NULL,
    display_order INT NOT NULL DEFAULT 0
);

-- 8. ESTADISTICAS E IMPACTO
CREATE TABLE IF NOT EXISTS statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stat_key VARCHAR(100) NOT NULL UNIQUE,
    label VARCHAR(255) NOT NULL,
    value VARCHAR(50) NOT NULL,
    source VARCHAR(255),
    is_verified BOOLEAN NOT NULL DEFAULT TRUE,
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    content_status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    version BIGINT NOT NULL DEFAULT 0
);

-- 9. FORMULARIOS PUBLICOS Y SUBMISSIONS
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'NEW',
    notes TEXT,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_hash VARCHAR(64),
    user_agent VARCHAR(512)
);

CREATE TABLE IF NOT EXISTS student_proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_name VARCHAR(255) NOT NULL,
    student_code VARCHAR(50),
    career VARCHAR(255),
    proposal_text TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'NEW',
    notes TEXT,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_hash VARCHAR(64),
    user_agent VARCHAR(512)
);

CREATE TABLE IF NOT EXISTS team_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    motivation TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'NEW',
    notes TEXT,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_hash VARCHAR(64),
    user_agent VARCHAR(512)
);

CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    status VARCHAR(20) NOT NULL DEFAULT 'NEW',
    notes TEXT,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_hash VARCHAR(64),
    user_agent VARCHAR(512)
);

-- 10. AUDITORIA
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    before_data JSONB,
    after_data JSONB,
    request_id VARCHAR(100),
    ip_address VARCHAR(45),
    user_agent VARCHAR(512),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. ENCUESTAS
CREATE TABLE IF NOT EXISTS polls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    allow_anonymous BOOLEAN NOT NULL DEFAULT TRUE,
    show_results BOOLEAN NOT NULL DEFAULT FALSE,
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    start_at TIMESTAMPTZ,
    end_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS poll_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    question_text VARCHAR(600) NOT NULL,
    question_type VARCHAR(30) NOT NULL,
    required BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS poll_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES poll_questions(id) ON DELETE CASCADE,
    label VARCHAR(255) NOT NULL,
    display_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS poll_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    respondent_fingerprint VARCHAR(64) NOT NULL,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_hash VARCHAR(64) NOT NULL,
    user_agent_hash VARCHAR(64)
);

CREATE TABLE IF NOT EXISTS poll_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    response_id UUID NOT NULL REFERENCES poll_responses(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES poll_questions(id) ON DELETE CASCADE,
    option_id UUID REFERENCES poll_options(id) ON DELETE SET NULL,
    rating_value INT,
    text_value VARCHAR(500)
);

-- 12. CONFIGURACION INSTITUCIONAL
CREATE TABLE IF NOT EXISTS site_settings (
    id BOOLEAN PRIMARY KEY DEFAULT TRUE,
    email VARCHAR(255),
    whatsapp VARCHAR(50),
    instagram VARCHAR(255),
    facebook VARCHAR(255),
    tiktok VARCHAR(255),
    youtube VARCHAR(255),
    address VARCHAR(255),
    main_message TEXT,
    contact_text TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_site_settings_single_row CHECK (id = TRUE)
);

-- 13. CACHE INVALIDATION
CREATE TABLE IF NOT EXISTS cache_invalidation_events (
    id BIGSERIAL PRIMARY KEY,
    module VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- INDICES ESTRATEGICOS PARA CONSULTAS Y RELACIONES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_projects_status_order ON projects (content_status, display_order ASC);
CREATE INDEX IF NOT EXISTS idx_events_status_start ON events (event_status, start_date ASC);
CREATE INDEX IF NOT EXISTS idx_opportunities_status_deadline ON opportunities (opportunity_status, deadline ASC);
CREATE INDEX IF NOT EXISTS idx_team_status_order ON team_members (content_status, display_order ASC);
CREATE INDEX IF NOT EXISTS idx_representation_status_order ON representation_items (content_status, display_order ASC);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_window ON login_attempts (window_started_at);

-- =============================================================================
-- SEEDS OPERATIVOS OBLIGATORIOS (ROLES BASE Y CONFIGURACION)
-- =============================================================================
INSERT INTO roles (id, name, description)
VALUES 
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'ADMIN', 'Rol con privilegios de administracion total del sistema'),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'USER', 'Rol base para estudiantes y usuarios autenticados')
ON CONFLICT (name) DO NOTHING;

INSERT INTO site_settings (id, email, whatsapp, main_message, updated_at, version)
VALUES (TRUE, 'equipo@fuerzaupt.pe', '+51900000000', 'Mensaje institucional Fuerza UPT', NOW(), 0)
ON CONFLICT (id) DO NOTHING;
