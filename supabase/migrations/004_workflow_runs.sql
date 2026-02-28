-- Workflow run history
CREATE TABLE IF NOT EXISTS workflow_runs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id text NOT NULL,
  status text NOT NULL DEFAULT 'running',
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  steps_completed integer NOT NULL DEFAULT 0,
  steps_total integer NOT NULL DEFAULT 1,
  outputs jsonb DEFAULT '{}',
  error text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workflow_runs_workflow ON workflow_runs(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_started ON workflow_runs(started_at DESC);
