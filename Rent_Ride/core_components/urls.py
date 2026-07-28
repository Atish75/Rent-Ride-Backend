from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CarViewSet, 
    BookedCarViewSet, 
    RegisterUserAPIView, 
    BookCarAPIView, 
    BookedCarsListAPIView,
    UserProfileAPIView
)

# 1. Router me SIRF ViewSets register honge
router = DefaultRouter()
router.register(r'cars', CarViewSet)
# Agar aapko BookedCarViewSet bhi router me rakhna hai toh 'BookedCarViewSet' use karein, 'BookedCarsListAPIView' nahi:
# router.register(r'booked-cars-viewset', BookedCarViewSet, basename='bookedcar-viewset')

urlpatterns = [
    # 2. APIViews ke liye normal path() use hote hain
    path('booked-cars/', BookedCarsListAPIView.as_view(), name='booked_cars_list'),
    path('booked-cars/<int:booking_id>/', BookedCarsListAPIView.as_view(), name='cancel_booking'),
    path('book-car/', BookCarAPIView.as_view(), name='book_car'),
    path('api/register/', RegisterUserAPIView.as_view(), name='register_user'),
    path('profile/', UserProfileAPIView.as_view(), name='user_profile'),

    # Router endpoints
    path('', include(router.urls)),

]