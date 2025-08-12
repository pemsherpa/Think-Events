from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import CategoryViewSet, VenueViewSet, OrganizerViewSet, EventViewSet, BookingViewSet, RegisterView, MeView, GoogleLoginView

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'venues', VenueViewSet, basename='venue')
router.register(r'organizers', OrganizerViewSet, basename='organizer')
router.register(r'events', EventViewSet, basename='event')
router.register(r'bookings', BookingViewSet, basename='booking')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', RegisterView.as_view(), name='auth-register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', MeView.as_view(), name='auth-me'),
    path('auth/google/', GoogleLoginView.as_view(), name='auth-google'),
] 