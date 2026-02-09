#!/bin/bash
npx supabase gen types typescript --project-id "${SUPABASE_PROJECT_ID}" > src/types/database.ts
echo "Types generated successfully"
