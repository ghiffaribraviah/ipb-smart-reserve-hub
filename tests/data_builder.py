from sqlalchemy import select

from app.models import Facility, FacilityCategory, FacilityImage, User, UserRole
from app.security import hash_password


class DataBuilder:
    def __init__(self, app) -> None:
        self._session_factory = app.state.session_factory

    def create_user(
        self,
        *,
        email: str,
        role: UserRole,
        password: str = "secret123",
        is_active: bool = True,
    ) -> str:
        with self._session_factory() as session:
            user = User(
                email=email,
                password_hash=hash_password(password),
                full_name="Seed User",
                role=role,
                is_active=is_active,
            )
            session.add(user)
            session.commit()
            return user.id

    def create_facility(
        self,
        *,
        name: str,
        is_active: bool = True,
        category_name: str = "Auditorium",
        price_rupiah: int = 0,
    ) -> str:
        with self._session_factory() as session:
            category = session.scalar(select(FacilityCategory).where(FacilityCategory.name == category_name))
            if category is None:
                category = FacilityCategory(name=category_name)
            facility = Facility(
                name=name,
                category=category,
                location="Kampus IPB Dramaga",
                capacity=120,
                description="Ruang kegiatan mahasiswa",
                contact_name="TU Fasilitas",
                contact_phone="0251-8620000",
                price_rupiah=price_rupiah,
                open_hours_summary="Senin-Jumat 08.00-16.00",
                rating_average=None,
                review_count=0,
                is_active=is_active,
            )
            facility.images.append(
                FacilityImage(
                    url="https://cdn.example.test/auditorium-cover.jpg",
                    alt_text="Auditorium cover",
                    display_order=1,
                    is_cover=True,
                    is_active=True,
                )
            )
            session.add(facility)
            session.commit()
            return facility.id

    def add_facility_image(
        self,
        facility_id: str,
        *,
        url: str,
        display_order: int,
        is_cover: bool = False,
    ) -> None:
        with self._session_factory() as session:
            facility = session.get(Facility, facility_id)
            facility.images.append(
                FacilityImage(
                    url=url,
                    alt_text=f"Facility image {display_order}",
                    display_order=display_order,
                    is_cover=is_cover,
                    is_active=True,
                )
            )
            session.commit()
