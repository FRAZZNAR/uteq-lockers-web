-- ============================================================
-- Script pendiente para la BD existente — UTEQ Lockers
-- Ejecutar en MySQL Workbench (solo si la API no arranca sola)
-- ============================================================

USE uteq_lockers; -- ← cambia si tu BD tiene otro nombre

-- ── Ampliar columna Matricula (necesario para el soft-delete) ─────────
ALTER TABLE Usuarios MODIFY COLUMN Matricula VARCHAR(50) NOT NULL;

-- ── Registrar la nueva migración en el historial de EF Core ──────────
INSERT IGNORE INTO `__EFMigrationsHistory` (MigrationId, ProductVersion)
VALUES ('20260406000000_AlterMatriculaAndIndexes', '9.0.3');

-- ── Índices AccesosLog ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS IX_AccesosLog_Timestamp
    ON AccesosLog (Timestamp);

CREATE INDEX IF NOT EXISTS IX_AccesosLog_LockerId_Timestamp
    ON AccesosLog (LockerId, Timestamp);

CREATE INDEX IF NOT EXISTS IX_AccesosLog_Resultado_Timestamp
    ON AccesosLog (Resultado, Timestamp);

-- ── Índices Avisos ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS IX_Avisos_Estado
    ON Avisos (Estado);

CREATE INDEX IF NOT EXISTS IX_Avisos_AsignacionId_Estado
    ON Avisos (AsignacionId, Estado);

-- ── Índices Asignaciones ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS IX_Asignaciones_EstudianteId_Activa
    ON Asignaciones (EstudianteId, Activa);

CREATE INDEX IF NOT EXISTS IX_Asignaciones_Activa
    ON Asignaciones (Activa);
