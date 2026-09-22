-- Keep only numeric currency values in the two dispute-value fields.
UPDATE "OwnershipDocument"
SET "materialLossPaid" = NULL
WHERE "materialLossPaid" IS NOT NULL
  AND BTRIM("materialLossPaid") !~ '^(Rp[[:space:]]*)?[0-9]{1,3}(,[0-9]{3})*(\.[0-9]{1,2})?$';

UPDATE "OwnershipDocument"
SET "otherLosses" = NULL
WHERE "otherLosses" IS NOT NULL
  AND BTRIM("otherLosses") !~ '^(Rp[[:space:]]*)?[0-9]{1,3}(,[0-9]{3})*(\.[0-9]{1,2})?$';
