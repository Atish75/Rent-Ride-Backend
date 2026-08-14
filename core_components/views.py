from django.shortcuts import render

# Create your views here.
import cloudinary
import cloudinary.uploader
from rest_framework import viewsets,status,filters,permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Car,BookedCar,Profile
from .serializers import CarSerializer,BookedCarSerializer
from django.db import transaction
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.hashers import make_password
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated
from datetime import datetime
from .models import BookedCar, Car,Profile
from rest_framework.decorators import api_view
from django.http import HttpResponse
from decimal import Decimal
import math

<<<<<<< HEAD
=======
def haversine_km(lat1, lon1, lat2, lon2):
    R = 6371  # Earth's radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return round(R * c, 2)
#for creating super user on render it created
def create_superuser_once(request):
    if User.objects.filter(username='admin').exists():
        return HttpResponse("Superuser already exists.")
    
    User.objects.create_superuser(
        username='Theguy',
        email='Theguy@rentride.com',
        password='Theguy75@unique'
    )
    return HttpResponse("Superuser created successfully!")
>>>>>>> f87747c (Added Live Location with Websocket)
COMPANY_SHARE = Decimal("0.08")
DRIVER_SHARE = Decimal("0.25")
OWNER_SHARE = Decimal("0.67")

def calculate_split(total_price):
    total = Decimal(str(total_price))
    return {
        "company": round(total * COMPANY_SHARE, 2),
        "driver": round(total * DRIVER_SHARE, 2),
        "owner": round(total * OWNER_SHARE, 2),
    }
class CarViewSet(viewsets.ModelViewSet):
    queryset = Car.objects.all()
    serializer_class = CarSerializer
    #Search filter enable 
    filter_backends = [filters.SearchFilter]
    
    #  In fields par search chalega (car name, brand, etc.)
    search_fields = ['name', 'brand']
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]
    def get_queryset(self):
        booked_car_ids = BookedCar.objects.exclude(status__in=["COMPLETED", "CANCELLED"]).values_list('car_id', flat=True)
        return Car.objects.exclude(id__in=booked_car_ids).filter(available=True)
    def perform_create(self, serializer):
        profile, _ = Profile.objects.get_or_create(user=self.request.user)
        if not profile.is_owner:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You must enable Car Owner mode to add a car.")
        serializer.save(owner=self.request.user) 
    def destroy(self, request, *args, **kwargs):
        car = self.get_object()

        if car.owner != request.user:
            return Response({"error": "You can only delete cars you own."}, status=status.HTTP_403_FORBIDDEN)

        if BookedCar.objects.filter(car=car).exclude(status__in=["COMPLETED", "CANCELLED"]).exists():
            return Response({"error": "Can't delete a car with an active booking."}, status=status.HTTP_400_BAD_REQUEST)

        if car.image:
            public_id = car.image.public_id if hasattr(car.image, "public_id") else None
            if public_id:
                cloudinary.uploader.destroy(public_id)
        car.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class BookedCarViewSet(viewsets.ModelViewSet):
    queryset = BookedCar.objects.all()
    serializer_class = BookedCarSerializer

    def create(self, request, *args, **kwargs):
        car_id = request.data.get("car")
        with transaction.atomic():
            car = Car.objects.select_for_update().get(id=car_id)
            if BookedCar.objects.filter(car=car, status="ACTIVE").exists():
                return Response({"error": "Car already booked"}, status=status.HTTP_400_BAD_REQUEST)

            booking = BookedCar.objects.create(
                car=car,
                customer_name=request.data.get("customer_name"),
                customer_email=request.data.get("customer_email"),
                
                status="BOOKED"
            )
            return Response({"success": "Booking created"}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def confirm(self, request, pk=None):
        booking = self.get_object()
        otp = request.data.get("otp")
        if booking.otp == otp:
            booking.status = "ACTIVE"
            booking.save()
            return Response({"success": "Car received"})
        return Response({"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["post"])
    def leave(self, request, pk=None):
        booking = self.get_object()
        booking.status = "CANCELLED"
        booking.save()
        return Response({"success": "Car returned"})

class RegisterUserAPIView(APIView):
    permission_classes = [AllowAny] # Koi bhi access kar sakta hai

    def post(self, request):
        data = request.data
        try:
            # Check username pehle se toh nahi hai
            if User.objects.filter(username=data['username']).exists():
                return Response({"error": "Username Already Exists."}, status=status.HTTP_400_BAD_REQUEST)
                
            # Naya user create karein
            user = User.objects.create(
                username=data['username'],
                email=data.get('email', ''),
                password=make_password(data['password']) # Password hashing 
            )
            return Response({"message": "Signup completed! You can now login."}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": "details missing ."}, status=status.HTTP_400_BAD_REQUEST)
        
class BookCarAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data
        car_id = data.get('car')
        trip_type = data.get('trip_type', 'DATE_RANGE')

        with transaction.atomic():
            car = Car.objects.select_for_update().get(id=car_id)

            if BookedCar.objects.filter(car=car).exclude(status__in=["COMPLETED", "CANCELLED"]).exists():
                return Response({"error": "Ye car pehle se hi booked hai! Kisi aur car ko select karo."}, status=status.HTTP_400_BAD_REQUEST)

            if trip_type == 'POINT_TO_POINT':
                start_lat = data.get('start_lat')
                start_lng = data.get('start_lng')
                end_lat = data.get('end_lat')
                end_lng = data.get('end_lng')
                start_point = data.get('start_point', '')
                end_point = data.get('end_point', '')

                if None in [start_lat, start_lng, end_lat, end_lng]:
                    return Response({"error": "select both pickup and drop ."}, status=status.HTTP_400_BAD_REQUEST)

                distance = haversine_km(float(start_lat), float(start_lng), float(end_lat), float(end_lng))
                total_price = round(distance * float(car.price_per_km), 2)

                booking = BookedCar.objects.create(
                    user=request.user,
                    car=car,
                    customer_name=request.user.username,
                    trip_type='POINT_TO_POINT',
                    start_point=start_point,
                    end_point=end_point,
                    start_lat=start_lat,
                    start_lng=start_lng,
                    end_lat=end_lat,
                    end_lng=end_lng,
                    distance_km=distance,
                    total_price=total_price,
                    status="BOOKED"
                )
                return Response({"message": "Car successfully booked!", "distance_km": distance, "total_price": str(total_price)}, status=status.HTTP_201_CREATED)

            else:  # DATE_RANGE — existing logic
                start_date_str = data.get('start_date')
                end_date_str = data.get('end_date')
                start_point = data.get('start_point', '')
                end_point = data.get('end_point', '')

                if not start_date_str or not end_date_str:
                    return Response({"error": " select Start date and End date both ."}, status=status.HTTP_400_BAD_REQUEST)

                start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
                end_date = datetime.strptime(end_date_str, "%Y-%m-%d").date()

                if start_date >= end_date:
                    return Response({"error": "End date, must br ahead of start date."}, status=status.HTTP_400_BAD_REQUEST)

                days = (end_date - start_date).days
                total_price = days * car.price_per_day

                booking = BookedCar.objects.create(
                    user=request.user,
                    car=car,
                    customer_name=request.user.username,
                    trip_type='DATE_RANGE',
                    start_point=start_point,
                    end_point=end_point,
                    start_date=start_date,
                    end_date=end_date,
                    total_price=total_price,
                    status="BOOKED"
                )
                return Response({"message": "Car successfully booked!"}, status=status.HTTP_201_CREATED)
class BookedCarsListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Sirf current logged in user ki bookings dikhayega
        user_bookings = BookedCar.objects.filter(user=request.user).exclude(status="COMPLETED").order_by('-created_at')
        serializer = BookedCarSerializer(user_bookings, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    def delete(self, request, booking_id=None):
        try:
            booking = BookedCar.objects.get(id=booking_id, user=request.user)
            if booking.status not in ["BOOKED", "ACTIVE"]:
                return Response({"error": "This booking can no longer be cancelled."}, status=status.HTTP_400_BAD_REQUEST)
            booking.delete()
            return Response({"message": "Booking successfully removed!"}, status=status.HTTP_200_OK)
        except BookedCar.DoesNotExist:
            return Response({"error": "Booking not found "}, status=status.HTTP_404_NOT_FOUND)
        
class UserProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        profile, _ = Profile.objects.get_or_create(user=user)
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "phone": profile.phone or '',
            "is_driver": profile.is_driver,
            "is_owner": profile.is_owner,
        }, status=status.HTTP_200_OK)

    def put(self, request):
        user = request.user
        data = request.data

        user.first_name = data.get('first_name', user.first_name)
        user.last_name = data.get('last_name', user.last_name)
        user.email = data.get('email', user.email)
        user.save()

        profile, _ = Profile.objects.get_or_create(user=user)
        profile.phone = data.get('phone', profile.phone)
        profile.save()

        return Response({"message": "Profile updated successfully!"}, status=status.HTTP_200_OK)
class OwnerCarsAPIView(APIView):
    """Cars this user owns, with current booking/driver/customer/price info."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cars = Car.objects.filter(owner=request.user)
        data = []

        for car in cars:
            booking = BookedCar.objects.filter(car=car).exclude(status__in=["CANCELLED", "COMPLETED"]).first()

            data.append({
                "id": car.id,
                "name": car.name,
                "brand": car.brand,
                "price_per_day": str(car.price_per_day),
                "available": car.available,
                "latitude": car.latitude,
                "longitude": car.longitude,
                "image": car.image.url if car.image else None,
                "booking": None if not booking else {
                    "id": booking.id,
                    "customer_name": booking.customer_name,
                    "customer_email": booking.customer_email,
                    "start_point": booking.start_point,
                    "end_point": booking.end_point,
                    "start_date": booking.start_date,
                    "end_date": booking.end_date,
                    "total_price": str(booking.total_price),
                    "status": booking.status,
                    "driver_username": booking.driver.username if booking.driver else None,
                }
            })

        return Response(data, status=status.HTTP_200_OK)
class LiveLocationAPIView(APIView):
    permission_classes = [AllowAny]  # Unauthenticated phone request allow karne ke liye

    # Specific car ki current live location get karna
    def get(self, request, car_id):
        try:
            car = Car.objects.get(id=car_id)
            return Response({
                "car_id": car.id,
                "name": car.name,
                "latitude": car.latitude,
                "longitude": car.longitude
            }, status=status.HTTP_200_OK)
        except Car.DoesNotExist:
            return Response({"error": "Car nahi mili."}, status=status.HTTP_404_NOT_FOUND)

    # Coordinates update karna (Driver App ya GPS Device se)
    def post(self, request, car_id):
        try:
            car = Car.objects.get(id=car_id)
            
            # Request body validation
            lat = request.data.get('latitude')
            lng = request.data.get('longitude')
            
            if lat is not None and lng is not None:
                car.latitude = lat
                car.longitude = lng
                car.save()
                return Response({"message": "Location updated!"}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Latitude or Longitude  is missing."}, status=status.HTTP_400_BAD_REQUEST)

        except Car.DoesNotExist:
            return Response({"error": "Car not found."}, status=status.HTTP_404_NOT_FOUND)


class AvailableBookingsAPIView(APIView):
    """Bookings no driver has claimed yet — shown on Driver Dashboard."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile, _ = Profile.objects.get_or_create(user=request.user)
        if not profile.is_driver:
            return Response({"error": "Not a registered driver."}, status=status.HTTP_403_FORBIDDEN)

        bookings = BookedCar.objects.filter(driver__isnull=True, status="BOOKED").order_by('-created_at')
        serializer = BookedCarSerializer(bookings, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AcceptBookingAPIView(APIView):
    """Driver claims a booking. Atomic so two drivers can't grab the same one."""
    permission_classes = [IsAuthenticated]

    def post(self, request, booking_id):
        profile, _ = Profile.objects.get_or_create(user=request.user)
        if not profile.is_driver:
            return Response({"error": "Not a registered driver."}, status=status.HTTP_403_FORBIDDEN)

        with transaction.atomic():
            try:
                booking = BookedCar.objects.select_for_update().get(id=booking_id)
            except BookedCar.DoesNotExist:
                return Response({"error": "Booking not found."}, status=status.HTTP_404_NOT_FOUND)

            if booking.driver is not None:
                return Response({"error": "Booking already accepted by another driver."}, status=status.HTTP_400_BAD_REQUEST)

            booking.driver = request.user
            booking.save(update_fields=['driver'])

            return Response({
                "message": "Booking accepted!",
                "car_id": booking.car.id,
                "booking_id": booking.id
            }, status=status.HTTP_200_OK)

class CancelDriverAssignmentAPIView(APIView):
    """Driver un-assigns themselves from a booking — it goes back to the available pool."""
    permission_classes = [IsAuthenticated]

    def post(self, request, booking_id):
        try:
            booking = BookedCar.objects.get(id=booking_id, driver=request.user)
        except BookedCar.DoesNotExist:
            return Response({"error": "Booking not found or not assigned to you."}, status=status.HTTP_404_NOT_FOUND)

        booking.driver = None
        booking.save(update_fields=['driver'])

        return Response({"message": "You have been unassigned. Booking is back in the available pool."}, status=status.HTTP_200_OK)

class MyDriverBookingsAPIView(APIView):
    """Bookings this driver has accepted — used to auto-start location sharing."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        bookings = BookedCar.objects.filter(driver=request.user, status__in=["BOOKED", "ACTIVE"]).order_by('-created_at')
        serializer = BookedCarSerializer(bookings, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ToggleDriverStatusAPIView(APIView):
    """Lets a user opt in/out of being a driver (simple checkbox on Profile page)."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        profile, _ = Profile.objects.get_or_create(user=request.user)
        profile.is_driver = not profile.is_driver
        profile.save(update_fields=['is_driver'])
        return Response({"is_driver": profile.is_driver}, status=status.HTTP_200_OK)

class ToggleOwnerStatusAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        profile, _ = Profile.objects.get_or_create(user=request.user)
        profile.is_owner = not profile.is_owner
        profile.save(update_fields=['is_owner'])
        return Response({"is_owner": profile.is_owner}, status=status.HTTP_200_OK)
    
class CompleteTripAPIView(APIView):
    """Driver marks the trip as done — booking moves to PENDING_PAYMENT."""
    permission_classes = [IsAuthenticated]

    def post(self, request, booking_id):
        try:
            booking = BookedCar.objects.get(id=booking_id, driver=request.user)
        except BookedCar.DoesNotExist:
            return Response({"error": "Booking not found or not assigned to you."}, status=status.HTTP_404_NOT_FOUND)

        booking.status = "AWAITING_CONFIRMATION"
        booking.save(update_fields=['status'])
        return Response({"message": "Trip marked complete. Waiting for customer payment."}, status=status.HTTP_200_OK)
class ConfirmTripCompletionAPIView(APIView):
    """Customer confirms the trip actually ended, or disputes it."""
    permission_classes = [IsAuthenticated]

    def post(self, request, booking_id):
        try:
            booking = BookedCar.objects.get(id=booking_id, user=request.user)
        except BookedCar.DoesNotExist:
            return Response({"error": "Booking not found."}, status=status.HTTP_404_NOT_FOUND)

        if booking.status != "AWAITING_CONFIRMATION":
            return Response({"error": "This booking isn't awaiting confirmation."}, status=status.HTTP_400_BAD_REQUEST)

        confirmed = request.data.get("confirmed", False)

        if confirmed:
            booking.status = "PENDING_PAYMENT"
            booking.save(update_fields=['status'])
            return Response({"message": "Trip confirmed! Proceed to payment."}, status=status.HTTP_200_OK)
        else:
            booking.status = "ACTIVE"   # sends it back to driver as still ongoing
            booking.save(update_fields=['status'])
            return Response({"message": "Marked as still in progress. Driver notified."}, status=status.HTTP_200_OK)
def create_superuser_once(request):
    if User.objects.filter(username='admin').exists():
        return HttpResponse("Superuser already exists.")
    
    User.objects.create_superuser(
        username='Theguy',
        email='Theguy@rentride.com',
        password='Theguy75@unique'
    )
    return HttpResponse("Superuser created successfully!")
class ConfirmPaymentAPIView(APIView):
    """Customer confirms payment on the mock screen — booking is fully closed."""
    permission_classes = [IsAuthenticated]

    def post(self, request, booking_id):
        try:
            booking = BookedCar.objects.get(id=booking_id, user=request.user)
        except BookedCar.DoesNotExist:
            return Response({"error": "Booking not found."}, status=status.HTTP_404_NOT_FOUND)

        if booking.status != "PENDING_PAYMENT":
            return Response({"error": "This booking isn't awaiting payment."}, status=status.HTTP_400_BAD_REQUEST)

        booking.status = "COMPLETED"
        booking.save(update_fields=['status'])
        return Response({"message": "Payment confirmed. Trip completed!"}, status=status.HTTP_200_OK)

class CustomerBookingHistoryAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        bookings = BookedCar.objects.filter(user=request.user, status="COMPLETED").order_by('-created_at')
        serializer = BookedCarSerializer(bookings, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class DriverBookingHistoryAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        bookings = BookedCar.objects.filter(driver=request.user, status="COMPLETED").order_by('-created_at')
        serializer = BookedCarSerializer(bookings, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class OwnerBookingHistoryAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        bookings = BookedCar.objects.filter(car__owner=request.user, status="COMPLETED").order_by('-created_at')
        serializer = BookedCarSerializer(bookings, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
class DriverEarningsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        completed = BookedCar.objects.filter(driver=request.user, status="COMPLETED").order_by('-created_at')

        trips = []
        total_earned = Decimal("0")

        for booking in completed:
            split = calculate_split(booking.total_price)
            total_earned += split["driver"]
            trips.append({
                "booking_id": booking.id,
                "car_name": booking.car.name,
                "customer_name": booking.customer_name,
                "trip_price": str(booking.total_price),
                "your_earning": str(split["driver"]),
                "date": booking.created_at.date(),
            })

        return Response({
            "total_earnings": str(round(total_earned, 2)),
            "total_trips": completed.count(),
            "trips": trips
        }, status=status.HTTP_200_OK)


class OwnerEarningsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        completed = BookedCar.objects.filter(car__owner=request.user, status="COMPLETED").order_by('-created_at')

        trips = []
        total_earned = Decimal("0")

        for booking in completed:
            split = calculate_split(booking.total_price)
            total_earned += split["owner"]
            trips.append({
                "booking_id": booking.id,
                "car_name": booking.car.name,
                "customer_name": booking.customer_name,
                "trip_price": str(booking.total_price),
                "your_earning": str(split["owner"]),
                "date": booking.created_at.date(),
            })

        return Response({
            "total_earnings": str(round(total_earned, 2)),
            "total_trips": completed.count(),
            "trips": trips
        }, status=status.HTTP_200_OK)

class ToggleCarAvailabilityAPIView(APIView):
    """Owner manually marks their own car as unavailable/available for rent."""
    permission_classes = [IsAuthenticated]

    def post(self, request, car_id):
        try:
            car = Car.objects.get(id=car_id, owner=request.user)
        except Car.DoesNotExist:
            return Response({"error": "Car not found or not owned by you."}, status=status.HTTP_404_NOT_FOUND)

        car.available = not car.available
        car.save(update_fields=['available'])

        return Response({
            "message": f"Car is now {'available' if car.available else 'unavailable'} for rent.",
            "available": car.available
        }, status=status.HTTP_200_OK)
