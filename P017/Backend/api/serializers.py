from rest_framework import serializers
from .models import Utilizador

class UtilizadorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Utilizador
        fields = ['email', 'senha', 'nome', 'tipo_conta']

    def create(self, validated_data):
        return Utilizador.objects.create(**validated_data)
