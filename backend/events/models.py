from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True)

    def __str__(self) -> str:
        return self.name


class Venue(models.Model):
    name = models.CharField(max_length=200)
    address = models.CharField(max_length=300, blank=True)
    city = models.CharField(max_length=100, blank=True)
    capacity = models.PositiveIntegerField(default=0)

    def __str__(self) -> str:
        return self.name


class Organizer(models.Model):
    name = models.CharField(max_length=200)
    contact_email = models.EmailField(blank=True)

    def __str__(self) -> str:
        return self.name


class Event(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='events')
    venue = models.ForeignKey(Venue, on_delete=models.SET_NULL, null=True, related_name='events')
    organizer = models.ForeignKey(Organizer, on_delete=models.SET_NULL, null=True, related_name='events')

    def __str__(self) -> str:
        return self.title


class Seat(models.Model):
    TYPE_CHOICES = (
        ('VIP', 'VIP'),
        ('Premium', 'Premium'),
        ('Standard', 'Standard'),
    )
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='seats')
    row_label = models.CharField(max_length=4, default='A')
    seat_number = models.PositiveIntegerField(default=1)
    seat_type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='Standard')
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_available = models.BooleanField(default=True)

    class Meta:
        unique_together = ('event', 'row_label', 'seat_number')

    def __str__(self) -> str:
        return f"{self.event.title} {self.row_label}{self.seat_number}"


class Booking(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='bookings')
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'event', 'created_at')

    def __str__(self) -> str:
        return f"{self.user} -> {self.event} x{self.quantity}"


class BookingSeat(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='booking_seats')
    seat = models.OneToOneField(Seat, on_delete=models.CASCADE, related_name='booking_seat')

    def __str__(self) -> str:
        return f"Booking {self.booking_id} Seat {self.seat_id}"


class Payment(models.Model):
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='payment')
    provider = models.CharField(max_length=50, default='khalti')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, default='initiated')
    transaction_id = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"{self.provider} {self.status} {self.amount}"
