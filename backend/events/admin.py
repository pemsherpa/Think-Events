from django.contrib import admin
from .models import Category, Organizer, Venue, Event, Seat, Booking, BookingSeat, Payment

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'slug')
    search_fields = ('name', 'slug')


@admin.register(Organizer)
class OrganizerAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'contact_email')
    search_fields = ('name', 'contact_email')


@admin.register(Venue)
class VenueAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'city', 'capacity')
    search_fields = ('name', 'city')


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'start_time', 'end_time', 'price', 'category', 'organizer', 'venue')
    list_filter = ('category', 'organizer', 'venue')
    search_fields = ('title',)


@admin.register(Seat)
class SeatAdmin(admin.ModelAdmin):
    list_display = ('id', 'event', 'row_label', 'seat_number', 'seat_type', 'price', 'is_available')
    list_filter = ('event', 'seat_type', 'is_available')


class BookingSeatInline(admin.TabularInline):
    model = BookingSeat
    extra = 0


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'event', 'quantity', 'created_at')
    list_filter = ('event',)
    inlines = [BookingSeatInline]


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'booking', 'provider', 'amount', 'status', 'created_at')
    list_filter = ('provider', 'status')
