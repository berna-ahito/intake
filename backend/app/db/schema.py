from sqlalchemy.engine import Engine


def ensure_sqlite_contract_columns(engine: Engine):
    if engine.dialect.name != "sqlite":
        return

    columns = {
        "crm_id": "crm_id VARCHAR",
        "crm_sync_status": "crm_sync_status VARCHAR NOT NULL DEFAULT 'not_synced'",
        "crm_synced_at": "crm_synced_at DATETIME",
        "crm_sync_error": "crm_sync_error VARCHAR",
    }

    with engine.begin() as connection:
        existing = {
            row[1]
            for row in connection.exec_driver_sql("PRAGMA table_info(submissions)").fetchall()
        }
        for column_name, ddl in columns.items():
            if column_name not in existing:
                connection.exec_driver_sql(f"ALTER TABLE submissions ADD COLUMN {ddl}")

        legacy_sources = {
            "partner": "partner_referral",
            "upload": "csv_import",
        }
        for legacy_source, current_source in legacy_sources.items():
            connection.exec_driver_sql(
                "UPDATE submissions SET source = ? WHERE source = ?",
                (current_source, legacy_source),
            )
