from django.urls import path
from .views import CoordenadorListView, DepartamentoListCreateView, DepartamentoUpdateDeleteView, DocenteListView, DocenteUpdateView, EscolaListCreateView, EscolaUpdateDeleteView, LoginView, RegistoView, SubmeterDisponibilidadeView, UserTipoContaView, UserTipoContaUpdateView, SubmeterHorarioView, ListarDocentesComHorarioView, ListUsersView, VisualizarHorarioView, ConsultarDisponibilidadesView, GerenciarAprovacaoView, UserInfoView

urlpatterns = [
    path('registo', RegistoView.as_view(), name='registo'),
    path('login', LoginView.as_view(), name='login'),
    path('user/tipo-conta', UserTipoContaView.as_view(), name='user-tipo-conta'),
    path('user/tipo-conta/<int:id>/update', UserTipoContaUpdateView.as_view(), name='user-tipo-conta-update'),
    path('submeter-horario', SubmeterHorarioView.as_view(), name='submeter-horario'),
    path('listar-docentes-horario', ListarDocentesComHorarioView.as_view(), name='listar-docentes-horario'),
    path('users/list', ListUsersView.as_view(), name='list-users'),
    path('escolas', EscolaListCreateView.as_view(), name='escolas-list-create'),
    path('escolas/<int:id>', EscolaUpdateDeleteView.as_view(), name='escolas-update-view'),   
    path('departamentos', DepartamentoListCreateView.as_view(), name='departamentos-list-create'),
    path('departamentos/<int:id>', DepartamentoUpdateDeleteView.as_view(), name='departamentos-update-delete'),
    path('coordenadores', CoordenadorListView.as_view(), name='coordenadores-list'),
    path('docentes', DocenteListView.as_view(), name='docentes-list'),
    path('docentes/<int:id>', DocenteUpdateView.as_view(), name='docente-update'),
    path('submeter-disponibilidade', SubmeterDisponibilidadeView.as_view(), name='submeter-disponibilidade'),
    path('visualizar-horario', VisualizarHorarioView.as_view(), name='visualizar-horario'),
    path('user/info', UserInfoView.as_view(), name='user-info'),
    path('consultar-disponibilidades', ConsultarDisponibilidadesView.as_view(), name='consultar-disponibilidades'),
    path('gerenciar-aprovacao', GerenciarAprovacaoView.as_view(), name='gerenciar-aprovacao'),
]
