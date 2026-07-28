from django.contrib import admin

# Register your models here.
from .models import Car,BookedCar

@admin.register(Car)
class CarAdmin(admin.ModelAdmin):
    list_display = ('name', 'brand', 'model_year', 'price_per_day', 'available')
    list_filter = ('brand', 'fuel_type', 'transmission', 'available')
    search_fields = ('name', 'brand')
@admin.register(BookedCar)
class BookedCarAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer_name', 'car', 'start_date', 'end_date', 'total_price', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('customer_name', 'car__name')