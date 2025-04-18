from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.hashers import make_password
from django.contrib.auth import authenticate, login, get_user_model
from .models import Utilizador

User = get_user_model()


class RegistoView(APIView):
    def post(self, request):
        tipo_conta = request.data.get('tipo_conta')
        nome = request.data.get('nome')
        email = request.data.get('email')
        senha = request.data.get('senha')

        print(f"Recebido tipo_conta: {tipo_conta}, nome: {nome}, email: {email}, senha: {senha}")

        if not tipo_conta or not nome or not email or not senha:
            return Response({"message": "Todos os campos são obrigatórios."}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({"message": "Email já registado!"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Cria o utilizador na tabela User
            user = User.objects.create(
                email=email,
                tipo_conta=tipo_conta,
                password=make_password(senha)
            )

            # Cria o registo complementar na tabela Utilizador
            utilizador = Utilizador.objects.create(
                user=user,
                nome=nome,
                tipo_conta=tipo_conta
            )

            print(f"Conta criada: {email}")
            return Response({
                "message": f"Conta {tipo_conta} criada com sucesso!",
                "tipo_conta": tipo_conta
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            print(f"Erro ao criar conta: {e}")
            return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LoginView(APIView):
    def post(self, request):
        email = request.data.get("email")
        senha = request.data.get("senha")

        if not email or not senha:
            return Response({"message": "Todos os campos são obrigatórios."}, status=status.HTTP_400_BAD_REQUEST)

        print(f"Login recebido para email: {email}, senha: {senha}")

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"message": "Email não registado"}, status=status.HTTP_400_BAD_REQUEST)

        # Autenticar (username=email por causa do USERNAME_FIELD)
        user = authenticate(request, username=email, password=senha)

        if user is not None:
            try:
                utilizador = Utilizador.objects.get(user=user)
                login(request, user)
                print(f"Login bem-sucedido: nome={utilizador.nome}, tipo_conta={utilizador.tipo_conta}")
                return Response({
                    "message": f"Login de {utilizador.tipo_conta} com sucesso",
                    "tipo_conta": utilizador.tipo_conta,
                    "nome": utilizador.nome
                }, status=status.HTTP_200_OK)
            except Utilizador.DoesNotExist:
                return Response({
                    "message": "Conta autenticada, mas não registada no sistema."
                }, status=status.HTTP_400_BAD_REQUEST)

        return Response({"message": "Palavra-passe incorreta"}, status=status.HTTP_400_BAD_REQUEST)
