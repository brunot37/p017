from rest_framework import serializers
from .models import User  # Importar o modelo correto

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'password', 'nome', 'tipo_conta']
        extra_kwargs = {'password': {'write_only': True}}  # oculta o campo ao fazer GET

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)