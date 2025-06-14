from datetime import datetime
import re
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate, get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics, permissions
from django.http import HttpResponse
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
import pandas as pd
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4, letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.units import inch
from io import BytesIO
import json

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
        coordenadores = User.objects.filter(tipo_conta="coordenador").select_related('departamento')
        
        coordenadores_data = []
        for coordenador in coordenadores:
            coordenadores_data.append({
                "id": coordenador.id,
                "nome": coordenador.nome,
                "email": coordenador.email,
                "departamentoId": coordenador.departamento.id if coordenador.departamento else None,
                "departamento": {
                    "id": coordenador.departamento.id,
                    "nome": coordenador.departamento.nome
                } if coordenador.departamento else None
            })
        
        return Response(coordenadores_data)
    
class DocenteListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            # Buscar todos os usuários com tipo_conta = 'docente'
            docentes = User.objects.filter(tipo_conta='docente').select_related('departamento')
            
            docentes_data = []
            for docente in docentes:
                docente_info = {
                    'id': docente.id,
                    'nome': docente.nome,
                    'email': docente.email,
                    'departamento': None
                }
                
                # Verificar se o docente tem departamento associado
                if hasattr(docente, 'departamento') and docente.departamento:
                    docente_info['departamento'] = {
                        'id': docente.departamento.id,
                        'nome': docente.departamento.nome
                    }
                
                docentes_data.append(docente_info)
            
            print(f"Docentes encontrados: {len(docentes_data)}")  # Debug
            return Response(docentes_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"Erro ao buscar docentes: {str(e)}")  # Debug
            return Response(
                {"error": f"Erro ao buscar docentes: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class DocenteUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def put(self, request, id):
        try:
            docente = User.objects.get(id=id, tipo_conta="docente")
        except User.DoesNotExist:
            return Response({"detail": "Docente não encontrado."}, status=404)
        
        user = request.user
        
        # Se for coordenador, só pode atribuir/remover a si mesmo
        if user.tipo_conta == "coordenador":
            if not user.departamento:
                return Response({"detail": "Coordenador não tem departamento atribuído."}, status=403)
            
            # Atualizar coordenador e departamento
            action = request.data.get("action")  # "add" ou "remove"
            departamento_id = request.data.get("departamento_id")  # Receber departamento_id do frontend
            
            if action == "add":
                docente.coordenador = user
                # Se departamento_id foi fornecido, usar ele; senão, usar o departamento do coordenador
                if departamento_id:
                    try:
                        departamento = Departamento.objects.get(id=departamento_id)
                        docente.departamento = departamento
                    except Departamento.DoesNotExist:
                        return Response({"detail": "Departamento não encontrado."}, status=404)
                else:
                    # Usar o departamento do coordenador como padrão
                    docente.departamento = user.departamento
                    
            elif action == "remove":
                docente.coordenador = None
                # Não remover o departamento ao remover coordenador
            else:
                return Response({"detail": "Ação inválida."}, status=400)
        
        else:
            # Para admin, manter funcionalidade original
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
            } if docente.coordenador else None,
            "tem_coordenador": docente.coordenador is not None
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

            # Buscar apenas disponibilidades APROVADAS do docente
            disponibilidades_aprovadas = Disponibilidade.objects.filter(
                utilizador=user,
                dia__gte=data_inicio_dt,
                dia__lte=data_fim_dt,
                aprovacoes__status='aprovado'  # Filtrar apenas as aprovadas
            ).distinct()
            
            print(f"Disponibilidades aprovadas encontradas: {disponibilidades_aprovadas.count()}")  # Debug
            
            # Converter disponibilidades para formato de horário
            horarios_data = []
            for disp in disponibilidades_aprovadas:
                horarios_data.append({
                    'id': disp.id,
                    'dia': disp.dia.strftime('%Y-%m-%d'),
                    'hora_inicio': disp.hora_inicio.strftime('%H:%M'),
                    'hora_fim': disp.hora_fim.strftime('%H:%M'),
                    'disciplina': 'Aula Aprovada',  # Pode personalizar conforme necessário
                    'sala': 'Sala a definir',       # Pode personalizar conforme necessário
                    'semestre': disp.semestre,
                    'ano_letivo': disp.ano_letivo,
                    'status': 'aprovado'
                })
            
            return Response(horarios_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            import traceback
            print(traceback.format_exc())
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

class ExportarHorarioView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            formato = request.query_params.get('formato', 'pdf').lower()
            data_inicio = request.query_params.get('data_inicio')
            data_fim = request.query_params.get('data_fim')
            
            if not data_inicio or not data_fim:
                return Response(
                    {"error": "Parâmetros data_inicio e data_fim são obrigatórios"}, 
                    status=400
                )
            
            # Converter strings de data
            try:
                data_inicio_dt = datetime.strptime(data_inicio, '%Y-%m-%d').date()
                data_fim_dt = datetime.strptime(data_fim, '%Y-%m-%d').date()
            except ValueError:
                return Response(
                    {"error": "Formato de data inválido. Use YYYY-MM-DD"}, 
                    status=400
                )
            
            # Buscar disponibilidades aprovadas do docente
            disponibilidades_aprovadas = Disponibilidade.objects.filter(
                utilizador=request.user,
                dia__gte=data_inicio_dt,
                dia__lte=data_fim_dt,
                aprovacoes__status='aprovado'
            ).distinct().order_by('dia', 'hora_inicio')
            
            if formato == 'excel':
                return self.exportar_excel(disponibilidades_aprovadas, data_inicio, data_fim, request.user)
            elif formato == 'pdf':
                return self.exportar_pdf(disponibilidades_aprovadas, data_inicio, data_fim, request.user)
            else:
                return Response({"error": "Formato não suportado. Use 'pdf' ou 'excel'"}, status=400)
                
        except Exception as e:
            import traceback
            print(traceback.format_exc())
            return Response({"error": f"Erro interno: {str(e)}"}, status=500)
    
    def exportar_excel(self, disponibilidades, data_inicio, data_fim, user):
        """Exportar horário para Excel"""
        try:
            # Preparar dados para Excel
            dados = []
            dias_semana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
            
            for disp in disponibilidades:
                dia_semana = dias_semana[disp.dia.weekday()]
                dados.append({
                    'Data': disp.dia.strftime('%d/%m/%Y'),
                    'Dia da Semana': dia_semana,
                    'Hora Início': disp.hora_inicio.strftime('%H:%M'),
                    'Hora Fim': disp.hora_fim.strftime('%H:%M'),
                    'Disciplina': 'Aula Aprovada',
                    'Sala': 'Sala a definir',
                    'Semestre': disp.semestre,
                    'Ano Letivo': disp.ano_letivo,
                    'Status': 'Aprovado'
                })
            
            # Criar DataFrame
            if not dados:
                # Se não há dados, criar DataFrame vazio com colunas
                df = pd.DataFrame(columns=[
                    'Data', 'Dia da Semana', 'Hora Início', 'Hora Fim', 
                    'Disciplina', 'Sala', 'Semestre', 'Ano Letivo', 'Status'
                ])
                dados.append({
                    'Data': 'Nenhum horário encontrado',
                    'Dia da Semana': '-',
                    'Hora Início': '-',
                    'Hora Fim': '-',
                    'Disciplina': '-',
                    'Sala': '-',
                    'Semestre': '-',
                    'Ano Letivo': '-',
                    'Status': '-'
                })
                df = pd.DataFrame(dados)
            else:
                df = pd.DataFrame(dados)
            
            # Criar arquivo Excel em memória
            output = BytesIO()
            
            with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
                # Escrever dados na planilha
                df.to_excel(writer, index=False, sheet_name='Horário')
                
                # Obter workbook e worksheet para formatação
                workbook = writer.book
                worksheet = writer.sheets['Horário']
                
                # Formatar cabeçalho
                header_format = workbook.add_format({
                    'bold': True,
                    'text_wrap': True,
                    'valign': 'top',
                    'fg_color': '#D7E4BC',
                    'border': 1
                })
                
                # Aplicar formato ao cabeçalho
                for col_num, value in enumerate(df.columns.values):
                    worksheet.write(0, col_num, value, header_format)
                
                # Ajustar largura das colunas
                worksheet.set_column('A:A', 12)  # Data
                worksheet.set_column('B:B', 15)  # Dia da Semana
                worksheet.set_column('C:D', 12)  # Horas
                worksheet.set_column('E:E', 20)  # Disciplina
                worksheet.set_column('F:F', 15)  # Sala
                worksheet.set_column('G:H', 12)  # Semestre/Ano
                worksheet.set_column('I:I', 12)  # Status
                
                # Adicionar título
                title_format = workbook.add_format({
                    'bold': True,
                    'font_size': 16,
                    'align': 'center'
                })
                
                worksheet.merge_range('A1:I1', f'Horário de {user.nome} - {data_inicio} a {data_fim}', title_format)
                worksheet.set_row(0, 25)
            
            output.seek(0)
            
            # Criar resposta HTTP
            response = HttpResponse(
                output.getvalue(),
                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            response['Content-Disposition'] = f'attachment; filename="horario_{data_inicio}_{data_fim}.xlsx"'
            response['Access-Control-Expose-Headers'] = 'Content-Disposition'
            
            return response
            
        except Exception as e:
            import traceback
            print(traceback.format_exc())
            return Response({"error": f"Erro ao gerar Excel: {str(e)}"}, status=500)
    
    def exportar_pdf(self, disponibilidades, data_inicio, data_fim, user):
        """Exportar horário para PDF"""
        try:
            buffer = BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=A4)
            story = []
            
            # Estilos
            styles = getSampleStyleSheet()
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=16,
                textColor=colors.HexColor('#2c3e50'),
                alignment=1,  # Centralizado
                spaceAfter=20
            )
            
            # Título
            title = Paragraph(f'Horário de {user.nome}<br/>{data_inicio} a {data_fim}', title_style)
            story.append(title)
            story.append(Spacer(1, 20))
            
            if disponibilidades.exists():
                # Preparar dados para tabela
                dias_semana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
                
                # Cabeçalho da tabela
                data_table = [
                    ['Data', 'Dia', 'Horário', 'Disciplina', 'Sala', 'Status']
                ]
                
                # Dados da tabela
                for disp in disponibilidades:
                    dia_semana = dias_semana[disp.dia.weekday()]
                    horario = f"{disp.hora_inicio.strftime('%H:%M')}-{disp.hora_fim.strftime('%H:%M')}"
                    
                    data_table.append([
                        disp.dia.strftime('%d/%m/%Y'),
                        dia_semana,
                        horario,
                        'Aula Aprovada',
                        'Sala a definir',
                        'Aprovado'
                    ])
                
                # Criar tabela
                table = Table(data_table, colWidths=[80, 80, 80, 120, 100, 80])
                
                # Estilo da tabela
                table.setStyle(TableStyle([
                    # Cabeçalho
                    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#34495e')),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, 0), 10),
                    
                    # Corpo da tabela
                    ('BACKGROUND', (0, 1), (-1, -1), colors.white),
                    ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
                    ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                    ('FONTSIZE', (0, 1), (-1, -1), 9),
                    
                    # Bordas
                    ('GRID', (0, 0), (-1, -1), 1, colors.black),
                    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                    
                    # Alternating row colors
                    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8f9fa')])
                ]))
                
                story.append(table)
                
            else:
                # Mensagem se não há dados
                no_data_style = ParagraphStyle(
                    'NoData',
                    parent=styles['Normal'],
                    fontSize=12,
                    textColor=colors.HexColor('#7f8c8d'),
                    alignment=1
                )
                no_data = Paragraph('Nenhum horário aprovado encontrado para o período selecionado.', no_data_style)
                story.append(no_data)
            
            # Adicionar rodapé com data de geração
            story.append(Spacer(1, 30))
            footer_style = ParagraphStyle(
                'Footer',
                parent=styles['Normal'],
                fontSize=8,
                textColor=colors.HexColor('#95a5a6'),
                alignment=1
            )
            footer = Paragraph(f'Documento gerado em {datetime.now().strftime("%d/%m/%Y às %H:%M")}', footer_style)
            story.append(footer)
            
            # Construir PDF
            doc.build(story)
            
            buffer.seek(0)
            
            # Criar resposta HTTP
            response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="horario_{data_inicio}_{data_fim}.pdf"'
            response['Access-Control-Expose-Headers'] = 'Content-Disposition'
            
            return response
            
        except Exception as e:
            import traceback
            print(traceback.format_exc())
            return Response({"error": f"Erro ao gerar PDF: {str(e)}"}, status=500)


class VisualizarHorarioDocenteView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Buscar horários aprovados de um docente específico"""
        try:
            docente_id = request.query_params.get('docente_id')
            data_inicio = request.query_params.get('data_inicio')
            data_fim = request.query_params.get('data_fim')
            
            if not docente_id:
                return Response({"error": "ID do docente é obrigatório"}, status=400)
            
            if not data_inicio or not data_fim:
                return Response({"error": "Datas de início e fim são obrigatórias"}, status=400)
            
            # Verificar se o docente existe
            try:
                docente = User.objects.get(id=docente_id, tipo_conta='docente')
            except User.DoesNotExist:
                return Response({"error": "Docente não encontrado"}, status=404)
            
            # Converter strings de data
            try:
                data_inicio_dt = datetime.strptime(data_inicio, '%Y-%m-%d').date()
                data_fim_dt = datetime.strptime(data_fim, '%Y-%m-%d').date()
            except ValueError:
                return Response({"error": "Formato de data inválido. Use YYYY-MM-DD"}, status=400)
            
            # Buscar disponibilidades aprovadas do docente
            disponibilidades_aprovadas = Disponibilidade.objects.filter(
                utilizador=docente,
                dia__gte=data_inicio_dt,
                dia__lte=data_fim_dt,
                aprovacoes__status='aprovado'
            ).distinct().order_by('dia', 'hora_inicio')
            
            horarios_data = []
            for disp in disponibilidades_aprovadas:
                horarios_data.append({
                    'id': disp.id,
                    'dia': disp.dia.strftime('%Y-%m-%d'),
                    'hora_inicio': disp.hora_inicio.strftime('%H:%M'),
                    'hora_fim': disp.hora_fim.strftime('%H:%M'),
                    'disciplina': 'Aula Aprovada',
                    'sala': 'Sala a definir',
                    'status': 'aprovado',
                    'semestre': disp.semestre,
                    'ano_letivo': disp.ano_letivo
                })
            
            return Response(horarios_data, status=200)
            
        except Exception as e:
            import traceback
            print(traceback.format_exc())
            return Response({"error": f"Erro interno: {str(e)}"}, status=500)


class ExportarHorarioDocenteView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Exportar horário de um docente específico"""
        try:
            formato = request.query_params.get('formato', 'pdf').lower()
            docente_id = request.query_params.get('docente_id')
            data_inicio = request.query_params.get('data_inicio')
            data_fim = request.query_params.get('data_fim')
            
            if not docente_id:
                return Response({"error": "ID do docente é obrigatório"}, status=400)
            
            if not data_inicio or not data_fim:
                return Response({"error": "Datas de início e fim são obrigatórias"}, status=400)
            
            # Verificar se o docente existe
            try:
                docente = User.objects.get(id=docente_id, tipo_conta='docente')
            except User.DoesNotExist:
                return Response({"error": "Docente não encontrado"}, status=404)
            
            # Converter strings de data
            try:
                data_inicio_dt = datetime.strptime(data_inicio, '%Y-%m-%d').date()
                data_fim_dt = datetime.strptime(data_fim, '%Y-%m-%d').date()
            except ValueError:
                return Response({"error": "Formato de data inválido. Use YYYY-MM-DD"}, status=400)
            
            # Buscar disponibilidades aprovadas do docente
            disponibilidades_aprovadas = Disponibilidade.objects.filter(
                utilizador=docente,
                dia__gte=data_inicio_dt,
                dia__lte=data_fim_dt,
                aprovacoes__status='aprovado'
            ).distinct().order_by('dia', 'hora_inicio')
            
            if formato == 'excel':
                return self.exportar_excel_docente(disponibilidades_aprovadas, data_inicio, data_fim, docente)
            elif formato == 'pdf':
                return self.exportar_pdf_docente(disponibilidades_aprovadas, data_inicio, data_fim, docente)
            else:
                return Response({"error": "Formato não suportado. Use 'pdf' ou 'excel'"}, status=400)
                
        except Exception as e:
            import traceback
            print(traceback.format_exc())
            return Response({"error": f"Erro interno: {str(e)}"}, status=500)
    
    def exportar_excel_docente(self, disponibilidades, data_inicio, data_fim, docente):
        """Exportar horário do docente para Excel"""
        try:
            # Preparar dados para Excel
            dados = []
            dias_semana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
            
            for disp in disponibilidades:
                dia_semana = dias_semana[disp.dia.weekday()]
                dados.append({
                    'Data': disp.dia.strftime('%d/%m/%Y'),
                    'Dia da Semana': dia_semana,
                    'Hora Início': disp.hora_inicio.strftime('%H:%M'),
                    'Hora Fim': disp.hora_fim.strftime('%H:%M'),
                    'Disciplina': 'Aula Aprovada',
                    'Sala': 'Sala a definir',
                    'Semestre': disp.semestre,
                    'Ano Letivo': disp.ano_letivo,
                    'Status': 'Aprovado'
                })
            
            # Criar DataFrame
            if not dados:
                dados.append({
                    'Data': 'Nenhum horário encontrado',
                    'Dia da Semana': '-',
                    'Hora Início': '-',
                    'Hora Fim': '-',
                    'Disciplina': '-',
                    'Sala': '-',
                    'Semestre': '-',
                    'Ano Letivo': '-',
                    'Status': '-'
                })
            
            df = pd.DataFrame(dados)
            
            # Criar arquivo Excel em memória
            output = BytesIO()
            
            with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
                # Escrever dados na planilha
                df.to_excel(writer, index=False, sheet_name='Horário', startrow=2)
                
                # Obter workbook e worksheet para formatação
                workbook = writer.book
                worksheet = writer.sheets['Horário']
                
                # Formatar título
                title_format = workbook.add_format({
                    'bold': True,
                    'font_size': 16,
                    'align': 'center',
                    'valign': 'vcenter',
                    'fg_color': '#2c3e50',
                    'font_color': 'white'
                })
                
                # Adicionar título
                worksheet.merge_range('A1:I1', f'Horário de {docente.nome} - {data_inicio} a {data_fim}', title_format)
                worksheet.set_row(0, 25)
                
                # Formatar cabeçalho
                header_format = workbook.add_format({
                    'bold': True,
                    'text_wrap': True,
                    'valign': 'top',
                    'fg_color': '#34495e',
                    'font_color': 'white',
                    'border': 1
                })
                
                # Aplicar formato ao cabeçalho
                for col_num, value in enumerate(df.columns.values):
                    worksheet.write(2, col_num, value, header_format)
                
                # Ajustar largura das colunas
                worksheet.set_column('A:A', 12)  # Data
                worksheet.set_column('B:B', 15)  # Dia da Semana
                worksheet.set_column('C:D', 12)  # Horas
                worksheet.set_column('E:E', 20)  # Disciplina
                worksheet.set_column('F:F', 15)  # Sala
                worksheet.set_column('G:H', 12)  # Semestre/Ano
                worksheet.set_column('I:I', 12)  # Status
            
            output.seek(0)
            
            # Criar resposta HTTP
            response = HttpResponse(
                output.getvalue(),
                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            response['Content-Disposition'] = f'attachment; filename="horario_{docente.nome}_{data_inicio}_{data_fim}.xlsx"'
            response['Access-Control-Expose-Headers'] = 'Content-Disposition'
            
            return response
            
        except Exception as e:
            import traceback
            print(traceback.format_exc())
            return Response({"error": f"Erro ao gerar Excel: {str(e)}"}, status=500)
    
    def exportar_pdf_docente(self, disponibilidades, data_inicio, data_fim, docente):
        """Exportar horário do docente para PDF"""
        try:
            buffer = BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=A4)
            story = []
            
            # Estilos
            styles = getSampleStyleSheet()
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=18,
                textColor=colors.HexColor('#2c3e50'),
                alignment=1,  # Centralizado
                spaceAfter=20
            )
            
            subtitle_style = ParagraphStyle(
                'CustomSubtitle',
                parent=styles['Heading2'],
                fontSize=14,
                textColor=colors.HexColor('#34495e'),
                alignment=1,
                spaceAfter=15
            )
            
            # Título
            title = Paragraph(f'Horário do Docente', title_style)
            story.append(title)
            
            subtitle = Paragraph(f'{docente.nome}<br/>{data_inicio} a {data_fim}', subtitle_style)
            story.append(subtitle)
            story.append(Spacer(1, 20))
            
            if disponibilidades.exists():
                # Preparar dados para tabela
                dias_semana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
                
                # Cabeçalho da tabela
                data_table = [
                    ['Data', 'Dia', 'Horário', 'Disciplina', 'Sala', 'Status']
                ]
                
                # Dados da tabela
                for disp in disponibilidades:
                    dia_semana = dias_semana[disp.dia.weekday()]
                    horario = f"{disp.hora_inicio.strftime('%H:%M')}-{disp.hora_fim.strftime('%H:%M')}"
                    
                    data_table.append([
                        disp.dia.strftime('%d/%m/%Y'),
                        dia_semana,
                        horario,
                        'Aula Aprovada',
                        'Sala a definir',
                        'Aprovado'
                    ])
                
                # Criar tabela
                table = Table(data_table, colWidths=[80, 80, 80, 120, 100, 80])
                
                # Estilo da tabela
                table.setStyle(TableStyle([
                    # Cabeçalho
                    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#34495e')),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, 0), 10),
                    
                    # Corpo da tabela
                    ('BACKGROUND', (0, 1), (-1, -1), colors.white),
                    ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
                    ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                    ('FONTSIZE', (0, 1), (-1, -1), 9),
                    
                    # Bordas
                    ('GRID', (0, 0), (-1, -1), 1, colors.black),
                    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                    
                    # Alternating row colors
                    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8f9fa')])
                ]))
                
                story.append(table)
                
            else:
                # Mensagem se não há dados
                no_data_style = ParagraphStyle(
                    'NoData',
                    parent=styles['Normal'],
                    fontSize=12,
                    textColor=colors.HexColor('#7f8c8d'),
                    alignment=1
                )
                no_data = Paragraph('Nenhum horário aprovado encontrado para o período selecionado.', no_data_style)
                story.append(no_data)
            
            # Adicionar rodapé com data de geração
            story.append(Spacer(1, 30))
            footer_style = ParagraphStyle(
                'Footer',
                parent=styles['Normal'],
                fontSize=8,
                textColor=colors.HexColor('#95a5a6'),
                alignment=1
            )
            footer = Paragraph(f'Documento gerado em {datetime.now().strftime("%d/%m/%Y às %H:%M")}', footer_style)
            story.append(footer)
            
            # Construir PDF
            doc.build(story)
            
            buffer.seek(0)
            
            # Criar resposta HTTP
            response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="horario_{docente.nome}_{data_inicio}_{data_fim}.pdf"'
            response['Access-Control-Expose-Headers'] = 'Content-Disposition'
            
            return response
            
        except Exception as e:
            import traceback
            print(traceback.format_exc())
            return Response({"error": f"Erro ao gerar PDF: {str(e)}"}, status=500)


class CoordenadorUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def put(self, request, id):
        try:
            coordenador = User.objects.get(id=id, tipo_conta="coordenador")
        except User.DoesNotExist:
            return Response({"detail": "Coordenador não encontrado."}, status=404)
        
        # Atualizar departamento
        departamento_id = request.data.get("departamento_id")
        if departamento_id is not None:
            if departamento_id == "":
                coordenador.departamento = None
            else:
                try:
                    departamento = Departamento.objects.get(id=departamento_id)
                    coordenador.departamento = departamento
                except Departamento.DoesNotExist:
                    return Response({"detail": "Departamento não encontrado."}, status=404)
        
        coordenador.save()
        
        # Retornar dados atualizados do coordenador
        response_data = {
            "id": coordenador.id,
            "nome": coordenador.nome,
            "email": coordenador.email,
            "departamento": {
                "id": coordenador.departamento.id,
                "nome": coordenador.departamento.nome
            } if coordenador.departamento else None
        }
        
        return Response(response_data)

class VerificarDepartamentoDocenteView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Verificar se o docente tem departamento atribuído"""
        try:
            user = request.user
            
            # Verificar se é docente
            if user.tipo_conta != 'docente':
                return Response({
                    "tem_departamento": True,  # Não docentes não precisam de departamento
                    "message": "Usuário não é docente"
                })
            
            # Verificar se tem departamento
            tem_departamento = user.departamento is not None
            
            response_data = {
                "tem_departamento": tem_departamento,
                "departamento": {
                    "id": user.departamento.id,
                    "nome": user.departamento.nome
                } if user.departamento else None
            }
            
            return Response(response_data, status=200)
            
        except Exception as e:
            return Response({
                "error": f"Erro ao verificar departamento: {str(e)}",
                "tem_departamento": False
            }, status=500)

class CoordenadorPerfilView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Buscar informações do perfil do coordenador"""
        try:
            user = request.user
            
            # Verificar se é coordenador
            if user.tipo_conta != 'coordenador':
                return Response({
                    "detail": "Acesso negado. Apenas coordenadores podem acessar esta área."
                }, status=403)
            
            # Buscar informações do coordenador
            response_data = {
                "nome": user.nome,
                "email": user.email,
                "cargo": "Coordenador",
                "departamento": user.departamento.nome if user.departamento else "Não atribuído",
                "escola": user.departamento.escola.nome if user.departamento and hasattr(user.departamento, 'escola') and user.departamento.escola else "Não definida"
            }
            
            return Response(response_data, status=200)
            
        except Exception as e:
            return Response({
                "detail": f"Erro ao buscar informações do perfil: {str(e)}"
            }, status=500)


class CoordenadorAlterarNomeView(APIView):
    permission_classes = [IsAuthenticated]
    
    def put(self, request):
        """Alterar nome do coordenador"""
        try:
            user = request.user
            
            # Verificar se é coordenador
            if user.tipo_conta != 'coordenador':
                return Response({
                    "detail": "Acesso negado. Apenas coordenadores podem alterar o nome."
                }, status=403)
            
            novo_nome = request.data.get('novoNome')
            
            if not novo_nome:
                return Response({
                    "message": "Nome é obrigatório."
                }, status=400)
            
            # Validar nome
            if len(novo_nome.strip()) < 3:
                return Response({
                    "message": "Nome deve ter pelo menos 3 caracteres."
                }, status=400)
            
            # Verificar se o nome já existe (opcional)
            if User.objects.filter(nome=novo_nome.strip()).exclude(id=user.id).exists():
                return Response({
                    "message": "Este nome já está em uso."
                }, status=400)
            
            # Atualizar nome
            user.nome = novo_nome.strip()
            user.save()
            
            return Response({
                "message": "Nome alterado com sucesso!",
                "nome": user.nome
            }, status=200)
            
        except Exception as e:
            return Response({
                "message": f"Erro ao alterar nome: {str(e)}"
            }, status=500)

class DocentePerfilView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Buscar informações do perfil do docente"""
        try:
            user = request.user
            
            # Verificar se é docente
            if user.tipo_conta != 'docente':
                return Response({
                    "detail": "Acesso negado. Apenas docentes podem acessar esta área."
                }, status=403)
            
            # Buscar informações do docente
            response_data = {
                "nome": user.nome,
                "email": user.email,
                "cargo": "Docente",
                "departamento": user.departamento.nome if user.departamento else "Não atribuído",
                "escola": user.departamento.escola.nome if user.departamento and hasattr(user.departamento, 'escola') and user.departamento.escola else "Não definida"
            }
            
            return Response(response_data, status=200)
            
        except Exception as e:
            return Response({
                "detail": f"Erro ao buscar informações do perfil: {str(e)}"
            }, status=500)


class DocenteAlterarNomeView(APIView):
    permission_classes = [IsAuthenticated]
    
    def put(self, request):
        """Alterar nome do docente"""
        try:
            user = request.user
            
            # Verificar se é docente
            if user.tipo_conta != 'docente':
                return Response({
                    "detail": "Acesso negado. Apenas docentes podem alterar o nome."
                }, status=403)
            
            novo_nome = request.data.get('novoNome')
            
            if not novo_nome:
                return Response({
                    "message": "Nome é obrigatório."
                }, status=400)
            
            # Validar nome
            if len(novo_nome.strip()) < 3:
                return Response({
                    "message": "Nome deve ter pelo menos 3 caracteres."
                }, status=400)
            
            # Verificar se o nome já existe (opcional)
            if User.objects.filter(nome=novo_nome.strip()).exclude(id=user.id).exists():
                return Response({
                    "message": "Este nome já está em uso."
                }, status=400)
            
            # Atualizar nome
            user.nome = novo_nome.strip()
            user.save()
            
            return Response({
                "message": "Nome alterado com sucesso!",
                "nome": user.nome
            }, status=200)
            
        except Exception as e:
            return Response({
                "message": f"Erro ao alterar nome: {str(e)}"
            }, status=500)
