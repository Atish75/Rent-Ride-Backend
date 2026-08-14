from django.db import models
from cloudinary.models import CloudinaryField
from django.contrib.auth.models import User
# Create your models here.

class Car(models.Model):
    owner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='owned_cars')
    name = models.CharField(max_length=100)              # Car name (e.g., Toyota Corolla)
    brand = models.CharField(max_length=50)              # Brand (e.g., Toyota, BMW)
    model_year = models.PositiveIntegerField()           # Year of manufacture
    seats = models.PositiveIntegerField(default=4)       # Number of seats
    transmission = models.CharField(                    # Auto or Manual
        max_length=20,
        choices=[('Automatic', 'Automatic'), ('Manual', 'Manual')]
    )
    fuel_type = models.CharField(                       # Petrol, Diesel, Electric, Hybrid
        max_length=20,
        choices=[('Petrol', 'Petrol'), ('Diesel', 'Diesel'),
                 ('Electric', 'Electric'), ('Hybrid', 'Hybrid')]
    )
    price_per_day = models.DecimalField(max_digits=8, decimal_places=2)  # Rental price
    price_per_km = models.DecimalField(max_digits=8, decimal_places=2, default=0.0)  
    image = CloudinaryField('image',folder='rent_ride_project/cars')  # Car image
    available = models.BooleanField(default=True)        # Availability status
    latitude = models.FloatField(default=22.6139)   # Default Delhi Lat
    longitude = models.FloatField(default=88.2090)  # Default Delhi Lng

    def __str__(self):
        return f"{self.brand} {self.name} ({self.model_year})"

from django.db.models.signals import pre_delete
from django.dispatch import receiver
import cloudinary

@receiver(pre_delete, sender=Car)
def delete_car_image(sender, instance, **kwargs):
    if instance.image:
        # Cloudinary public_id is usually stored in the image field name
        public_id = instance.image.public_id if hasattr(instance.image, "public_id") else None
        if public_id:
            cloudinary.uploader.destroy(public_id)

class BookedCar(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    car = models.ForeignKey(Car, on_delete=models.CASCADE)
    customer_name = models.CharField(max_length=100)
    customer_email = models.EmailField(blank=True, null=True)
    start_point = models.CharField(max_length=255, blank=True, null=True)  
    end_point = models.CharField(max_length=255, blank=True, null=True)  
    start_lat = models.FloatField(blank=True, null=True)   #  new
    start_lng = models.FloatField(blank=True, null=True)   #  new
    end_lat = models.FloatField(blank=True, null=True)     #  new
    end_lng = models.FloatField(blank=True, null=True)     #  new
    distance_km = models.FloatField(blank=True, null=True) #  new
    trip_type = models.CharField(max_length=20, choices=[('DATE_RANGE', 'Multi-day Rental'), ('POINT_TO_POINT', 'One-way Trip')], default='DATE_RANGE')
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    status = models.CharField(max_length=30, default="BOOKED")
    created_at = models.DateTimeField(auto_now_add=True)
    driver = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='driving_bookings') 

    def __str__(self):
        return f"{self.car.name} - {self.status}"

    # class Meta:
    #     constraints = [
    #         models.UniqueConstraint(fields=["car"], name="unique_car_booking")
    #     ]
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=10, blank=True, null=True)
    is_driver = models.BooleanField(default=False)  
    is_owner = models.BooleanField(default=False)
    def __str__(self):
        return f"{self.user.username}'s Profile"