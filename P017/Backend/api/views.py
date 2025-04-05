from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.hashers import make_password
from .models import Utilizador
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import check_password

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
        senha = request.data.get("senha")

        try:
            user = Utilizador.objects.get(email=email)
        except Utilizador.DoesNotExist:
            return Response({"message": "Conta não registada"}, status=400)

        if check_password(senha, user.senha):
            return Response({
                "message": "Login bem-sucedido",
                "tipo_conta": user.tipo_conta
            }, status=200)
        else:
            return Response({"message": "Palavra-passe incorreta"}, status=400)