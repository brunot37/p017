import re
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate, get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics, permissions
from .models import Horario, Disponibilidade
from .serializers import (
    HorarioSerializer,
    DisponibilidadeSerializer,
    UserTipoContaUpdateSerializer,
    UserSerializer,
)

User = get_user_model()

class RegistoView(APIView):
    def post(self, request):
        data = request.data
        nome = data.get('nome')
        email = data.get('email')
        password = data.get('password')

        if not nome or not email or not password:
            return Response({"message": "Todos os campos são obrigatórios."}, status=status.HTTP_400_BAD_REQUEST)

        if not re.match(r"^[\w\.-]+@[\w\.-]+\.\w+$", email):
            return Response({"message": "Formato de email inválido."}, status=status.HTTP_400_BAD_REQUEST)

        if len(password) < 6:
            return Response({"message": "A senha deve ter pelo menos 6 caracteres."}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({"message": "Email já registado!"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = UserSerializer(data={
            "email": email,
            "nome": nome,
            "password": password,
            "tipo_conta": "pendente"
        })

        if serializer.is_valid():
            try:
                serializer.save()
                return Response({
                    "message": "Conta criada com sucesso!",
                    "tipo_conta": "pendente"
                }, status=status.HTTP_201_CREATED)
            except Exception:
                return Response({"message": "Erro ao criar a conta."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            return Response({"message": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response({"message": "Todos os campos são obrigatórios."}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, email=email, password=password)

        if user is not None:
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)

            return Response({
                "message": f"Login de {user.tipo_conta} com sucesso",
                "tipo_conta": user.tipo_conta,
                "nome": user.nome,
                "token": access_token
            }, status=status.HTTP_200_OK)
        else:
            return Response({"message": "Credenciais inválidas"}, status=status.HTTP_400_BAD_REQUEST)


class UserTipoContaView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({"tipo_conta": user.tipo_conta})


class UserTipoContaUpdateView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserTipoContaUpdateSerializer
    permission_classes = [permissions.IsAdminUser]
    lookup_field = 'id'


class SubmeterHorarioView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        horarios = request.data.get('horarios', [])

        for horario_data in horarios:
            serializer = HorarioSerializer(data=horario_data)
            if serializer.is_valid():
                serializer.save(utilizador=user)
            else:
                return Response({"message": "Erro ao submeter horário."}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"message": "Horários submetidos com sucesso!"}, status=status.HTTP_201_CREATED)

    def get(self, request):
        user = request.user
        horarios = Horario.objects.filter(utilizador=user)
        serializer = HorarioSerializer(horarios, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ListarDocentesComHorarioView(APIView):
    def get(self, request):
        docentes_com_horarios = User.objects.filter(horario__isnull=False).distinct()

        docentes_data = []
        for docente in docentes_com_horarios:
            horarios = Horario.objects.filter(utilizador=docente)
            horarios_data = HorarioSerializer(horarios, many=True).data
            docentes_data.append({
                "id": docente.id,
                "nome": docente.nome,
                "disponibilidade": horarios_data,
            })

        return Response(docentes_data)


class ListUsersView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        users = User.objects.all()
        data = []
        for u in users:
            data.append({
                "id": u.id,
                "utilizador": u.nome,
                "cargo": u.tipo_conta,
                "email": u.email
            })
        return Response(data, status=status.HTTP_200_OK)
