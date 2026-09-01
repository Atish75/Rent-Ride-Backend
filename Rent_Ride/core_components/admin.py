from django.contrib import admin
from decimal import Decimal
from django.urls import path 
from .models import Car, BookedCar
from .admin_views import earnings_summary_view 

COMPANY_SHARE = Decimal("0.08")

class RentRideAdminSite(admin.AdminSite):
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('earnings-summary/', self.admin_view(earnings_summary_view), name='earnings-summary'),
        ]
        return custom_urls + urls


# If you don't want to replace the whole admin site, simpler: just hook into the default one
def get_admin_urls(get_urls):
    def wrapper():
        urls = [
            path('earnings-summary/', admin.site.admin_view(earnings_summary_view), name='earnings-summary'),
        ]
        return urls + get_urls()
    return wrapper

admin.site.get_urls = get_admin_urls(admin.site.get_urls)
@admin.register(Car)
class CarAdmin(admin.ModelAdmin):
    list_display = ('name', 'brand', 'model_year', 'price_per_day', 'available')
    list_filter = ('brand', 'fuel_type', 'transmission', 'available')
    search_fields = ('name', 'brand')


@admin.register(BookedCar)
class BookedCarAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer_name', 'car', 'driver', 'start_date', 'end_date', 'total_price', 'company_earning', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('customer_name', 'car__name')
    date_hierarchy = 'created_at'

    def company_earning(self, obj):
        if obj.status == "COMPLETED":
            return f"₹{round(obj.total_price * COMPANY_SHARE, 2)}"
        return "—"
    company_earning.short_description = "Company Earning (8%)"