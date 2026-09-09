import { DBSchemaTable, DBStatusResponse, DBQueryExplainResult, SystemArchitectureSpec } from '../types';

export const POSTGRESQL_DDL_SCHEMA = `-- =========================================================================
-- VERTEX ARCHITECTURAL CORE - ENTERPRISE RELATIONAL SCHEMA (POSTGRESQL 16.2)
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- ENUMS
CREATE TYPE user_role_enum AS ENUM (
  'ADMIN', 'PROJECT_MANAGER', 'DESIGNER', 'CLIENT', 'SITE_ENGINEER', 'FINANCE', 'TRADE_CONTRACTOR'
);

CREATE TYPE project_status_enum AS ENUM (
  'PLANNING', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'ON_HOLD'
);

CREATE TYPE invoice_status_enum AS ENUM (
  'DRAFT', 'PENDING', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'VOID'
);

CREATE TYPE pos_method_enum AS ENUM (
  'CARD_TAP', 'CARD_CHIP', 'CARD_SWIPE', 'CARD_ON_FILE', 'WIRE_ESCROW', 'ACH_DEBIT', 'CRYPTO_USDC'
);

CREATE TYPE validation_status_enum AS ENUM (
  'PENDING_REVIEW', 'CLIENT_VALIDATED', 'INTERNAL_APPROVED', 'REJECTED'
);

-- 1. AUTHENTICATION & IAM TABLES
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role user_role_enum NOT NULL DEFAULT 'CLIENT',
  avatar_url TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  security_tier VARCHAR(50) NOT NULL DEFAULT 'STANDARD',
  two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  two_factor_secret_hash VARCHAR(255),
  specialization VARCHAR(255),
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  ip_address INET NOT NULL,
  user_agent TEXT NOT NULL,
  location VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. ENTERPRISE COMPANIES & CONTRACTORS ("CARANIES")
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  company_type VARCHAR(100) NOT NULL, -- General Contractor, Structural Engineering, Millwork
  tax_id VARCHAR(100) NOT NULL,
  contact_person VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  address TEXT NOT NULL,
  trade_credit_limit NUMERIC(15, 2) NOT NULL DEFAULT 50000.00,
  trade_credit_used NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  compliance_verified BOOLEAN NOT NULL DEFAULT TRUE,
  insurance_coi_status VARCHAR(50) NOT NULL DEFAULT 'VALID',
  insurance_expiry_date DATE,
  nda_status VARCHAR(50) NOT NULL DEFAULT 'SIGNED',
  nda_document_id UUID,
  nda_document_url TEXT,
  nda_file_name VARCHAR(255),
  nda_file_size VARCHAR(50),
  nda_signed_at TIMESTAMPTZ,
  nda_signer_name VARCHAR(255),
  nda_crypto_hash VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2B. LEGAL VAULT & EXECUTED NDAS
CREATE TABLE legal_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_number VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL, -- 'CONTRACT', 'NDA', 'DRAW_AGREEMENT', 'LIEN_WAIVER'
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  client_id UUID REFERENCES users(id) ON DELETE SET NULL,
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(50) NOT NULL DEFAULT 'SIGNED_SEALED',
  content TEXT,
  uploaded_file_url TEXT,
  file_name VARCHAR(255),
  file_size VARCHAR(50),
  crypto_hash VARCHAR(255),
  signature_certificate JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. ARCHITECTURAL PORTFOLIO & PROJECTS
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  primary_company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  status project_status_enum NOT NULL DEFAULT 'PLANNING',
  budget NUMERIC(15, 2) NOT NULL CHECK (budget >= 0),
  spent NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  location VARCHAR(255) NOT NULL,
  sqft NUMERIC(10, 2) NOT NULL CHECK (sqft > 0),
  progress_percent INT NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  start_date DATE NOT NULL,
  completion_date DATE NOT NULL,
  escrow_balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  phase_number INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  due_date DATE NOT NULL,
  weightage_percent INT NOT NULL DEFAULT 10,
  allocated_draw NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  draw_released BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES milestones(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'TODO',
  priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
  due_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE task_progress_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption VARCHAR(500),
  uploader_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  validation_status validation_status_enum NOT NULL DEFAULT 'PENDING_REVIEW',
  verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. SERVICE CATALOG & PROCUREMENT SPECIFICATIONS
CREATE TABLE catalog_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  unit VARCHAR(50) NOT NULL DEFAULT 'Unit',
  unit_price NUMERIC(15, 2) NOT NULL CHECK (unit_price >= 0),
  cost_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  lead_time_weeks INT NOT NULL DEFAULT 2,
  in_stock BOOLEAN NOT NULL DEFAULT TRUE,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. FINANCIALS, INVOICING & POINT-OF-SALE (POS)
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number VARCHAR(100) UNIQUE NOT NULL,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  amount NUMERIC(15, 2) NOT NULL CHECK (amount >= 0),
  tax NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  total NUMERIC(15, 2) NOT NULL CHECK (total >= 0),
  status invoice_status_enum NOT NULL DEFAULT 'PENDING',
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  payment_method VARCHAR(100) NOT NULL,
  reference_no VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'COMPLETED',
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE pos_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_number VARCHAR(100) UNIQUE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  subtotal NUMERIC(15, 2) NOT NULL,
  tax NUMERIC(15, 2) NOT NULL,
  contingency_fee NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  total NUMERIC(15, 2) NOT NULL,
  payment_method pos_method_enum NOT NULL,
  card_last_four VARCHAR(4),
  auth_code VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'SETTLED',
  receipt_hash VARCHAR(255) NOT NULL,
  processed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE pos_line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID NOT NULL REFERENCES pos_transactions(id) ON DELETE CASCADE,
  catalog_item_id UUID REFERENCES catalog_items(id) ON DELETE SET NULL,
  sku VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(15, 2) NOT NULL,
  total_price NUMERIC(15, 2) NOT NULL
);

-- 6. PRIVATE 1-ON-1 & GROUP COLLABORATION MESSAGING
CREATE TABLE chat_channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  channel_type VARCHAR(50) NOT NULL, -- 'DIRECT', 'PROJECT', 'GENERAL'
  category VARCHAR(100) NOT NULL,    -- 'DIRECT_MESSAGE', 'CLIENT_SUPPORT', 'PROJECT_ROOM', etc.
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  subtext VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE chat_channel_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id UUID NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_channel_member UNIQUE(channel_id, user_id)
);

CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id UUID NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  text TEXT NOT NULL,
  reply_to_message_id UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. IMMUTABLE AUDIT LOG & COMPLIANCE LEDGER
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL,
  ip_address INET NOT NULL,
  diagnostics TEXT,
  tamper_hash VARCHAR(255) NOT NULL
);

-- INDEXES FOR HIGH-THROUGHPUT QUERY PERFORMANCE
CREATE INDEX idx_projects_client ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_invoices_project ON invoices(project_id);
CREATE INDEX idx_invoices_status ON invoices(status) WHERE status != 'PAID';
CREATE INDEX idx_catalog_tags ON catalog_items USING GIN(tags);
CREATE INDEX idx_chat_members ON chat_channel_members(user_id, channel_id);
CREATE INDEX idx_chat_messages_channel ON chat_messages(channel_id, created_at DESC);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
`;

export const DATABASE_SCHEMA_TABLES: DBSchemaTable[] = [
  {
    name: 'users',
    description: 'Core identities, role-based access control, cryptographic 2FA secret credentials',
    module: 'AUTH_IAM',
    estimatedRowCount: 24,
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, isNullable: false, description: 'Primary UUID v4 identifier' },
      { name: 'email', type: 'VARCHAR(255)', isPrimary: false, isNullable: false, description: 'Unique user email index' },
      { name: 'name', type: 'VARCHAR(255)', isPrimary: false, isNullable: false, description: 'Full legal name' },
      { name: 'role', type: 'user_role_enum', isPrimary: false, isNullable: false, defaultValue: 'CLIENT', description: 'RBAC role tier' },
      { name: 'security_tier', type: 'VARCHAR(50)', isPrimary: false, isNullable: false, defaultValue: 'STANDARD', description: 'IAM governance tier' },
      { name: 'two_factor_enabled', type: 'BOOLEAN', isPrimary: false, isNullable: false, defaultValue: 'FALSE', description: 'TOTP 2FA enrollment flag' },
      { name: 'created_at', type: 'TIMESTAMPTZ', isPrimary: false, isNullable: false, defaultValue: 'NOW()', description: 'Account provisioned timestamp' }
    ],
    indexes: [
      { name: 'pk_users', columns: ['id'], type: 'BTREE', isUnique: true },
      { name: 'uq_users_email', columns: ['email'], type: 'BTREE', isUnique: true },
      { name: 'idx_users_role', columns: ['role'], type: 'BTREE', isUnique: false }
    ],
    triggers: ['trg_users_updated_at']
  },
  {
    name: 'projects',
    description: 'Architectural estates, milestone hierarchies, escrow accounts, and capital budgets',
    module: 'PORTFOLIO',
    estimatedRowCount: 12,
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, isNullable: false, description: 'Unique estate contract ID' },
      { name: 'code', type: 'VARCHAR(50)', isPrimary: false, isNullable: false, description: 'Human-readable project code (e.g. VTX-701)' },
      { name: 'name', type: 'VARCHAR(255)', isPrimary: false, isNullable: false, description: 'Project title' },
      { name: 'client_id', type: 'UUID', isPrimary: false, isNullable: false, references: { table: 'users', column: 'id', onDelete: 'RESTRICT' }, description: 'Client account FK' },
      { name: 'status', type: 'project_status_enum', isPrimary: false, isNullable: false, defaultValue: 'PLANNING', description: 'Phase lifecycle' },
      { name: 'budget', type: 'NUMERIC(15,2)', isPrimary: false, isNullable: false, description: 'Approved contract valuation' },
      { name: 'spent', type: 'NUMERIC(15,2)', isPrimary: false, isNullable: false, defaultValue: '0.00', description: 'Disbursed draws total' },
      { name: 'escrow_balance', type: 'NUMERIC(15,2)', isPrimary: false, isNullable: false, defaultValue: '0.00', description: 'Locked escrow reserve' }
    ],
    indexes: [
      { name: 'pk_projects', columns: ['id'], type: 'BTREE', isUnique: true },
      { name: 'uq_projects_code', columns: ['code'], type: 'BTREE', isUnique: true },
      { name: 'idx_projects_client_status', columns: ['client_id', 'status'], type: 'BTREE', isUnique: false }
    ]
  },
  {
    name: 'catalog_items',
    description: 'Procurement catalog specifications, architectural finishes, SKUs, and lead-time matrices',
    module: 'PROCUREMENT',
    estimatedRowCount: 120,
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, isNullable: false, description: 'Unique catalog item UUID' },
      { name: 'sku', type: 'VARCHAR(100)', isPrimary: false, isNullable: false, description: 'Alphanumeric SKU identifier' },
      { name: 'title', type: 'VARCHAR(255)', isPrimary: false, isNullable: false, description: 'Specification title' },
      { name: 'category', type: 'VARCHAR(100)', isPrimary: false, isNullable: false, description: 'Catalog discipline classification' },
      { name: 'unit_price', type: 'NUMERIC(15,2)', isPrimary: false, isNullable: false, description: 'Base retail unit billing rate' },
      { name: 'cost_price', type: 'NUMERIC(15,2)', isPrimary: false, isNullable: false, description: 'Internal fabrication cost' },
      { name: 'lead_time_weeks', type: 'INT', isPrimary: false, isNullable: false, defaultValue: '2', description: 'Fabrication and delivery lead time' },
      { name: 'tags', type: 'JSONB', isPrimary: false, isNullable: false, defaultValue: '[]', description: 'Fast GIN searchable tags' }
    ],
    indexes: [
      { name: 'pk_catalog_items', columns: ['id'], type: 'BTREE', isUnique: true },
      { name: 'uq_catalog_sku', columns: ['sku'], type: 'BTREE', isUnique: true },
      { name: 'gin_catalog_tags', columns: ['tags'], type: 'GIN', isUnique: false }
    ]
  },
  {
    name: 'invoices',
    description: 'Contract draw statements, progress billings, tax calculations, and payment tracking',
    module: 'FINANCIALS_POS',
    estimatedRowCount: 340,
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, isNullable: false, description: 'Unique invoice UUID' },
      { name: 'invoice_number', type: 'VARCHAR(100)', isPrimary: false, isNullable: false, description: 'Fiscal invoice serial number' },
      { name: 'project_id', type: 'UUID', isPrimary: false, isNullable: false, references: { table: 'projects', column: 'id', onDelete: 'RESTRICT' }, description: 'Target estate project' },
      { name: 'client_id', type: 'UUID', isPrimary: false, isNullable: false, references: { table: 'users', column: 'id', onDelete: 'RESTRICT' }, description: 'Billed client entity' },
      { name: 'amount', type: 'NUMERIC(15,2)', isPrimary: false, isNullable: false, description: 'Subtotal before tax' },
      { name: 'tax', type: 'NUMERIC(15,2)', isPrimary: false, isNullable: false, defaultValue: '0.00', description: 'Municipal/State tax' },
      { name: 'total', type: 'NUMERIC(15,2)', isPrimary: false, isNullable: false, description: 'Gross payable total' },
      { name: 'status', type: 'invoice_status_enum', isPrimary: false, isNullable: false, defaultValue: 'PENDING', description: 'Settlement state' }
    ],
    indexes: [
      { name: 'pk_invoices', columns: ['id'], type: 'BTREE', isUnique: true },
      { name: 'uq_invoices_number', columns: ['invoice_number'], type: 'BTREE', isUnique: true },
      { name: 'idx_invoices_pending', columns: ['status', 'due_date'], type: 'PARTIAL', isUnique: false, predicate: "status != 'PAID'" }
    ]
  },
  {
    name: 'chat_channels',
    description: 'Role-scoped private 1-to-1 direct messaging and multi-party project collaboration rooms',
    module: 'COLLABORATION',
    estimatedRowCount: 65,
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, isNullable: false, description: 'Unique channel UUID' },
      { name: 'name', type: 'VARCHAR(255)', isPrimary: false, isNullable: false, description: 'Channel room title' },
      { name: 'channel_type', type: 'VARCHAR(50)', isPrimary: false, isNullable: false, description: 'DIRECT | PROJECT | GENERAL' },
      { name: 'category', type: 'VARCHAR(100)', isPrimary: false, isNullable: false, description: 'DIRECT_MESSAGE | CLIENT_SUPPORT | PROJECT_ROOM' },
      { name: 'project_id', type: 'UUID', isPrimary: false, isNullable: true, references: { table: 'projects', column: 'id', onDelete: 'SET NULL' }, description: 'Linked estate project' }
    ],
    indexes: [
      { name: 'pk_chat_channels', columns: ['id'], type: 'BTREE', isUnique: true },
      { name: 'idx_chat_channel_type', columns: ['channel_type', 'category'], type: 'BTREE', isUnique: false }
    ]
  },
  {
    name: 'audit_logs',
    description: 'Append-only immutable audit trail recording all financial events, IAM changes, and logins',
    module: 'GOVERNANCE',
    estimatedRowCount: 14850,
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, isNullable: false, description: 'Log entry UUID' },
      { name: 'timestamp', type: 'TIMESTAMPTZ', isPrimary: false, isNullable: false, defaultValue: 'NOW()', description: 'UTC timestamp of action' },
      { name: 'user_id', type: 'UUID', isPrimary: false, isNullable: true, references: { table: 'users', column: 'id', onDelete: 'SET NULL' }, description: 'Actor UUID' },
      { name: 'action', type: 'VARCHAR(255)', isPrimary: false, isNullable: false, description: 'Verb/Action name' },
      { name: 'category', type: 'VARCHAR(100)', isPrimary: false, isNullable: false, description: 'System domain' },
      { name: 'ip_address', type: 'INET', isPrimary: false, isNullable: false, description: 'Origin IP address' },
      { name: 'tamper_hash', type: 'VARCHAR(255)', isPrimary: false, isNullable: false, description: 'SHA-256 cryptographic chain hash' }
    ],
    indexes: [
      { name: 'pk_audit_logs', columns: ['id'], type: 'BTREE', isUnique: true },
      { name: 'idx_audit_logs_timestamp_desc', columns: ['timestamp'], type: 'BTREE', isUnique: false }
    ]
  },
  {
    name: 'companies',
    description: 'Contractor companies, trade partner entities, trade credit limits, and executed NDA credentials',
    module: 'PORTFOLIO',
    estimatedRowCount: 48,
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, isNullable: false, description: 'Primary company UUID' },
      { name: 'name', type: 'VARCHAR(255)', isPrimary: false, isNullable: false, description: 'Trading commercial name' },
      { name: 'company_type', type: 'VARCHAR(100)', isPrimary: false, isNullable: false, description: 'Contractor discipline (e.g. General Contractor, Joinery)' },
      { name: 'tax_id', type: 'VARCHAR(100)', isPrimary: false, isNullable: false, description: 'EIN / Tax Registration' },
      { name: 'contact_person', type: 'VARCHAR(255)', isPrimary: false, isNullable: false, description: 'Primary corporate liaison' },
      { name: 'email', type: 'VARCHAR(255)', isPrimary: false, isNullable: false, description: 'Corporate contact email' },
      { name: 'phone', type: 'VARCHAR(50)', isPrimary: false, isNullable: false, description: 'Phone number' },
      { name: 'trade_credit_limit', type: 'NUMERIC(15,2)', isPrimary: false, isNullable: false, defaultValue: '50000.00', description: 'Underwritten credit line' },
      { name: 'nda_status', type: 'VARCHAR(50)', isPrimary: false, isNullable: false, defaultValue: 'SIGNED', description: 'Mutual NDA binding status' },
      { name: 'nda_document_id', type: 'UUID', isPrimary: false, isNullable: true, references: { table: 'legal_documents', column: 'id', onDelete: 'SET NULL' }, description: 'FK to legal document vault' },
      { name: 'nda_file_name', type: 'VARCHAR(255)', isPrimary: false, isNullable: true, description: 'Uploaded executed NDA file name' },
      { name: 'nda_crypto_hash', type: 'VARCHAR(255)', isPrimary: false, isNullable: true, description: 'Tamper-proof SHA-256 digital seal' },
      { name: 'created_at', type: 'TIMESTAMPTZ', isPrimary: false, isNullable: false, defaultValue: 'NOW()', description: 'Registration timestamp' }
    ],
    indexes: [
      { name: 'pk_companies', columns: ['id'], type: 'BTREE', isUnique: true },
      { name: 'idx_companies_type', columns: ['company_type'], type: 'BTREE', isUnique: false },
      { name: 'idx_companies_nda', columns: ['nda_status'], type: 'BTREE', isUnique: false }
    ]
  },
  {
    name: 'legal_documents',
    description: 'Cryptographically sealed legal agreements, executed contractor NDAs, and AIA covenants vault',
    module: 'GOVERNANCE',
    estimatedRowCount: 120,
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, isNullable: false, description: 'Unique legal document UUID' },
      { name: 'document_number', type: 'VARCHAR(100)', isPrimary: false, isNullable: false, description: 'Unique legal tracking number' },
      { name: 'title', type: 'VARCHAR(255)', isPrimary: false, isNullable: false, description: 'Document covenant title' },
      { name: 'category', type: 'VARCHAR(100)', isPrimary: false, isNullable: false, description: 'Classification: NDA, CONTRACT, DRAW_AGREEMENT, LIEN_WAIVER' },
      { name: 'company_id', type: 'UUID', isPrimary: false, isNullable: true, references: { table: 'companies', column: 'id', onDelete: 'SET NULL' }, description: 'Associated contractor entity FK' },
      { name: 'project_id', type: 'UUID', isPrimary: false, isNullable: true, references: { table: 'projects', column: 'id', onDelete: 'SET NULL' }, description: 'Associated project FK' },
      { name: 'status', type: 'VARCHAR(50)', isPrimary: false, isNullable: false, defaultValue: 'SIGNED_SEALED', description: 'Execution and sealing state' },
      { name: 'file_name', type: 'VARCHAR(255)', isPrimary: false, isNullable: true, description: 'Original uploaded filename' },
      { name: 'crypto_hash', type: 'VARCHAR(255)', isPrimary: false, isNullable: true, description: 'SHA-256 cryptographic verification checksum' },
      { name: 'created_at', type: 'TIMESTAMPTZ', isPrimary: false, isNullable: false, defaultValue: 'NOW()', description: 'Uploaded and sealed timestamp' }
    ],
    indexes: [
      { name: 'pk_legal_documents', columns: ['id'], type: 'BTREE', isUnique: true },
      { name: 'uq_legal_docs_num', columns: ['document_number'], type: 'BTREE', isUnique: true },
      { name: 'idx_legal_docs_company', columns: ['company_id'], type: 'BTREE', isUnique: false },
      { name: 'idx_legal_docs_category', columns: ['category'], type: 'BTREE', isUnique: false }
    ]
  }
];

export const SYSTEM_ARCHITECTURE_SPEC: SystemArchitectureSpec = {
  ingress: {
    anycastIps: ['34.149.88.102', '34.149.88.103'],
    cdnProvider: 'Google Cloud CDN + Cloudflare Enterprise Anycast',
    edgeLocationsCount: 310,
    sslTlsVersion: 'TLS 1.3 / HTTP/3 QUIC Enabled',
    wafRulesActive: 42
  },
  cluster: {
    orchestrator: 'Kubernetes GKE / Cloud Run',
    activeReplicas: 12,
    minReplicas: 6,
    maxReplicas: 64,
    cpuTargetPercent: 70,
    hpaTriggers: ['CPU > 70%', 'Memory > 75%', 'HTTP Request Rate > 2,000 req/sec']
  },
  caching: {
    engine: 'Redis Distributed Cache 7.2',
    topology: 'Primary-Replica Cluster with SWR',
    cacheTTLSeconds: 15,
    evictionPolicy: 'allkeys-lru'
  },
  database: {
    primaryEngine: 'PostgreSQL 16.2 Enterprise',
    highAvailability: 'Multi-Region Read Replicas',
    connectionPooler: 'PgBouncer in Transaction Mode',
    backupPolicy: 'Point-in-Time Recovery (PITR) 35-day retention'
  },
  storage: {
    blobProvider: 'Google Cloud Storage / AWS S3 Multi-Region',
    encryption: 'AES-256 GCM Customer-Managed Key',
    immutableWormAuditRetentionDays: 2555
  },
  sla: {
    availabilityTarget: '99.99%',
    rpoMinutes: 0,
    rtoSeconds: 28,
    p99LatencyTargetMs: 45
  }
};
