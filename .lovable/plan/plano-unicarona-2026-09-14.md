# Plano — UniCarona

## Objetivo
Criar um protótipo completo e navegável em pt-BR para caronas universitárias em Belo Horizonte, com experiências de motorista e passageira, persistência no navegador e apresentação em desktop ou moldura de celular.

## Experiência principal
- Criar uma área autenticada com barra superior para tema claro/escuro, visualização desktop/mobile e troca rápida entre Bruno e Camila.
- Usar navegação interna para Início, Buscar carona, Publicar, Solicitações, Corrida ao vivo, Carteira, Painel e Perfil.
- No modo mobile, renderizar a mesma experiência dentro de uma moldura realista de smartphone, com barra de status e navegação inferior.
- Manter identidade violeta/lilás, tipografia Inter, contrastes fortes, cartões compactos, estados claros e animações discretas.

## Fluxos funcionais
- Cadastro e login com validação de e-mail acadêmico, telefone mascarado, senha com força visual e foto com prévia.
- Perfil editável, logout confirmado e exclusão de conta com alerta irreversível.
- Carteira simulada com configuração instantânea de chave PIX e bloqueio da publicação enquanto estiver pendente.
- Cadastro e edição de carona com sugestões de endereços, placa Mercosul, vagas e preço fixo explicado e bloqueado.
- Busca com filtros, perfil público do motorista, solicitação de vaga e confirmação do total de R$ 6,00.
- Caixa de solicitações do motorista com perfil do passageiro, aprovação, recusa confirmada, redução automática de vagas e QR PIX simulado.
- Detalhe da corrida com mapa ilustrado de Belo Horizonte, rota, veículo animado, tempo estimado, SOS e conclusão simulada.
- Painéis de motorista e passageira com métricas, gráfico semanal, histórico, recibos e economia estimada.

## Dados e persistência
- Criar uma camada única de estado em `localStorage`, inicializada no primeiro acesso com usuários, 6 caronas, solicitações, notificações, carteira e histórico realistas.
- Persistir sessão, tema, perfil, anúncios, solicitações, vagas, carteira e notificações após cada ação.
- Proteger a renderização inicial contra diferenças entre servidor e navegador e oferecer restauração dos dados de demonstração.

## Feedback e segurança de uso
- Exibir carregamento curto em buscas e salvamentos, toasts em toda ação e etiquetas para Pendente, Aprovada, Em andamento, Concluída e Cancelada.
- Validar campos em tempo real, aplicar máscaras e impedir envios inválidos.
- Confirmar logout, exclusão de conta, cancelamento de carona e recusa de passageiro em diálogos com consequências explícitas.
- Incluir breadcrumbs, estados vazios com ícones, tooltips e foco/teclado acessíveis.

## Organização técnica
- Manter a aplicação na rota principal, com telas internas controladas pelo estado para uma demonstração fluida e sem recarregamentos.
- Separar modelos e dados iniciais, estado persistente, moldura global, navegação, telas e diálogos reutilizáveis.
- Usar os componentes existentes de formulário, botões, abas, diálogos, avatares, badges, tooltips e Sonner.
- Definir todos os tokens visuais e animações no sistema global; não usar serviço externo, mapa remoto ou banco de dados.
- Adicionar metadados próprios do UniCarona e carregar Inter no documento.

## Validação final
- Verificar os principais fluxos nos dois usuários de teste.
- Conferir desktop e mobile em larguras reais, sem sobreposição ou corte de texto.
- Confirmar persistência após recarregar, alternância de tema, estados destrutivos e ausência de erros na página.
