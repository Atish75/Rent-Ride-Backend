from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CarViewSet, 
    BookedCarViewSet, 
    RegisterUserAPIView, 
    BookCarAPIView, 
    BookedCarsListAPIView,
    UserProfileAPIView,
    LiveLocationAPIView,AvailableBookingsAPIView, AcceptBookingAPIView, MyDriverBookingsAPIView,
    ToggleDriverStatusAPIView,CancelDriverAssignmentAPIView,OwnerCarsAPIView,CompleteTripAPIView,
    ConfirmPaymentAPIView,CustomerBookingHistoryAPIView,DriverBookingHistoryAPIView,
    OwnerBookingHistoryAPIView,DriverEarningsAPIView,OwnerEarningsAPIView,ToggleOwnerStatusAPIView,ConfirmTripCompletionAPIView,
    ToggleCarAvailabilityAPIView,
)
from .views import create_superuser_once
router = DefaultRouter()
router.register(r'cars', CarViewSet)

urlpatterns = [
    path('booked-cars/', BookedCarsListAPIView.as_view(), name='booked_cars_list'),
    path('booked-cars/<int:booking_id>/', BookedCarsListAPIView.as_view(), name='cancel_booking'),
    path('book-car/', BookCarAPIView.as_view(), name='book_car'),
    path('api/register/', RegisterUserAPIView.as_view(), name='register_user'),
    path('profile/', UserProfileAPIView.as_view(), name='user_profile'),
    path('cars/<int:car_id>/location/', LiveLocationAPIView.as_view(), name='car_location'),
    path('driver/available-bookings/', AvailableBookingsAPIView.as_view(), name='available_bookings'),
    path('driver/bookings/<int:booking_id>/accept/', AcceptBookingAPIView.as_view(), name='accept_booking'),
    path('driver/my-bookings/', MyDriverBookingsAPIView.as_view(), name='my_driver_bookings'),
    path('profile/toggle-driver/', ToggleDriverStatusAPIView.as_view(), name='toggle_driver'),
    path('driver/bookings/<int:booking_id>/cancel/', CancelDriverAssignmentAPIView.as_view(), name='cancel_driver_assignment'),
    path('owner/my-cars/', OwnerCarsAPIView.as_view(), name='owner_my_cars'),
    path('driver/bookings/<int:booking_id>/complete/', CompleteTripAPIView.as_view(), name='complete_trip'),
    path('booked-cars/<int:booking_id>/pay/', ConfirmPaymentAPIView.as_view(), name='confirm_payment'),
    path('booking-history/', CustomerBookingHistoryAPIView.as_view(), name='customer_history'),
    path('driver/booking-history/', DriverBookingHistoryAPIView.as_view(), name='driver_history'),
    path('owner/booking-history/', OwnerBookingHistoryAPIView.as_view(), name='owner_history'),
    path('driver/earnings/', DriverEarningsAPIView.as_view(), name='driver_earnings'),
    path('owner/earnings/', OwnerEarningsAPIView.as_view(), name='owner_earnings'),
    path('profile/toggle-owner/', ToggleOwnerStatusAPIView.as_view(), name='toggle_owner'),
    path('booked-cars/<int:booking_id>/confirm-trip/', ConfirmTripCompletionAPIView.as_view(), name='confirm_trip'),
    path('owner/cars/<int:car_id>/toggle-availability/', ToggleCarAvailabilityAPIView.as_view(), name='toggle_car_availability'),
    path('create-superuser-once/', create_superuser_once, name='create_superuser_once'),

    # Router endpoints
    path('', include(router.urls)),

]