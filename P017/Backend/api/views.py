from datetime import datetime
import re
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate, get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics, permissions
from .models import AprovacaoDisponibilidade, Coordenador, Departamento, Escola, Horario, Disponibilidade
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
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        docentes = User.objects.filter(tipo_conta="docente").select_related('departamento', 'coordenador')
        
        docentes_data = []
        for docente in docentes:
            docentes_data.append({
                "id": docente.id,
                "nome": docente.nome,
                "email": docente.email,
                "departamento": {
                    "id": docente.departamento.id,
                    "nome": docente.departamento.nome
                } if docente.departamento else None,
                "coordenador": {
                    "id": docente.coordenador.id,
                    "nome": docente.coordenador.nome
                } if docente.coordenador else None
            })
        
        return Response(docentes_data)


class DocenteUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def put(self, request, id):
        try:
            docente = User.objects.get(id=id, tipo_conta="docente")
        except User.DoesNotExist:
            return Response({"detail": "Docente não encontrado."}, status=404)
        
        # Atualizar departamento
        departamento_id = request.data.get("departamento_id")
        if departamento_id is not None:
            if departamento_id == "":
                docente.departamento = None
            else:
                try:
                    departamento = Departamento.objects.get(id=departamento_id)
                    docente.departamento = departamento
                except Departamento.DoesNotExist:
                    return Response({"detail": "Departamento não encontrado."}, status=404)
        
        # Atualizar coordenador (se fornecido)
        coordenador_id = request.data.get("coordenador_id")
        if coordenador_id:
            try:
                coordenador = User.objects.get(id=coordenador_id, tipo_conta="coordenador")
                docente.coordenador = coordenador
            except User.DoesNotExist:
                return Response({"detail": "Coordenador não encontrado."}, status=404)
        
        docente.save()
        
        # Retornar dados atualizados do docente
        response_data = {
            "id": docente.id,
            "nome": docente.nome,
            "email": docente.email,
            "departamento": {
                "id": docente.departamento.id,
                "nome": docente.departamento.nome
            } if docente.departamento else None,
            "coordenador": {
                "id": docente.coordenador.id,
                "nome": docente.coordenador.nome
            } if docente.coordenador else None
        }
        
        return Response(response_data)
    

class SubmeterDisponibilidadeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Apenas docentes podem submeter disponibilidades
        if request.user.tipo_conta != 'docente':
            return Response({"detail": "Apenas docentes podem submeter disponibilidades."}, status=403)
        
        horarios = request.data.get('horarios', [])
        
        if not horarios:
            return Response({"detail": "Nenhum horário fornecido."}, status=400)
        
        disponibilidades_criadas = []
        
        for horario_data in horarios:
            dia = horario_data.get('dia')
            hora_inicio = horario_data.get('hora_inicio')
            hora_fim = horario_data.get('hora_fim')
            semestre = horario_data.get('semestre')
            ano_letivo = horario_data.get('ano_letivo')
            
            if not all([dia, hora_inicio, hora_fim, semestre, ano_letivo]):
                return Response({"detail": "Dados incompletos no horário."}, status=400)
            
            # Verificar se já existe uma disponibilidade para este docente neste dia/hora
            disponibilidade_existente = Disponibilidade.objects.filter(
                utilizador=request.user,
                dia=dia,
                hora_inicio=hora_inicio,
                hora_fim=hora_fim
            ).first()
            
            if disponibilidade_existente:
                continue  # Pular se já existe
            
            # Criar nova disponibilidade
            disponibilidade = Disponibilidade.objects.create(
                utilizador=request.user,
                dia=dia,
                hora_inicio=hora_inicio,
                hora_fim=hora_fim,
                semestre=semestre,
                ano_letivo=ano_letivo
            )
            disponibilidades_criadas.append(disponibilidade)
        
        return Response({
            "message": "Disponibilidades submetidas com sucesso!",
            "total_criadas": len(disponibilidades_criadas)
        }, status=status.HTTP_201_CREATED)

    def get(self, request):
        # Buscar disponibilidades do docente logado
        if request.user.tipo_conta != 'docente':
            return Response({"detail": "Acesso negado."}, status=403)
        
        disponibilidades = Disponibilidade.objects.filter(utilizador=request.user).order_by('dia', 'hora_inicio')
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


class ConsultarDisponibilidadesView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        
        # Verificar se é coordenador ou admin
        if request.user.tipo_conta not in ['coordenador', 'adm']:
            return Response({
                "detail": f"Acesso negado. Tipo de conta atual: {request.user.tipo_conta}. Apenas coordenadores podem acessar esta área."
            }, status=403)
        
        try:
            # Buscar docentes que têm disponibilidades submetidas
            docentes_com_disponibilidades = User.objects.filter(
                tipo_conta='docente',
                disponibilidades__isnull=False
            ).distinct().prefetch_related('disponibilidades')
            
            print(f"Encontrados {docentes_com_disponibilidades.count()} docentes com disponibilidades")  # Debug
            
            docentes_data = []
            for docente in docentes_com_disponibilidades:
                disponibilidades = docente.disponibilidades.all().order_by('dia', 'hora_inicio')
                
                disponibilidades_agrupadas = {}
                
                for disp in disponibilidades:
                    dia_da_semana_num = disp.dia.weekday()  # 0=segunda, 1=terça, etc.
                    dias_semana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
                    dia_semana = dias_semana[dia_da_semana_num]
                    
                    if dia_semana not in disponibilidades_agrupadas:
                        disponibilidades_agrupadas[dia_semana] = []
                    
                    aprovacao = AprovacaoDisponibilidade.objects.filter(
                        disponibilidade=disp,
                        coordenador=request.user
                    ).first()
                    
                    status_aprovacao = aprovacao.status if aprovacao else 'pendente'
                    
                    hora_formatada = f"{disp.hora_inicio.strftime('%H:%M')}-{disp.hora_fim.strftime('%H:%M')}"
                    disponibilidades_agrupadas[dia_semana].append({
                        'id': disp.id,
                        'hora': hora_formatada,
                        'data': disp.dia.strftime('%Y-%m-%d'),
                        'semestre': disp.semestre,
                        'ano_letivo': disp.ano_letivo,
                        'status': status_aprovacao
                    })
                
                disponibilidade_lista = []
                for dia, detalhes in disponibilidades_agrupadas.items():
                    horas_disponiveis = [d['hora'] for d in detalhes if d['status'] == 'pendente']
                    
                    if horas_disponiveis:  # Só mostrar dias com disponibilidades pendentes
                        disponibilidade_lista.append({
                            'dia': dia,
                            'horas': horas_disponiveis,
                            'detalhes': detalhes
                        })
                
                if disponibilidade_lista:
                    docentes_data.append({
                        'id': docente.id,
                        'nome': docente.nome,
                        'email': docente.email,
                        'departamento': docente.departamento.nome if docente.departamento else None,
                        'disponibilidade': disponibilidade_lista
                    })
            
            return Response(docentes_data)
            
        except Exception as e:
            return Response({"detail": f"Erro interno: {str(e)}"}, status=500)


class GerenciarAprovacaoView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # Apenas coordenadores podem aprovar/rejeitar
        if request.user.tipo_conta != 'coordenador':
            return Response({"detail": "Acesso negado."}, status=403)
        
        disponibilidade_id = request.data.get('disponibilidade_id')
        acao = request.data.get('acao')  # 'aprovar' ou 'rejeitar'
        observacoes = request.data.get('observacoes', '')
        
        if not disponibilidade_id or not acao:
            return Response({"detail": "Dados incompletos."}, status=400)
        
        if acao not in ['aprovar', 'rejeitar']:
            return Response({"detail": "Ação inválida."}, status=400)
        
        try:
            disponibilidade = Disponibilidade.objects.get(id=disponibilidade_id)
        except Disponibilidade.DoesNotExist:
            return Response({"detail": "Disponibilidade não encontrada."}, status=404)
        
        # Criar ou atualizar aprovação
        status_aprovacao = 'aprovado' if acao == 'aprovar' else 'rejeitado'
        
        aprovacao, created = AprovacaoDisponibilidade.objects.get_or_create(
            disponibilidade=disponibilidade,
            coordenador=request.user,
            defaults={
                'status': status_aprovacao,
                'observacoes': observacoes
            }
        )
        
        if not created:
            aprovacao.status = status_aprovacao
            aprovacao.observacoes = observacoes
            aprovacao.save()
        
        return Response({
            "message": f"Disponibilidade {status_aprovacao} com sucesso!",
            "aprovacao": {
                "id": aprovacao.id,
                "status": aprovacao.status,
                "data_aprovacao": aprovacao.data_aprovacao
            }
        })
    
    def get(self, request):
        # Buscar aprovações do coordenador logado
        if request.user.tipo_conta != 'coordenador':
            return Response({"detail": "Acesso negado."}, status=403)
        
        aprovacoes = AprovacaoDisponibilidade.objects.filter(
            coordenador=request.user
        ).select_related('disponibilidade__utilizador')
        
        aprovacoes_data = []
        for aprovacao in aprovacoes:
            aprovacoes_data.append({
                "id": aprovacao.id,
                "docente_nome": aprovacao.disponibilidade.utilizador.nome,
                "dia": aprovacao.disponibilidade.dia.strftime('%Y-%m-%d'),
                "hora_inicio": aprovacao.disponibilidade.hora_inicio.strftime('%H:%M'),
                "hora_fim": aprovacao.disponibilidade.hora_fim.strftime('%H:%M'),
                "status": aprovacao.status,
                "data_aprovacao": aprovacao.data_aprovacao,
                "observacoes": aprovacao.observacoes
            })
        
        return Response(aprovacoes_data)


class UserInfoView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        return Response({
            'id': request.user.id,
            'nome': request.user.nome,
            'email': request.user.email,
            'tipo_conta': request.user.tipo_conta,
            'is_authenticated': True
        })