from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db import transaction
from django.shortcuts import get_object_or_404

from .models import Category, Organizer, Venue, Event, Seat, Booking, BookingSeat, Payment
from .serializers import (
    UserSerializer,
    SignupSerializer,
    CategorySerializer,
    OrganizerSerializer,
    VenueSerializer,
    EventSerializer,
    SeatSerializer,
    BookingSerializer,
    PaymentSerializer,
)


class SignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'user': UserSerializer(user).data,
                'token': token.key,
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if not user:
            return Response({'detail': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'user': UserSerializer(user).data})


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer


class OrganizerViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Organizer.objects.all().order_by('name')
    serializer_class = OrganizerSerializer


class VenueViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Venue.objects.all().order_by('name')
    serializer_class = VenueSerializer


class EventViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Event.objects.select_related('category', 'organizer', 'venue').all().order_by('-start_time')
    serializer_class = EventSerializer

    @action(detail=True, methods=['get'], url_path='seats')
    def seats(self, request, pk=None):
        event = self.get_object()
        seats = event.seats.all().order_by('row_label', 'seat_number')
        return Response(SeatSerializer(seats, many=True).data)


class BookingViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = BookingSerializer

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user).select_related('event').prefetch_related('booking_seats__seat')

    def create(self, request, *args, **kwargs):
        user = request.user
        event_id = request.data.get('event')
        seat_ids = request.data.get('seat_ids', [])
        event = get_object_or_404(Event, id=event_id)

        if not isinstance(seat_ids, list) or len(seat_ids) == 0:
            return Response({'detail': 'seat_ids must be a non-empty list.'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            # Lock selected seats to avoid race conditions
            seats = list(Seat.objects.select_for_update().filter(id__in=seat_ids, event=event, is_available=True))
            if len(seats) != len(seat_ids):
                return Response({'detail': 'One or more seats are unavailable.'}, status=status.HTTP_400_BAD_REQUEST)

            booking = Booking.objects.create(user=user, event=event, quantity=len(seats))
            for seat in seats:
                seat.is_available = False
                seat.save()
                BookingSeat.objects.create(booking=booking, seat=seat)

            serializer = BookingSerializer(booking)
            return Response(serializer.data, status=status.HTTP_201_CREATED)


class PaymentViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = PaymentSerializer

    def get_queryset(self):
        return Payment.objects.filter(booking__user=self.request.user)
