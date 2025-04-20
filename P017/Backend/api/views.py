import re
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate, login, get_user_model

User = get_user_model()


class RegistoView(APIView):
    def post(self, request):
        tipo_conta = request.data.get('tipo_conta')
        nome = request.data.get('nome')
        email = request.data.get('email')
        password = request.data.get('senha')  

        if not tipo_conta or not nome or not email or not password:
            return Response({"message": "Todos os campos são obrigatórios."}, status=status.HTTP_400_BAD_REQUEST)

        if not re.match(r"^[\w\.-]+@[\w\.-]+\.\w+$", email):
            return Response({"message": "Formato de email inválido."}, status=status.HTTP_400_BAD_REQUEST)

        if len(password) < 6:
            return Response({"message": "A senha deve ter pelo menos 6 caracteres."}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({"message": "Email já registado!"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.create_user(
                email=email,
                password=password,
                nome=nome,
                tipo_conta=tipo_conta
            )
            return Response({
                "message": f"Conta {tipo_conta} criada com sucesso!",
                "tipo_conta": tipo_conta
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LoginView(APIView):
    def post(self, request):
        email = request.data.get("email")
        senha = request.data.get("senha")

        if not email or not senha:
            return Response({"message": "Todos os campos são obrigatórios."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"message": "Email não registado"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"message": "Email não registado"}, status=status.HTTP_400_BAD_REQUEST)

       
        user = authenticate(request, email=email, password=senha)

        if user is not None:
            login(request, user)  
            return Response({
                "message": f"Login de {user.tipo_conta} com sucesso",
                "tipo_conta": user.tipo_conta,
                "nome": user.nome
            }, status=status.HTTP_200_OK)
        else:
            return Response({"message": "Palavra-passe incorreta"}, status=status.HTTP_400_BAD_REQUEST)

    
        


    
