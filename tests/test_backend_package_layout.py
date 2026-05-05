def test_application_builds_from_refined_plan_package_layout():
    from app.api.http_application import HttpApplicationModule
    from app.core.settings import SettingsModule

    app = HttpApplicationModule(
        settings=SettingsModule().with_overrides(database_url="sqlite+pysqlite:///:memory:")
    ).build()

    assert app.title == "IPB Smart Reserve Hub"
