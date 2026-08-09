# serializers.py
from rest_framework import serializers
from .models import Car,BookedCar

class CarSerializer(serializers.ModelSerializer):
    image = serializers.ImageField()
    owner_username = serializers.CharField(source='owner.username', read_only=True, default=None)
    class Meta:
        model = Car
        fields = '__all__'
        read_only_fields = ['owner']


class BookedCarSerializer(serializers.ModelSerializer):
    car = serializers.PrimaryKeyRelatedField(queryset=Car.objects.all())
    driver_username = serializers.CharField(source='driver.username', read_only=True, default=None)
    class Meta:
        model = BookedCar
        fields = "__all__"
        extra_kwargs = {
            "customer_name": {"required": True},
            "customer_email": {"required": False},
        }
    
    def to_representation(self, instance):
        # show nested car details when returning data
        representation = super().to_representation(instance)
        representation["car"] = CarSerializer(instance.car).data
        return representation