from datetime import datetime
import re
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate, get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics, permissions
from .models import Coordenador, Departamento, Escola, Horario, Disponibilidade
from .serializers import (
    CoordenadorSerializer,
    DepartamentoSerializer,
    EscolaSerializer,
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

        try:
            user = User.objects.get(email=email)
            if user.check_password(password):
                refresh = RefreshToken.for_user(user)
                access_token = str(refresh.access_token)

                if user.is_superuser or user.tipo_conta == 'adm':
                    tipo_conta = 'adm'
                else:
                    tipo_conta = user.tipo_conta

                return Response({
                    "message": f"Login de {tipo_conta} com sucesso",
                    "tipo_conta": tipo_conta,
                    "nome": user.nome if hasattr(user, 'nome') and user.nome else user.username,
                    "token": access_token
                }, status=status.HTTP_200_OK)
            else:
                return Response({"message": "Credenciais inválidas"}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
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
            if u.tipo_conta in ['adm']:
                cargo = 'administrador'
            else:
                cargo = u.tipo_conta
                
            data.append({
                "id": u.id,
                "utilizador": u.nome,
                "cargo": cargo,
                "email": u.email
            })
        return Response(data, status=status.HTTP_200_OK)


class DepartamentoListCreateView(APIView):
    def get(self, request):
        departamentos = Departamento.objects.all()
        serializer = DepartamentoSerializer(departamentos, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = DepartamentoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
class DepartamentoUpdateDeleteView(generics.UpdateAPIView):
    def delete(self, request, id):
        try:
            departamento = Departamento.objects.get(id=id)
            departamento.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Departamento.DoesNotExist:
            return Response({"detail": "Departamento não encontrado."}, status=status.HTTP_404_NOT_FOUND)


class EscolaListCreateView(APIView):
    def get(self, request):
        escolas = Escola.objects.all()
        serializer = EscolaSerializer(escolas, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = EscolaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EscolaUpdateDeleteView(generics.UpdateAPIView):
    queryset = Escola.objects.all()
    serializer_class = EscolaSerializer
    permission_classes = [permissions.IsAdminUser]
    lookup_field = 'id'

    def put(self, request, id):
        try:
            escola = Escola.objects.get(id=id)
        except Escola.DoesNotExist:
            return Response({"detail": "Escola não encontrada."}, status=status.HTTP_404_NOT_FOUND)
        serializer = EscolaSerializer(escola, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, id):
        try:
            escola = Escola.objects.get(id=id)
            escola.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Escola.DoesNotExist:
            return Response({"detail": "Escola não encontrada."}, status=status.HTTP_404_NOT_FOUND)
        
        
class CoordenadorListView(APIView):
    def get(self, request):
        coordenadores = User.objects.filter(tipo_conta="coordenador")
        serializer = UserSerializer(coordenadores, many=True)
        return Response(serializer.data)
    
class DocenteListView(APIView):
    def get(self, request):
        docentes = User.objects.filter(tipo_conta="docente")
        serializer = UserSerializer(docentes, many=True)
        return Response(serializer.data)


class DocenteUpdateView(APIView):
    def put(self, request, id):
        try:
            docente = User.objects.get(id=id, tipo_conta="docente")
        except User.DoesNotExist:
            return Response({"detail": "Docente não encontrado."}, status=404)
        coordenador_id = request.data.get("coordenador")
        if coordenador_id:
            try:
                coordenador = User.objects.get(id=coordenador_id, tipo_conta="coordenador")
                docente.coordenador = coordenador
            except User.DoesNotExist:
                return Response({"detail": "Coordenador não encontrado."}, status=404)
        else:
            docente.coordenador = None
        docente.save()
        serializer = UserSerializer(docente)
        return Response(serializer.data)
    

class SubmeterDisponibilidadeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        horarios = request.data.get('horarios', [])
        
        if not horarios:
            return Response({"message": "Nenhum horário fornecido."}, status=status.HTTP_400_BAD_REQUEST)
        
        submitted_disponibilidades = []
        
        for horario_data in horarios:
            try:
                serializer = DisponibilidadeSerializer(data={
                    'dia': horario_data.get('dia'),
                    'hora_inicio': horario_data.get('hora_inicio'),
                    'hora_fim': horario_data.get('hora_fim'),
                    'semestre': horario_data.get('semestre'),
                    'ano_letivo': horario_data.get('ano_letivo')
                })
                
                if serializer.is_valid():
                    disponibilidade = serializer.save(utilizador=user)
                    submitted_disponibilidades.append(disponibilidade)
                else:
                    return Response({
                        "message": "Erro ao submeter disponibilidade.",
                        "errors": serializer.errors
                    }, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return Response({
                    "message": f"Erro ao processar disponibilidade: {str(e)}"
                }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = DisponibilidadeSerializer(submitted_disponibilidades, many=True)
        return Response({
            "message": "Disponibilidades submetidas com sucesso!",
            "disponibilidades": serializer.data
        }, status=status.HTTP_201_CREATED)

    def get(self, request):
        user = request.user
        disponibilidades = Disponibilidade.objects.filter(utilizador=user)
        
        semestre = request.query_params.get('semestre')
        ano_letivo = request.query_params.get('ano_letivo')
        
        if semestre:
            disponibilidades = disponibilidades.filter(semestre=semestre)
        if ano_letivo:
            disponibilidades = disponibilidades.filter(ano_letivo=ano_letivo)
            
        serializer = DisponibilidadeSerializer(disponibilidades, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
def delete(self, request, id=None):
        if not id:
            return Response({"message": "ID da disponibilidade é obrigatório"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            disponibilidade = Disponibilidade.objects.get(id=id, utilizador=request.user)
            disponibilidade.delete()
            return Response({"message": "Disponibilidade removida com sucesso"}, status=status.HTTP_204_NO_CONTENT)
        except Disponibilidade.DoesNotExist:
            return Response({"message": "Disponibilidade não encontrada ou não pertence ao usuário"}, 
                          status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"message": f"Erro ao excluir: {str(e)}"}, 
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class VisualizarHorarioView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        data_inicio = request.query_params.get('data_inicio')
        data_fim = request.query_params.get('data_fim')
        
        if not data_inicio or not data_fim:
            return Response(
                {"message": "data_inicio e data_fim são parâmetros obrigatórios"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            data_inicio_dt = datetime.strptime(data_inicio, '%Y-%m-%d').date()
            data_fim_dt = datetime.strptime(data_fim, '%Y-%m-%d').date()

            horarios = Horario.objects.filter(
                utilizador=user,
                dia__gte=data_inicio_dt,
                dia__lte=data_fim_dt
            )
            
            serializer = HorarioSerializer(horarios, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"message": f"Erro ao buscar horários: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )