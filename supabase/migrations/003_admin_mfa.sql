-- ============================================
-- Admins table (replaces profiles.is_admin)
-- ============================================
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'editor' CHECK (role IN ('owner', 'editor', 'reviewer', 'analyst')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  mfa_enrolled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admins_role ON admins(role);
CREATE INDEX IF NOT EXISTS idx_admins_active ON admins(is_active) WHERE is_active = TRUE;

-- ============================================
-- Admin audit logs
-- ============================================
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  detail JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_admin ON admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_created ON admin_audit_logs(created_at DESC);

-- ============================================
-- MFA rate limiting
-- ============================================
CREATE TABLE IF NOT EXISTS admin_mfa_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address INET NOT NULL,
  admin_id UUID REFERENCES admins(id) ON DELETE CASCADE,
  success BOOLEAN NOT NULL DEFAULT FALSE,
  attempted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mfa_attempts_ip ON admin_mfa_attempts(ip_address, attempted_at DESC);

-- Helper: count recent MFA failures for rate limiting
CREATE OR REPLACE FUNCTION count_recent_mfa_failures(p_ip INET, p_minutes INT DEFAULT 10)
RETURNS INT AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM admin_mfa_attempts
    WHERE ip_address = p_ip
      AND success = FALSE
      AND attempted_at > NOW() - (p_minutes || ' minutes')::INTERVAL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- RLS policies
-- ============================================
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_mfa_attempts ENABLE ROW LEVEL SECURITY;

-- Admins can read their own record
CREATE POLICY "Admins can view own record"
  ON admins FOR SELECT
  USING (auth.uid() = id);

-- Service role manages everything else (via createAdminClient)
-- Audit logs: admins can read own logs
CREATE POLICY "Admins can view own audit logs"
  ON admin_audit_logs FOR SELECT
  USING (auth.uid() = admin_id);

-- MFA attempts: no direct access (managed via service role)
