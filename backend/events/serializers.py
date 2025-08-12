from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Category, Venue, Organizer, Event, Booking, Seat, Payment, BookingSeat


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']


class VenueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Venue
        fields = ['id', 'name', 'address', 'city', 'capacity']


class OrganizerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organizer
        fields = ['id', 'name', 'contact_email']


class SeatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seat
        fields = ['id', 'row_label', 'seat_number', 'seat_type', 'price', 'is_available']


class EventSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(source='category', queryset=Category.objects.all(), write_only=True, required=False)
    venue = VenueSerializer(read_only=True)
    venue_id = serializers.PrimaryKeyRelatedField(source='venue', queryset=Venue.objects.all(), write_only=True, required=False)
    organizer = OrganizerSerializer(read_only=True)
    organizer_id = serializers.PrimaryKeyRelatedField(source='organizer', queryset=Organizer.objects.all(), write_only=True, required=False)
    seats = SeatSerializer(many=True, read_only=True)

    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'start_time', 'end_time', 'price',
            'category', 'category_id', 'venue', 'venue_id', 'organizer', 'organizer_id', 'seats'
        ]


class BookingSeatSerializer(serializers.ModelSerializer):
    seat = SeatSerializer(read_only=True)
    seat_id = serializers.PrimaryKeyRelatedField(source='seat', queryset=Seat.objects.all(), write_only=True)

    class Meta:
        model = BookingSeat
        fields = ['seat', 'seat_id']


class BookingSerializer(serializers.ModelSerializer):
    event = EventSerializer(read_only=True)
    event_id = serializers.PrimaryKeyRelatedField(source='event', queryset=Event.objects.all(), write_only=True)
    seats = BookingSeatSerializer(source='booking_seats', many=True, write_only=True, required=False)

    class Meta:
        model = Booking
        fields = ['id', 'event', 'event_id', 'quantity', 'created_at', 'seats']
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        seats_data = validated_data.pop('booking_seats', [])
        booking = super().create(validated_data)
        for seat_item in seats_data:
            seat = seat_item['seat']
            BookingSeat.objects.create(booking=booking, seat=seat)
            seat.is_available = False
            seat.save(update_fields=['is_available'])
        return booking


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'provider', 'amount', 'status', 'transaction_id', 'created_at', 'updated_at']
        read_only_fields = ['id', 'status', 'transaction_id', 'created_at', 'updated_at']


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
        read_only_fields = ['id']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user 