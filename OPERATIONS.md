# Nexmoneta - Operations Playbook

## Ziel
Diese Checkliste stellt sicher, dass die Seite stabil bleibt, Fehler schnell erkannt werden und Revenue-relevante Funktionen laufend verfuegbar sind.

## Täglicher Betrieb (5 Minuten)
1. GitHub Actions Workflow `Production Smoke Monitor` prüfen.
2. Offene Issues mit Titel `Production smoke monitor failed` prüfen.
3. Falls kein Workflow-Run erfolgt ist, manuell starten (`Run workflow`).

## Nach jedem Deploy
Fuehre lokal oder in CI aus:
1. `npm run lint`
2. `npm run test:e2e`
3. `npm run build`
4. `npm run check:prod`

Release ist nur gruen, wenn alle vier Schritte erfolgreich sind.

## Automatisches Monitoring
- Workflow: `.github/workflows/prod-smoke.yml`
- Intervall: alle 6 Stunden
- Trigger: `schedule` + `workflow_dispatch`
- Verhalten:
  - Bei Fehler: erstellt/aktualisiert ein GitHub Issue `Production smoke monitor failed`
  - Bei Recovery: kommentiert den erfolgreichen Run und schliesst das Issue

## Was `check:prod` prueft
Seiten:
- `/`
- `/tools`
- `/affiliate`
- `/content-factory`
- `/blog`
- `/admin/dashboard`

APIs:
- `/api/revenue-playbook?plan=pro` (erwartet 200)
- `/api/revenue-playbook?plan=starter` (erwartet 403 und locked=true)
- `/api/internal-bots/history?limit=5` (erwartet 200)

## Incident-Ablauf (wenn Smoke rot ist)
1. Workflow-Log öffnen.
2. Prüfen, ob es ein API-Fehler, Routing-Fehler oder Build/Runtime-Fehler ist.
3. Schnell validieren:
   - `npm run check:prod`
   - `npm run build`
4. Wenn reproduzierbar:
   - Hotfix-Branch
   - Fix committen
   - Deploy
   - `npm run check:prod` erneut ausführen
5. Recovery im Issue dokumentieren (wird automatisch ergänzt/geschlossen).

## Crash-Safety
- Route-Fehlerseite: `app/error.tsx`
- Globaler Fallback: `app/global-error.tsx`

Bei UI-Laufzeitfehlern bleibt die Seite bedienbar (Retry + Startseite statt White Screen).

## Revenue-Fokus im Betrieb
Wöchentlich prüfen:
1. Klick- und Conversion-Trend in Admin-Bereichen.
2. Revenue-Playbook und Internal-Bots-Endpunkte auf Verfügbarkeit.
3. Nur bei messbaren Rückgängen neue UI-Änderungen planen.

## Verantwortlichkeit
- Owner: Team Nexmoneta
- Priorität bei Alarm: Verfügbarkeit > Datenintegrität > Conversion-Optimierung
