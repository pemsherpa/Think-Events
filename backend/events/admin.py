from django.contrib import admin
from .models import Category, Venue, Organizer, Event, Booking, Seat, Payment, BookingSeat

admin.site.register(Category)
admin.site.register(Venue)
admin.site.register(Organizer)
admin.site.register(Event)
admin.site.register(Booking)
admin.site.register(Seat)
admin.site.register(BookingSeat)
admin.site.register(Payment)
