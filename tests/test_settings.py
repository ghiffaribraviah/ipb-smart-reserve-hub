from app.settings import SettingsModule


def test_settings_module_loads_environment_and_normalizes_allowed_domains(monkeypatch):
    monkeypatch.setenv("IPB_DATABASE_URL", "sqlite+pysqlite:///settings-test.db")
    monkeypatch.setenv("IPB_SECRET_KEY", "environment-secret")
    monkeypatch.setenv("IPB_ALLOWED_STUDENT_EMAIL_DOMAINS", " apps.ipb.ac.id, IPB.AC.ID ")

    settings = SettingsModule.from_environment()

    assert settings.database_url == "sqlite+pysqlite:///settings-test.db"
    assert settings.secret_key == "environment-secret"
    assert settings.allowed_student_email_domains == ("apps.ipb.ac.id", "ipb.ac.id")
