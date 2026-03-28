-- Backfill typeConfig feature flags for existing sub-events
-- Dinner sub-events get dietaryEnabled: true
UPDATE "sub_events"
SET "type_config" = "type_config"::jsonb || '{"dietaryEnabled": true}'::jsonb
WHERE "type" = 'dinner'
  AND NOT ("type_config"::jsonb ? 'dietaryEnabled');

-- Party sub-events get musicRequestsEnabled: true (unless explicitly set to false)
UPDATE "sub_events"
SET "type_config" = "type_config"::jsonb || '{"musicRequestsEnabled": true}'::jsonb
WHERE "type" = 'party'
  AND NOT ("type_config"::jsonb @> '{"musicRequestsEnabled": false}'::jsonb)
  AND NOT ("type_config"::jsonb ? 'musicRequestsEnabled');
