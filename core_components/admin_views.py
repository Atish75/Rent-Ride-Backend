from django.contrib.admin.views.decorators import staff_member_required
from django.shortcuts import render
from django.db.models import Sum, Count
from decimal import Decimal
from .models import BookedCar

COMPANY_SHARE = Decimal("0.08")
DRIVER_SHARE = Decimal("0.25")
OWNER_SHARE = Decimal("0.67")


@staff_member_required
def earnings_summary_view(request):
    completed = BookedCar.objects.filter(status="COMPLETED")

    # Driver earnings grouped by driver
    driver_totals = (
        completed.exclude(driver__isnull=True)
        .values('driver__username')
        .annotate(trip_total=Sum('total_price'), trip_count=Count('id'))
        .order_by('-trip_total')
    )
    driver_rows = [
        {
            "name": row['driver__username'],
            "trips": row['trip_count'],
            "gross": row['trip_total'],
            "earning": round(row['trip_total'] * DRIVER_SHARE, 2),
        }
        for row in driver_totals
    ]

    # Owner earnings grouped by car's owner
    owner_totals = (
        completed.exclude(car__owner__isnull=True)
        .values('car__owner__username')
        .annotate(trip_total=Sum('total_price'), trip_count=Count('id'))
        .order_by('-trip_total')
    )
    owner_rows = [
        {
            "name": row['car__owner__username'],
            "trips": row['trip_count'],
            "gross": row['trip_total'],
            "earning": round(row['trip_total'] * OWNER_SHARE, 2),
        }
        for row in owner_totals
    ]

    # Customer spending grouped by customer name
    customer_totals = (
        completed.values('customer_name')
        .annotate(trip_total=Sum('total_price'), trip_count=Count('id'))
        .order_by('-trip_total')
    )
    customer_rows = [
        {"name": row['customer_name'], "trips": row['trip_count'], "spent": row['trip_total']}
        for row in customer_totals
    ]

    company_total = round(sum(r['gross'] for r in driver_rows) * COMPANY_SHARE, 2) if driver_rows else 0

    context = {
        "title": "Earnings Summary",
        "driver_rows": driver_rows,
        "owner_rows": owner_rows,
        "customer_rows": customer_rows,
        "company_total": company_total,
    }
    return render(request, "admin/earnings_summary.html", context)