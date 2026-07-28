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
from .models import BookedCar, Car

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
        booked_car_ids = BookedCar.objects.values_list('car_id', flat=True)
        return Car.objects.exclude(id__in=booked_car_ids)
    def destroy(self, request, *args, **kwargs):
        car = self.get_object()
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
                return Response({"error": "Username pehle se hi le liya hai."}, status=status.HTTP_400_BAD_REQUEST)
                
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
        start_date_str = data.get('start_date')
        end_date_str = data.get('end_date')

        if not start_date_str or not end_date_str:
            return Response({"error": "Start date aur End date both select ."}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            #  Car ko lock kar
            car = Car.objects.select_for_update().get(id=car_id)

            #  Check ye car pehle se kisi ne bhi book toh nahi kar rakhi
            if BookedCar.objects.filter(car=car).exists():
                return Response(
                    {"error": "Ye car pehle se hi booked hai! Kisi aur car ko select karo."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
            end_date = datetime.strptime(end_date_str, "%Y-%m-%d").date()
            
            if start_date >= end_date:
                return Response({"error": "End date, Start date ke baad ki honi chahiye."}, status=status.HTTP_400_BAD_REQUEST)

            days = (end_date - start_date).days
            total_price = days * car.price_per_day

            # 3. Nayi booking create karein
            booking = BookedCar.objects.create(
                user=request.user,
                car=car,
                customer_name=request.user.username,
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
        user_bookings = BookedCar.objects.filter(user=request.user).order_by('-created_at')
        serializer = BookedCarSerializer(user_bookings, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    def delete(self, request, booking_id=None):
        try:
            booking = BookedCar.objects.get(id=booking_id, user=request.user)
            booking.delete()
            return Response({"message": "Booking successfully removed!"}, status=status.HTTP_200_OK)
        except BookedCar.DoesNotExist:
            return Response({"error": "Booking not found "}, status=status.HTTP_404_NOT_FOUND)
        
class UserProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]

    #  User Profile Details Fetch 
    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            # Agar profile model me phone number rakha hai:
            "phone": getattr(getattr(user, 'profile', None), 'phone', 'N/A') 
        }, status=status.HTTP_200_OK)

    #  Basic Details Update 
    def put(self, request):
        user = request.user
        data = request.data
        
        user.first_name = data.get('first_name', user.first_name)
        user.last_name = data.get('last_name', user.last_name)
        user.email = data.get('email', user.email)
        user.save()

        # Phone number update (agar profile model link hai)
        if hasattr(user, 'profile') and 'phone' in data:
            user.profile.phone = data['phone']
            user.profile.save()

        return Response({"message": "Profile updated successfully!"}, status=status.HTTP_200_OK)
    
class UserProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]

    #  GET Request (Refresh karne par yahan se data aayega)
    def get(self, request):
        user = request.user
        # Automatically get or create profile
        profile, _ = Profile.objects.get_or_create(user=user)
        
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "phone": profile.phone or ''
        }, status=status.HTTP_200_OK)

    #  PUT Request (Database me permanent save)
    def put(self, request):
        user = request.user
        data = request.data
        
        # Save User Fields
        user.first_name = data.get('first_name', user.first_name)
        user.last_name = data.get('last_name', user.last_name)
        user.email = data.get('email', user.email)
        user.save()

        # Save Phone Number in Profile Model
        profile, _ = Profile.objects.get_or_create(user=user)
        profile.phone = data.get('phone', profile.phone)
        profile.save()

        return Response({"message": "Profile updated successfully!"}, status=status.HTTP_200_OK)


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
                return Response({"error": "Latitude ya Longitude missing hai."}, status=status.HTTP_400_BAD_REQUEST)

        except Car.DoesNotExist:
            return Response({"error": "Car nahi mili."}, status=status.HTTP_404_NOT_FOUND)