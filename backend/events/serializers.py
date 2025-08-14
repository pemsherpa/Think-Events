from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Category, Organizer, Venue, Event, Seat, Booking, BookingSeat, Payment


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
        )
        return user


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']


class OrganizerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organizer
        fields = ['id', 'name', 'contact_email']


class VenueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Venue
        fields = ['id', 'name', 'address', 'city', 'capacity']


class EventSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    organizer = OrganizerSerializer(read_only=True)
    venue = VenueSerializer(read_only=True)

    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'start_time', 'end_time', 'price',
            'category', 'organizer', 'venue'
        ]


class SeatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seat
        fields = ['id', 'event', 'row_label', 'seat_number', 'seat_type', 'price', 'is_available']


class BookingSeatSerializer(serializers.ModelSerializer):
    seat = SeatSerializer(read_only=True)

    class Meta:
        model = BookingSeat
        fields = ['id', 'seat']


class BookingSerializer(serializers.ModelSerializer):
    booking_seats = BookingSeatSerializer(many=True, read_only=True)
    event = EventSerializer(read_only=True)

    class Meta:
        model = Booking
        fields = ['id', 'event', 'quantity', 'created_at', 'booking_seats']


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'booking', 'provider', 'amount', 'status', 'created_at', 'updated_at'] 