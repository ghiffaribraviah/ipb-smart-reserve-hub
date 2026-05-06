import enum
import uuid
from datetime import UTC, datetime, time

from sqlalchemy import Boolean, DateTime, Enum, Float, ForeignKey, Integer, String, Text, Time, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class UserRole(str, enum.Enum):
    student = "student"
    staff = "staff"
    super_admin = "super_admin"


class ReservationStatus(str, enum.Enum):
    pending_document_upload = "pending_document_upload"
    pending_document_review = "pending_document_review"
    pending_payment = "pending_payment"
    approved = "approved"
    completed = "completed"
    cancelled = "cancelled"
    rejected = "rejected"
    expired = "expired"


class SystemSetting(Base):
    __tablename__ = "system_settings"

    key: Mapped[str] = mapped_column(String(128), primary_key=True)
    value: Mapped[str] = mapped_column(Text, nullable=False)


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    nim: Mapped[str | None] = mapped_column(String(32))
    phone: Mapped[str | None] = mapped_column(String(32))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )


class FacilityCategory(Base):
    __tablename__ = "facility_categories"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    facilities: Mapped[list["Facility"]] = relationship(back_populates="category")


class OrganizationUnit(Base):
    __tablename__ = "organization_units"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    type: Mapped[str] = mapped_column(String(64), default="student_organization", nullable=False)
    code: Mapped[str | None] = mapped_column(String(64))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    reservations: Mapped[list["Reservation"]] = relationship(back_populates="organization_unit")


class Facility(Base):
    __tablename__ = "facilities"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    category_id: Mapped[str] = mapped_column(ForeignKey("facility_categories.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    location: Mapped[str] = mapped_column(String(255), nullable=False)
    capacity: Mapped[int] = mapped_column(Integer, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    contact_name: Mapped[str] = mapped_column(String(255), nullable=False)
    contact_phone: Mapped[str] = mapped_column(String(32), nullable=False)
    contact_email: Mapped[str | None] = mapped_column(String(255))
    price_rupiah: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    payment_instructions: Mapped[str | None] = mapped_column(Text)
    open_hours_summary: Mapped[str] = mapped_column(String(255), nullable=False)
    rating_average: Mapped[float | None] = mapped_column(Float)
    review_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )

    category: Mapped[FacilityCategory] = relationship(back_populates="facilities")
    images: Mapped[list["FacilityImage"]] = relationship(
        back_populates="facility",
        cascade="all, delete-orphan",
        order_by="FacilityImage.display_order",
    )
    open_hours: Mapped[list["FacilityOpenHour"]] = relationship(
        back_populates="facility",
        cascade="all, delete-orphan",
        order_by="FacilityOpenHour.day_of_week",
    )
    blackouts: Mapped[list["FacilityBlackout"]] = relationship(
        back_populates="facility",
        cascade="all, delete-orphan",
    )
    reservations: Mapped[list["Reservation"]] = relationship(back_populates="facility")
    staff_assignments: Mapped[list["FacilityStaffAssignment"]] = relationship(
        back_populates="facility",
        cascade="all, delete-orphan",
    )


class FacilityStaffAssignment(Base):
    __tablename__ = "facility_staff_assignments"
    __table_args__ = (UniqueConstraint("facility_id", "staff_id", name="uq_facility_staff_assignment"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    facility_id: Mapped[str] = mapped_column(ForeignKey("facilities.id"), nullable=False)
    staff_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)

    facility: Mapped[Facility] = relationship(back_populates="staff_assignments")
    staff: Mapped[User] = relationship()


class FacilityImage(Base):
    __tablename__ = "facility_images"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    facility_id: Mapped[str] = mapped_column(ForeignKey("facilities.id"), nullable=False)
    url: Mapped[str] = mapped_column(String(1024), nullable=False)
    alt_text: Mapped[str] = mapped_column(String(255), nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_cover: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    facility: Mapped[Facility] = relationship(back_populates="images")


class FacilityOpenHour(Base):
    __tablename__ = "facility_open_hours"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    facility_id: Mapped[str] = mapped_column(ForeignKey("facilities.id"), nullable=False)
    day_of_week: Mapped[int] = mapped_column(Integer, nullable=False)
    opens_at: Mapped[time] = mapped_column(Time, nullable=False)
    closes_at: Mapped[time] = mapped_column(Time, nullable=False)

    facility: Mapped[Facility] = relationship(back_populates="open_hours")


class FacilityBlackout(Base):
    __tablename__ = "facility_blackouts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    facility_id: Mapped[str] = mapped_column(ForeignKey("facilities.id"), nullable=False)
    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    ends_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    reason: Mapped[str] = mapped_column(String(255), default="Blackout", nullable=False)

    facility: Mapped[Facility] = relationship(back_populates="blackouts")


class Reservation(Base):
    __tablename__ = "reservations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    facility_id: Mapped[str] = mapped_column(ForeignKey("facilities.id"), nullable=False)
    student_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)
    organization_unit_id: Mapped[str] = mapped_column(ForeignKey("organization_units.id"), nullable=False)
    reservation_code: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    activity_title: Mapped[str] = mapped_column(String(255), nullable=False)
    event_description: Mapped[str] = mapped_column(Text, nullable=False)
    participant_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    contact_phone: Mapped[str] = mapped_column(String(32), default="", nullable=False)
    price_rupiah: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    organization_unit_name: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    ends_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[ReservationStatus] = mapped_column(Enum(ReservationStatus), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )

    facility: Mapped[Facility] = relationship(back_populates="reservations")
    organization_unit: Mapped[OrganizationUnit] = relationship(back_populates="reservations")
    student: Mapped[User] = relationship()
    approval_letter: Mapped["ReservationApprovalLetter | None"] = relationship(
        back_populates="reservation",
        cascade="all, delete-orphan",
    )


class ReservationApprovalLetter(Base):
    __tablename__ = "reservation_approval_letters"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    reservation_id: Mapped[str] = mapped_column(
        ForeignKey("reservations.id"),
        unique=True,
        nullable=False,
    )
    storage_key: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    content_type: Mapped[str] = mapped_column(String(64), nullable=False)
    size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)
    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    reservation: Mapped[Reservation] = relationship(back_populates="approval_letter")
