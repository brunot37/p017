from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from .models import Utilizador
from django.contrib.auth import authenticate

class RegistoView(APIView):
    def post(self, request):
        tipo_conta = request.data.get('tipo_conta')
        nome = request.data.get('nome')
        email = request.data.get('email')
        senha = request.data.get('senha')

        print(f"Recebido tipo_conta: {tipo_conta}, nome: {nome}, email: {email}, senha: {senha}") 

        if Utilizador.objects.filter(email=email).exists():
            return Response({"message": "Email já registrado!"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = Utilizador.objects.create(
                email=email,
                senha=make_password(senha),
                tipo_conta=tipo_conta,
                nome=nome
            )
            user.save()
            print(f"Conta criada: {user}")  
            return Response({"message": f"Conta {tipo_conta} criada com sucesso!"}, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(f"Erro ao criar conta: {str(e)}")  
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)



class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

       
        user = authenticate(request, username=email, password=password)

        if user is not None:
            
            return Response({
                "message": "Login bem-sucedido",
                "tipo_conta": user.tipo_conta if hasattr(user, 'tipo_conta') else 'desconhecido',
            }, status=status.HTTP_200_OK)
        else:
            
            return Response({
                "message": "Credenciais incorretas",
            }, status=status.HTTP_400_BAD_REQUEST)
