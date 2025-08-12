from django.contrib.auth.models import User
from django.db import transaction
from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
import requests
import os

from .models import Category, Venue, Organizer, Event, Booking, Seat, Payment
from .serializers import (
    CategorySerializer,
    VenueSerializer,
    OrganizerSerializer,
    EventSerializer,
    BookingSerializer,
    UserSerializer,
    SeatSerializer,
    PaymentSerializer,
)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]


class VenueViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Venue.objects.all().order_by('name')
    serializer_class = VenueSerializer
    permission_classes = [AllowAny]


class OrganizerViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Organizer.objects.all().order_by('name')
    serializer_class = OrganizerSerializer
    permission_classes = [AllowAny]


class EventViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Event.objects.select_related('category', 'venue', 'organizer').all().order_by('start_time')
    serializer_class = EventSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = super().get_queryset()
        category = self.request.query_params.get('category')
        venue = self.request.query_params.get('venue')
        search = self.request.query_params.get('search')
        if category:
            queryset = queryset.filter(category__slug=category)
        if venue:
            queryset = queryset.filter(venue__id=venue)
        if search:
            queryset = queryset.filter(title__icontains=search)
        return queryset

    @action(detail=True, methods=['get'], permission_classes=[AllowAny])
    def seats(self, request, pk=None):
        event = self.get_object()
        seats = event.seats.order_by('row_label', 'seat_number')
        return Response(SeatSerializer(seats, many=True).data)


class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user).select_related('event')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def pay_khalti(self, request, pk=None):
        booking = self.get_object()
        amount_paisa = int(booking.quantity * float(booking.event.price) * 100)
        khalti_secret = os.getenv('KHALTI_SECRET_KEY', '')
        payload = {
            'return_url': request.build_absolute_uri('/'),
            'website_url': request.build_absolute_uri('/'),
            'amount': amount_paisa,
            'purchase_order_id': f'booking-{booking.id}',
            'purchase_order_name': booking.event.title,
        }
        headers = {'Authorization': f'Key {khalti_secret}', 'Content-Type': 'application/json'}
        try:
            r = requests.post('https://a.khalti.com/api/v2/epayment/initiate/', json=payload, headers=headers, timeout=15)
            r.raise_for_status()
        except Exception as e:
            return Response({'detail': 'Khalti initiate failed', 'error': str(e)}, status=400)
        data = r.json()
        payment, _ = Payment.objects.get_or_create(
            booking=booking,
            defaults={'provider': 'khalti', 'amount': amount_paisa / 100.0, 'status': 'initiated', 'transaction_id': data.get('pidx', '')}
        )
        return Response({'payment': PaymentSerializer(payment).data, 'khalti': data})


class RegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        user = User.objects.get(id=response.data['id'])
        refresh = RefreshToken.for_user(user)
        response.data = {
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }
        return response


class MeView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class GoogleLoginView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # Expected body: { id_token: string }
        id_token = request.data.get('id_token')
        if not id_token:
            return Response({'detail': 'id_token is required'}, status=400)
        try:
            resp = requests.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token}", timeout=10)
            resp.raise_for_status()
            info = resp.json()
            email = info.get('email')
            if not email:
                return Response({'detail': 'Invalid Google token'}, status=400)
            username = email.split('@')[0]
            user, _ = User.objects.get_or_create(username=username, defaults={'email': email})
            refresh = RefreshToken.for_user(user)
            return Response({'user': UserSerializer(user).data, 'access': str(refresh.access_token), 'refresh': str(refresh)})
        except Exception as e:
            return Response({'detail': 'Google verification failed', 'error': str(e)}, status=400)
