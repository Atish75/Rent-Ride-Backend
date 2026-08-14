import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Car


class LocationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.car_id = self.scope['url_route']['kwargs']['car_id']
        self.group_name = f'car_{self.car_id}'

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        # Send the car's last known location immediately on connect
        car = await self.get_car()
        if car:
            await self.send(text_data=json.dumps({
                "latitude": car.latitude,
                "longitude": car.longitude,
                "name": car.name
            }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        latitude = data.get('latitude')
        longitude = data.get('longitude')

        if latitude is None or longitude is None:
            return

        await self.save_location(latitude, longitude)

        # Broadcast to everyone in this car's group (the customer tracking it)
        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "location_update",
                "latitude": latitude,
                "longitude": longitude,
            }
        )

    async def location_update(self, event):
        await self.send(text_data=json.dumps({
            "latitude": event["latitude"],
            "longitude": event["longitude"],
        }))

    @database_sync_to_async
    def get_car(self):
        try:
            return Car.objects.get(id=self.car_id)
        except Car.DoesNotExist:
            return None

    @database_sync_to_async
    def save_location(self, lat, lng):
        try:
            car = Car.objects.get(id=self.car_id)
            car.latitude = lat
            car.longitude = lng
            car.save(update_fields=['latitude', 'longitude'])
        except Car.DoesNotExist:
            pass