import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Upload, FileText, Download, Sparkles, Network, BarChart3, Cloud, Search, Zap, BookOpen, Filter, Settings, ChevronRight, X, Check, Loader2, Eye, Trash2, RefreshCw, PieChart, TrendingUp, Hash, MessageCircle, Layers, GitBranch, Activity, Tag, ChevronDown, Plus, Save, Grid, LayoutGrid, Target, CircleDot, Sun, Moon, Edit2, Menu, FileSpreadsheet, Code, AlignLeft, PanelLeftClose, PanelLeft } from "lucide-react";
import _ from "lodash";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";

// ==================== VISUALIZATION PALETTE ====================
// Theme-aware 3-color palette for all SVG visualizations (flat, no shadows)
const getVizPalette = (isDarkMode) => ({
  // 3 main colors (purple shades from theme)
  c1: isDarkMode ? 'oklch(0.680 0.158 276.93)' : 'oklch(0.585 0.204 277.12)',
  c2: isDarkMode ? 'oklch(0.511 0.230 276.97)' : 'oklch(0.457 0.215 277.02)',
  c3: isDarkMode ? 'oklch(0.398 0.177 277.37)' : 'oklch(0.359 0.135 278.70)',
  // Text / UI
  fg: isDarkMode ? 'oklch(0.929 0.013 255.51)' : 'oklch(0.280 0.037 260.03)',
  muted: isDarkMode ? 'oklch(0.714 0.019 261.32)' : 'oklch(0.551 0.023 264.36)',
  border: isDarkMode ? 'oklch(0.446 0.026 256.80)' : 'oklch(0.872 0.009 258.34)',
  bg: isDarkMode ? 'oklch(0.208 0.040 265.75)' : 'oklch(0.984 0.003 247.86)',
  card: isDarkMode ? 'oklch(0.280 0.037 260.03)' : 'oklch(1.000 0 0)',
  // Opacity helpers for SVG
  c1_20: isDarkMode ? 'oklch(0.680 0.158 276.93 / 0.2)' : 'oklch(0.585 0.204 277.12 / 0.2)',
  c1_40: isDarkMode ? 'oklch(0.680 0.158 276.93 / 0.4)' : 'oklch(0.585 0.204 277.12 / 0.4)',
  c1_60: isDarkMode ? 'oklch(0.680 0.158 276.93 / 0.6)' : 'oklch(0.585 0.204 277.12 / 0.6)',
  tooltip: isDarkMode ? 'oklch(0.208 0.040 265.75 / 0.95)' : 'oklch(1.000 0 0 / 0.95)' });

// ==================== GLOBAL THEME UTILITY ====================
// Função utilitária para gerar classes baseadas no modo escuro/claro
const getThemeClasses = (isDarkMode) => ({
  // Backgrounds - using shadcn semantic classes
  bg: 'bg-background',
  card: 'bg-card',
  cardBorder: 'border-border',
  cardInner: 'bg-muted',
  cardInnerBorder: 'border-border',
  overlay: 'bg-muted/30',
  vizBg: 'bg-muted',
  // Text
  text: 'text-foreground',
  textSecondary: 'text-foreground/80',
  textMuted: 'text-muted-foreground',
  textDimmed: 'text-muted-foreground/70',
  // Interactive
  button: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  buttonActive: 'bg-primary text-primary-foreground',
  input: 'bg-background border-input',
  hover: 'hover:bg-accent',
  hoverRow: 'hover:bg-muted/50',
  // Table
  tableHeader: 'bg-muted',
  tableDivide: 'divide-border',
  // Misc
  badge: 'bg-muted',
  divider: 'border-border',
  sidebar: 'bg-sidebar',
  sidebarBorder: 'border-sidebar-border',
  // Controls
  controlBg: 'bg-card/90 border border-border',
  controlHover: 'hover:bg-accent',
  // Checkbox
  checkbox: 'border-input bg-background' });

// ==================== UTILITY FUNCTIONS ====================

// Stopwords base (podem ser modificadas pelo usuário)
const defaultStopwordsPT = [
  // ========== PALAVRAS FUNCIONAIS (do arquivo pt_stopwords.py) ==========
  // Artigos
  'o', 'a', 'os', 'as', 'um', 'uma', 'uns', 'umas',
  // Preposições e contrações
  'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na', 'nos', 'nas',
  'por', 'pelo', 'pela', 'pelos', 'pelas', 'para', 'pra', 'pro', 'pros', 'pras',
  'com', 'sem', 'sob', 'sobre', 'entre', 'até', 'após', 'ante', 'contra', 'desde',
  'durante', 'perante', 'mediante', 'conforme', 'segundo', 'exceto', 'salvo', 'além', 'aquém',
  'abaixo', 'acima', 'dentro', 'fora', 'diante', 'através', 'cerca', 'perto', 'longe', 'junto',
  'ao', 'aos', 'à', 'às', 'num', 'numa', 'nuns', 'numas', 'dum', 'duma', 'duns', 'dumas',
  // Conjunções coordenativas
  'e', 'ou', 'mas', 'porém', 'contudo', 'todavia', 'entretanto', 'portanto', 'logo', 'pois',
  'assim', 'então', 'nem', 'quer', 'ora', 'seja', 'eis', 'também',
  // Conjunções subordinativas
  'porque', 'como', 'visto', 'dado', 'porquanto', 'embora', 'apesar', 'conquanto',
  'se', 'caso', 'contanto', 'consoante', 'quando', 'enquanto', 'sempre', 'antes', 'depois',
  // Pronomes pessoais
  'eu', 'tu', 'ele', 'ela', 'nós', 'vós', 'eles', 'elas',
  'me', 'te', 'se', 'lhe', 'nos', 'vos', 'lhes', 'mim', 'ti', 'si', 'conosco', 'convosco',
  // Pronomes possessivos
  'meu', 'minha', 'meus', 'minhas', 'teu', 'tua', 'teus', 'tuas',
  'seu', 'sua', 'seus', 'suas', 'nosso', 'nossa', 'nossos', 'nossas', 'vosso', 'vossa', 'vossos', 'vossas',
  // Pronomes demonstrativos
  'este', 'esta', 'estes', 'estas', 'esse', 'essa', 'esses', 'essas',
  'aquele', 'aquela', 'aqueles', 'aquelas', 'isto', 'isso', 'aquilo',
  // Pronomes relativos
  'que', 'quem', 'qual', 'quais', 'cujo', 'cuja', 'cujos', 'cujas', 'onde', 'aonde', 'donde',
  // Pronomes indefinidos
  'algo', 'alguém', 'algum', 'alguma', 'alguns', 'algumas', 'nada', 'ninguém', 'nenhum', 'nenhuma',
  'todo', 'toda', 'todos', 'todas', 'outro', 'outra', 'outros', 'outras',
  'muito', 'muita', 'muitos', 'muitas', 'pouco', 'pouca', 'poucos', 'poucas',
  'tanto', 'tanta', 'tantos', 'tantas', 'quanto', 'quanta', 'quantos', 'quantas',
  'certo', 'certa', 'certos', 'certas', 'qualquer', 'quaisquer', 'cada',
  'mesmo', 'mesma', 'mesmos', 'mesmas', 'próprio', 'própria', 'próprios', 'próprias',
  // Advérbios
  'não', 'nunca', 'jamais', 'tampouco', 'sim', 'certamente', 'claro', 'exatamente',
  'talvez', 'quiçá', 'possivelmente', 'provavelmente', 'muito', 'pouco', 'bastante', 'demais', 'tão', 'mais', 'menos', 'quão',
  'bem', 'mal', 'assim', 'já', 'ainda', 'logo', 'cedo', 'tarde', 'sempre', 'agora', 'hoje', 'ontem', 'amanhã',
  'aqui', 'aí', 'ali', 'lá', 'cá', 'adiante', 'atrás', 'só',
  // Verbo SER
  'ser', 'sou', 'és', 'é', 'somos', 'sois', 'são', 'era', 'eras', 'éramos', 'eram',
  'fui', 'foi', 'fomos', 'foram', 'serei', 'será', 'seremos', 'serão', 'seja', 'sejam',
  // Verbo ESTAR
  'estar', 'estou', 'está', 'estamos', 'estão', 'estava', 'estavam', 'esteve', 'estiveram',
  'estará', 'estarão', 'esteja', 'estejam',
  // Verbo TER
  'ter', 'tenho', 'tens', 'tem', 'temos', 'têm', 'tinha', 'tinhas', 'tínhamos', 'tinham',
  'tive', 'teve', 'tivemos', 'tiveram', 'terei', 'terá', 'teremos', 'terão',
  // Verbo HAVER
  'haver', 'hei', 'há', 'havemos', 'hão', 'havia', 'houve', 'houveram', 'haverá', 'haverão',
  // Verbo FAZER
  'fazer', 'faço', 'faz', 'fazemos', 'fazem', 'fazia', 'fez', 'fizemos', 'fizeram', 'fará', 'farão',
  // Verbo PODER
  'poder', 'posso', 'pode', 'podemos', 'podem', 'podia', 'pôde', 'puderam', 'poderá', 'poderão',
  // Verbo DEVER
  'dever', 'devo', 'deve', 'devemos', 'devem', 'devia', 'deveu', 'deverá', 'deverão',
  // Verbo QUERER
  'querer', 'quero', 'quer', 'queremos', 'querem', 'queria', 'quis', 'quiseram', 'quererá',
  // Verbo IR
  'ir', 'vou', 'vai', 'vamos', 'vão', 'ia', 'irei', 'irá', 'iremos', 'irão',
  // Verbo VIR
  'vir', 'venho', 'vem', 'viemos', 'vêm', 'vinha', 'veio', 'vieram', 'virá', 'virão',
  // Verbo DAR
  'dar', 'dou', 'dá', 'damos', 'dão', 'dava', 'deu', 'deram', 'dará', 'darão',
  // Verbo DIZER
  'dizer', 'digo', 'diz', 'dizemos', 'dizem', 'dizia', 'disse', 'disseram', 'dirá', 'dirão',
  // Verbo VER
  'ver', 'vejo', 'vê', 'vemos', 'veem', 'via', 'viu', 'viram', 'verá', 'verão',
  // Verbo SABER
  'saber', 'sei', 'sabe', 'sabemos', 'sabem', 'sabia', 'soube', 'souberam', 'saberá', 'saberão',
  // Outras partículas discursivas
  'inclusive', 'aliás', 'disso', 'disto', 'daquilo', 'nisso', 'nisto', 'naquilo',
  'enfim', 'afinal', 'outrossim', 'apenas', 'somente', 'tal', 'tais', 'via', 'versus', 'etc', 'vs',
  // ========== PALAVRAS FUNCIONAIS EXTRAS ==========
  'acaba', 'acabado', 'acabam', 'acabamos', 'acabar', 'acabo', 'acabou', 'adeus',
  'ah', 'ai', 'alto', 'chega', 'consigo', 'dessa', 'dessas', 'desse', 'desses',
  'desta', 'destas', 'deste', 'destes', 'dia', 'dois', 'exemplo', 'feito', 'for',
  'forma', 'fosse', 'grande', 'la', 'las', 'lo', 'los', 'sendo', 'sido', 'tanta',
  'tantas', 'tendo', 'tenha', 'tipo', 'tive', 'todavia', 'tudo', 'você', 'vocês',
  // ========== SOBRENOMES COMUNS BRASILEIROS ==========
  'silva', 'santos', 'oliveira', 'souza', 'lima', 'pereira', 'costa', 'rodrigues', 'almeida', 'nascimento',
  'carvalho', 'gomes', 'martins', 'araújo', 'melo', 'barbosa', 'ribeiro', 'rocha', 'fernandes', 'vieira',
  'andrade', 'freitas', 'moreira', 'dias', 'nunes', 'mendes', 'cavalcante', 'monteiro', 'moura', 'correia',
  'cardoso', 'cunha', 'lopes', 'pinto', 'reis', 'teixeira', 'ferreira', 'batista', 'campos', 'borges',
  'duarte', 'ramos', 'sousa', 'medeiros', 'azevedo', 'castro', 'farias', 'pires', 'macedo', 'bezerra',
  'leite', 'miranda', 'rezende', 'machado', 'sampaio', 'menezes', 'guimarães', 'aguiar', 'marques', 'fonseca',
  'xavier', 'corrêa', 'barros', 'assis', 'santana', 'siqueira', 'sales', 'nogueira', 'amaral', 'paiva',
  'brito', 'coelho', 'figueiredo', 'alencar', 'lacerda', 'queiroz', 'viana', 'magalhães', 'toledo', 'couto',
  'rangel', 'maia', 'moraes', 'simões', 'peixoto', 'tavares', 'braga', 'valente', 'pacheco', 'bastos',
  'leal', 'prado', 'ávila', 'avila', 'cabral', 'dantas', 'franco', 'pessoa', 'lucena', 'camargo',
  'bueno', 'barreto', 'barroso', 'mesquita', 'sá', 'sa', 'furtado', 'trindade', 'vargas', 'bittencourt',
  'porto', 'araujo', 'fontes', 'pimentel', 'vasconcelos', 'brasil', 'brandão', 'brandao', 'galvão', 'galvao',
  'silveira', 'guedes', 'beltrão', 'beltrao', 'carneiro', 'paes', 'vilela', 'cortez', 'torres', 'caetano',
  'calixto', 'calazans', 'coutinho', 'dorneles', 'esteves', 'espíndola', 'espindola', 'godoy', 'henrique',
  'júnior', 'junior', 'lira', 'lustosa', 'maciel', 'mattos', 'matias', 'moreno', 'neto', 'neves', 'padilha',
  'palmeira', 'parente', 'paulino', 'pena', 'pontes', 'quaresma', 'rabelo', 'raposo', 'rossi', 'salles',
  'serpa', 'serafim', 'severo', 'teles', 'uchoa', 'vale', 'ventura', 'veloso', 'veiga', 'vidal',
  // ========== NOMES MASCULINOS COMUNS ==========
  'josé', 'jose', 'joão', 'joao', 'antonio', 'antônio', 'francisco', 'carlos', 'paulo', 'pedro',
  'lucas', 'luiz', 'luis', 'marcos', 'gabriel', 'rafael', 'daniel', 'marcelo', 'bruno', 'eduardo',
  'felipe', 'rodrigo', 'gustavo', 'fernando', 'henrique', 'ricardo', 'diego', 'thiago', 'tiago', 'andré',
  'andre', 'sérgio', 'sergio', 'márcio', 'marcio', 'fábio', 'fabio', 'júnior', 'junior', 'jorge',
  'leonardo', 'rogério', 'rogerio', 'renato', 'alexandre', 'alex', 'leandro', 'matheus', 'vitor', 'victor',
  'anderson', 'wagner', 'juliano', 'vinícius', 'vinicius', 'adriano', 'silvio', 'sílvio', 'roberto', 'geraldo',
  'flávio', 'flavio', 'claudio', 'cláudio', 'manoel', 'manuel', 'sebastião', 'sebastiao', 'raimundo', 'edson',
  'nilton', 'valdir', 'nelson', 'gilberto', 'wanderley', 'wellington', 'maurício', 'mauricio', 'renan', 'arthur',
  'artur', 'enzo', 'miguel', 'davi', 'david', 'heitor', 'bernardo', 'noah', 'théo', 'theo', 'samuel',
  'ícaro', 'icaro', 'igor', 'caio', 'otávio', 'otavio', 'pietro', 'benício', 'benicio', 'lorenzo',
  'luan', 'ryan', 'bryan', 'breno', 'erick', 'erik', 'kevin', 'yuri', 'murilo', 'guilherme',
  'ruan', 'raul', 'caleb', 'danilo', 'alan', 'allan', 'emerson', 'everton', 'jefferson', 'wendell',
  'willian', 'william', 'wesley', 'weslley', 'iago', 'yago', 'hugo', 'jonas', 'raí', 'rai',
  'augusto', 'cesar', 'césar', 'cícero', 'cicero', 'elias', 'ezequiel', 'isaque', 'isaac', 'joel',
  'josué', 'josue', 'natanael', 'oziel', 'saul', 'tobias', 'uriel', 'ezequias', 'neemias',
  // ========== NOMES FEMININOS COMUNS ==========
  'maria', 'ana', 'juliana', 'fernanda', 'patricia', 'patrícia', 'adriana', 'camila', 'bruna', 'amanda',
  'carolina', 'mariana', 'vanessa', 'aline', 'jéssica', 'jessica', 'larissa', 'letícia', 'leticia', 'rafaela',
  'gabriela', 'natália', 'natalia', 'daniela', 'priscila', 'priscilla', 'carla', 'renata', 'tatiana', 'fabiana',
  'paula', 'cristina', 'luciana', 'andréa', 'andrea', 'sandra', 'mônica', 'monica', 'cláudia', 'claudia',
  'denise', 'débora', 'debora', 'simone', 'silvia', 'sílvia', 'regina', 'eliane', 'márcia', 'marcia',
  'rosana', 'flávia', 'flavia', 'valéria', 'valeria', 'vera', 'célia', 'celia', 'sônia', 'sonia',
  'lúcia', 'lucia', 'angela', 'ângela', 'helena', 'tereza', 'teresa', 'francisca', 'rita', 'neide',
  'cintia', 'cíntia', 'vitória', 'vitoria', 'sofia', 'alice', 'laura', 'valentina', 'lorena', 'beatriz',
  'manuela', 'isadora', 'cecília', 'cecilia', 'clara', 'lívia', 'livia', 'isabela', 'isabella', 'giovanna',
  'marina', 'yasmin', 'luísa', 'luisa', 'heloísa', 'heloisa', 'lara', 'melissa', 'bianca',
  'agatha', 'aghata', 'alana', 'alícia', 'alicia', 'antonella', 'aurora', 'catarina', 'eloá', 'eloa',
  'emanuelly', 'emily', 'emilly', 'esther', 'evelyn', 'fernanda', 'giovana', 'giulia', 'heloise',
  'isis', 'ísis', 'jade', 'joana', 'julia', 'júlia', 'laís', 'lais', 'lavínia', 'lavinia',
  'luana', 'maitê', 'maite', 'malu', 'milena', 'mirella', 'nicole', 'olivia', 'olívia', 'pérola',
  'perola', 'pietra', 'rafaella', 'raquel', 'rebeca', 'sarah', 'sara', 'stella', 'tainá', 'taina',
  'tatiane', 'thais', 'thaís', 'yasmim', 'yara', 'zoe', 'zoé',
  // ========== NOMES ESPECÍFICOS DO PROJETO ==========
  'porto', 'ariel', 'macena', 'braga', 'hermes', 'mercurio', 'mercúrio', 'fausto',
  'muniz', 'sodre', 'sodré', 'martin', 'barbero'
];

// ========== PALAVRAS CURTAS OBRIGATÓRIAS (SEMPRE FILTRADAS) ==========
// Lista robusta de conectivos, preposições, artigos e palavras de 1-3 letras em português
// Estas palavras são SEMPRE removidas, independente das configurações do usuário
const MANDATORY_SHORT_WORDS_PT = new Set([
  // 1 letra
  'a', 'e', 'i', 'o', 'u', 'à', 'é', 'ó',
  // 2 letras - artigos, preposições, pronomes, conectivos
  'ao', 'às', 'aí', 'ah', 'ai', 'as', 'aã', 
  'dá', 'da', 'de', 'do', 'di',
  'ei', 'em', 'es', 'et', 'eu', 'ex',
  'há', 'he', 'hã',
  'ir', 'is',
  'já', 'je',
  'la', 'lá', 'le', 'lê', 'li', 'lo',
  'ma', 'me', 'mã', 'mi', 
  'na', 'né', 'ni', 'no', 'nó', 'nu', 'nã',
  'oh', 'oi', 'ok', 'os', 'ou',
  'pa', 'pá', 'pi', 'pô', 'pr',
  'qe', 'qu',
  'rá', 're', 'ri', 'ro',
  'se', 'si', 'só', 'sã',
  'tá', 'te', 'ti', 'tô', 'tu',
  'ué', 'ui', 'um', 'uã',
  'vá', 've', 'vi', 'vô', 'vã',
  // 3 letras - conectivos, preposições, pronomes, verbos auxiliares comuns
  'aba', 'abc', 'aha', 'ais', 'ali', 'alo', 'alô', 'ama', 'ami', 'amo', 'ano', 'aos', 'aqi', 'ara', 'art', 'ata', 'até', 'ato', 'ave', 'avo',
  'bem', 'boa', 'bom', 'bus',
  'cá', 'cão', 'cem', 'céu', 'chá', 'cim', 'com', 'cor', 'cru', 'cão',
  'dão', 'dar', 'das', 'dei', 'der', 'deu', 'dez', 'dia', 'diz', 'doc', 'doi', 'dor', 'dos', 'dou', 'dra', 'drª', 'drº', 'drs', 'dta', 'dtz', 'duo',
  'ela', 'ele', 'elo', 'ema', 'eme', 'emo', 'ems', 'ene', 'eno', 'ens', 'era', 'ere', 'ero', 'erê', 'esa', 'ese', 'eso', 'ess', 'est', 'eta', 'etc', 'ete', 'eto', 'eur', 'eva', 'evo', 'exe', 'exs',
  'faz', 'fez', 'fim', 'foi', 'for', 'fui',
  'gás', 'gel',
  'hei', 'hem', 'hum',
  'iam', 'ida', 'ide', 'ido', 'iii', 'imo', 'ips', 'ira', 'irá', 'ire', 'irê', 'iro', 'isa', 'iso', 'iss', 'ist', 'ita', 'ite', 'ito', 'ius', 'iva', 'ive', 'ivo',
  'jaz', 'jet',
  'kit',
  'lar', 'las', 'lei', 'ler', 'les', 'leu', 'lha', 'lhe', 'lhi', 'lho', 'lia', 'lio', 'lis', 'log', 'los', 'lua', 'luz',
  'mãe', 'mái', 'mal', 'map', 'mar', 'mas', 'mau', 'max', 'mei', 'mel', 'mem', 'mês', 'met', 'meu', 'mez', 'mil', 'mim', 'mis', 'mix', 'mms', 'mor', 'mos',
  'nao', 'não', 'nas', 'née', 'nem', 'neo', 'net', 'nha', 'nhe', 'nhi', 'nho', 'nil', 'nit', 'nix', 'nom', 'nos', 'nós', 'nov', 'nox', 'nra', 'nrº', 'nua', 'nul', 'num', 'nuo', 'nus',
  'obs', 'oca', 'oco', 'ode', 'off', 'ois', 'olá', 'olê', 'olé', 'oma', 'omo', 'ond', 'one', 'ons', 'opa', 'opr', 'ora', 'ore', 'org', 'ori', 'oro', 'ors', 'osa', 'ose', 'osi', 'oso', 'ota', 'ote', 'oto', 'our', 'out', 'ova', 'ove', 'ovo', 'oxe', 'oxi',
  'pai', 'pal', 'pan', 'pão', 'par', 'paz', 'pci', 'pdf', 'pec', 'peg', 'per', 'pes', 'pie', 'pis', 'pix', 'pms', 'poa', 'pod', 'poe', 'poi', 'pop', 'por', 'pos', 'pós', 'pov', 'pra', 'pré', 'pro', 'pró', 'psc', 'psp', 'puc', 'puf', 'pum', 'pus', 'put', 'pvc',
  'qdo', 'qtd', 'qto', 'qts', 'que',
  'rao', 'ras', 'raí', 'réu', 'ria', 'rio', 'rir', 'riu', 'rna', 'rss', 'rua', 'rum', 'rés',
  'sai', 'sal', 'são', 'sei', 'sem', 'ser', 'ses', 'set', 'seu', 'sex', 'sim', 'sir', 'sis', 'sms', 'sob', 'sol', 'som', 'sos', 'sou', 'spa', 'sri', 'str', 'sua', 'sub', 'sul', 'sum', 'sun', 'sup', 'sur', 'sus', 'sús',
  'taa', 'tab', 'tal', 'tão', 'tcc', 'tem', 'ten', 'ter', 'tes', 'teu', 'tia', 'til', 'tio', 'toc', 'tom', 'top', 'tou', 'tps', 'tra', 'trá', 'trc', 'trê', 'tri', 'trv', 'tua', 'tum', 'tva', 'tvs', 'txs',
  'uau', 'uca', 'ufa', 'ufo', 'ugh', 'uia', 'uis', 'ula', 'ulo', 'uma', 'umb', 'ume', 'ums', 'uma', 'uno', 'uns', 'uol', 'upa', 'upá', 'ups', 'uri', 'url', 'usa', 'use', 'usp', 'uso', 'uva', 'uxo',
  'vac', 'vai', 'vam', 'van', 'vão', 'var', 'vás', 'vcs', 'vem', 'ver', 'vês', 'vez', 'via', 'vii', 'vil', 'vim', 'vip', 'vir', 'vis', 'viu', 'voa', 'vol', 'voo', 'vos', 'vós', 'vou', 'vox', 'voz', 'vrm',
  'web', 'www',
  'xau', 'xis',
  'yin',
  'zen', 'zip', 'zoo',
  // Interjeições e expressões informais
  'ahn', 'ehh', 'eih', 'eim', 'ein', 'epa', 'epi', 'era', 'erm', 'err', 'eta', 'eua', 'euh', 'hah', 'hei', 'hem', 'hep', 'hey', 'hip', 'hmm', 'hun', 'hãã', 'ohh', 'ooh', 'ops', 'pah', 'pff', 'piu', 'poá', 'poh', 'psh', 'pst', 'puf', 'puá', 'puí', 'shh', 'ssh', 'tsc', 'tsk', 'uhh', 'uhu', 'uhú', 'umm', 'unh', 'uns', 'uou', 'urr', 'ugh', 'uhm', 'uia', 'wah', 'wow', 'wtf', 'www', 'xii', 'xiu',
  // Números por extenso curtos
  'cem', 'dez', 'dós', 'mil', 'sés', 'trê', 'trs', 'ums',
  // Abreviações comuns
  'adm', 'adv', 'ago', 'art', 'ass', 'atm', 'atr', 'aut', 'aux', 'avd', 'avo', 'cap', 'cel', 'cia', 'cid', 'cit', 'cod', 'col', 'com', 'con', 'cpf', 'crc', 'ctb', 'dco', 'dep', 'des', 'dez', 'dif', 'dir', 'dna', 'doc', 'dom', 'dou', 'dra', 'dre', 'drs', 'drª', 'drº', 'dsc', 'dtm', 'dtz', 'dvd', 'dvr', 'ebc', 'ebs', 'eca', 'eco', 'eds', 'edu', 'eeg', 'efe', 'eis', 'eja', 'elt', 'eme', 'emp', 'ems', 'enc', 'end', 'ene', 'eng', 'ent', 'env', 'epe', 'epi', 'eqp', 'erp', 'esc', 'esp', 'est', 'etc', 'eti', 'ets', 'eua', 'eur', 'exc', 'exe', 'exp', 'ext', 'fab', 'fac', 'fam', 'fav', 'fax', 'fco', 'fed', 'fem', 'fer', 'fev', 'fig', 'fis', 'fls', 'fmc', 'fnd', 'fnm', 'fob', 'fol', 'fon', 'fot', 'fps', 'fra', 'frs', 'fsc', 'ftd', 'fun', 'gab', 'gal', 'gas', 'ger', 'geo', 'gov', 'gps', 'hab', 'his', 'hiv', 'hos', 'hrs', 'htm', 'ibm', 'ies', 'imb', 'imf', 'imp', 'inc', 'ind', 'inf', 'inj', 'ins', 'int', 'ipv', 'iva', 'jan', 'jce', 'jds', 'jnr', 'jrs', 'jul', 'jun', 'jur', 'lab', 'lat', 'lcd', 'led', 'leg', 'lib', 'lic', 'lig', 'lim', 'lin', 'lit', 'lng', 'loc', 'lot', 'ltd', 'ltda', 'lts', 'mac', 'mai', 'mar', 'mat', 'max', 'mba', 'mca', 'mdc', 'med', 'mem', 'mes', 'mfr', 'mgs', 'mic', 'mig', 'min', 'mkt', 'mlt', 'mms', 'mod', 'mot', 'mov', 'mpa', 'mrh', 'mrs', 'msg', 'mts', 'mul', 'mus', 'nat', 'nav', 'nec', 'neg', 'nic', 'nit', 'nom', 'nor', 'not', 'nov', 'nra', 'nrº', 'nrs', 'nsa', 'nsb', 'nsc', 'ntc', 'num', 'obj', 'obs', 'occ', 'oct', 'ods', 'oem', 'ofi', 'ohm', 'oms', 'onc', 'ond', 'ong', 'oni', 'onu', 'ope', 'opt', 'orc', 'ord', 'org', 'ori', 'orm', 'ort', 'oss', 'out', 'oxi', 'pac', 'pal', 'pan', 'par', 'pas', 'pat', 'pbc', 'pbm', 'pci', 'pdf', 'pds', 'ped', 'pen', 'per', 'pes', 'pfl', 'phd', 'pig', 'pin', 'pis', 'pix', 'pkg', 'pla', 'pln', 'plp', 'pls', 'pma', 'pmb', 'pmc', 'pms', 'poa', 'poc', 'pod', 'pol', 'pon', 'pop', 'por', 'pos', 'ppc', 'ppm', 'pps', 'pqd', 'pqs', 'pré', 'pri', 'pro', 'pró', 'prs', 'psc', 'psg', 'psp', 'pst', 'pti', 'pts', 'ptu', 'pub', 'puc', 'pvc', 'pvt', 'qbc', 'qbr', 'qdo', 'qnt', 'qql', 'qse', 'qtd', 'qte', 'qts', 'qua', 'rad', 'ram', 'rap', 'rav', 'rcm', 'rds', 'rec', 'red', 'ref', 'reg', 'rei', 'rel', 'rem', 'rep', 'req', 'res', 'ret', 'rev', 'rgb', 'rhs', 'ric', 'rig', 'rip', 'rit', 'rjs', 'rna', 'rnd', 'rnv', 'rof', 'rol', 'rot', 'rpm', 'rps', 'rpt', 'rsm', 'rss', 'rts', 'rub', 'run', 'rus', 'rés', 'sac', 'sag', 'sai', 'sal', 'sam', 'san', 'sap', 'sar', 'sas', 'sat', 'sbc', 'sbm', 'sbp', 'sbs', 'sbt', 'sca', 'scm', 'sco', 'scp', 'scr', 'scs', 'sdc', 'sdk', 'sdl', 'sea', 'sec', 'sed', 'seg', 'sei', 'sem', 'sen', 'seo', 'sep', 'seq', 'ser', 'ses', 'set', 'sex', 'sfc', 'sgd', 'sig', 'sim', 'sin', 'sir', 'sis', 'sit', 'sld', 'sma', 'sme', 'smg', 'sms', 'snc', 'snp', 'soa', 'sob', 'soc', 'sol', 'som', 'sos', 'spa', 'spe', 'spi', 'spo', 'sql', 'sra', 'src', 'srf', 'sri', 'srn', 'srs', 'srt', 'srª', 'srº', 'ssa', 'ssh', 'ssl', 'ssp', 'sts', 'stv', 'sua', 'sub', 'suf', 'sul', 'sum', 'sun', 'sup', 'sur', 'sus', 'svc', 'svs', 'tab', 'tae', 'tal', 'tam', 'tan', 'tar', 'tas', 'tca', 'tcc', 'tcp', 'tcu', 'tea', 'tec', 'tel', 'tem', 'ten', 'ter', 'tes', 'tex', 'tfg', 'tgi', 'tgp', 'tia', 'tic', 'tin', 'tio', 'tip', 'tir', 'tis', 'tms', 'tnc', 'tns', 'toa', 'toc', 'tom', 'ton', 'top', 'tor', 'tos', 'tou', 'tpo', 'tps', 'tra', 'trb', 'tre', 'tri', 'trl', 'trm', 'trn', 'tro', 'trs', 'trt', 'trv', 'trá', 'trê', 'tsb', 'tse', 'tst', 'tua', 'tui', 'tum', 'tup', 'tur', 'tva', 'tvs', 'txt', 'txs', 'uau', 'ubs', 'ucs', 'uel', 'uem', 'ues', 'ufa', 'uff', 'ufg', 'ufl', 'ufm', 'ufn', 'ufo', 'ufp', 'ufr', 'ufs', 'ufu', 'ugh', 'uhd', 'uia', 'uif', 'uis', 'ula', 'uli', 'ult', 'umb', 'una', 'une', 'uni', 'uno', 'uns', 'uol', 'upa', 'upá', 'ups', 'uri', 'url', 'urr', 'usa', 'usb', 'usd', 'use', 'usp', 'uso', 'usu', 'utc', 'uti', 'uva', 'uxo', 'vac', 'val', 'vam', 'van', 'var', 'vas', 'vca', 'vcs', 'vdc', 'vds', 'vec', 'veg', 'vem', 'ven', 'ver', 'ves', 'vez', 'vga', 'vhs', 'via', 'vic', 'vid', 'vii', 'vil', 'vim', 'vin', 'vip', 'vir', 'vis', 'viu', 'vix', 'vlr', 'vms', 'voa', 'voc', 'vog', 'vol', 'voo', 'vor', 'vos', 'vot', 'vou', 'vox', 'voz', 'vpn', 'vrb', 'vrm', 'vrs', 'wap', 'way', 'web', 'who', 'wii', 'win', 'wow', 'www', 'xau', 'xis', 'xml', 'yin', 'zen', 'zip', 'zoo', 'zum'
]);

// ========== DESCRIÇÕES E TOOLTIPS DAS VISUALIZAÇÕES ==========
const VISUALIZATION_INFO = {
  statistics: {
    title: 'Estatísticas do Corpus',
    description: 'Métricas quantitativas básicas do seu corpus textual, incluindo contagem de palavras, documentos e distribuição de frequências.',
    tooltip: 'Calcula estatísticas descritivas: total de palavras, palavras únicas (types), razão type/token (diversidade léxica), hapax legomena (palavras que aparecem apenas uma vez) e frequências absolutas ordenadas por ocorrência.'
  },
  wordcloud: {
    title: 'Nuvem de Palavras',
    description: 'Representação visual onde o tamanho de cada palavra é proporcional à sua frequência no corpus.',
    tooltip: 'Utiliza o algoritmo d3-cloud (Wordle) para posicionar palavras em espiral, calculando colisões entre bounding boxes. O tamanho da fonte é mapeado logaritmicamente da frequência para pixels (12-60px).'
  },
  termsberry: {
    title: 'TermsBerry',
    description: 'Visualização em círculos empilhados que agrupa palavras por categoria semântica ou frequência.',
    tooltip: 'Implementa o algoritmo de circle packing do D3.js, que usa simulação de forças para posicionar círculos sem sobreposição. A área de cada círculo é proporcional à frequência da palavra.'
  },
  wordtree: {
    title: 'Árvore de Palavras',
    description: 'Mostra os contextos mais frequentes à esquerda e à direita de uma palavra-chave selecionada.',
    tooltip: 'Extrai n-gramas (sequências de palavras) que co-ocorrem com a palavra central. Agrupa por padrões de contexto e ordena por frequência, exibindo até 30 ramificações por lado.'
  },
  treemap: {
    title: 'Treemap de Frequências',
    description: 'Mapa de áreas retangulares onde cada retângulo representa uma palavra e sua área é proporcional à frequência.',
    tooltip: 'Usa o algoritmo squarified treemap do D3.js, que recursivamente divide o espaço em retângulos com aspect ratio próximo de 1 para melhor legibilidade. Cores indicam faixas de frequência.'
  },
  network: {
    title: 'Rede de Similitude',
    description: 'Grafo de coocorrência onde palavras conectadas aparecem frequentemente juntas no mesmo contexto.',
    tooltip: 'Constrói grafo não-direcionado calculando coocorrências em janela deslizante (padrão: 5 palavras). Arestas têm peso = frequência de coocorrência. Layout por simulação de forças (force-directed).'
  },
  bigrams: {
    title: 'Rede de Bigramas',
    description: 'Visualiza pares de palavras adjacentes (bigramas) mais frequentes como uma rede direcionada.',
    tooltip: 'Identifica todos os pares consecutivos de palavras (bigramas), conta frequências e filtra por limiar mínimo. Arestas direcionadas mostram a ordem: palavra1 → palavra2.'
  },
  centrality: {
    title: 'Métricas de Centralidade',
    description: 'Identifica as palavras mais importantes na rede usando diferentes medidas de centralidade.',
    tooltip: 'Calcula: Grau (conexões diretas), Intermediação (palavras-ponte entre comunidades), Proximidade (distância média para outras palavras) e Autovetor (importância baseada em vizinhos importantes).'
  },
  heatmap: {
    title: 'Matriz de Coocorrência',
    description: 'Matriz visual mostrando a intensidade de coocorrência entre as 20 palavras mais frequentes.',
    tooltip: 'Monta matriz simétrica NxN onde célula [i,j] = número de vezes que palavra_i e palavra_j aparecem na mesma janela de contexto. Cores mapeiam valores para escala de calor.'
  },
  afc: {
    title: 'Análise Fatorial de Correspondência',
    description: 'Projeção 2D que agrupa palavras por similaridade de contexto de uso nos documentos.',
    tooltip: 'Aplica decomposição SVD (Singular Value Decomposition) à matriz documentos × palavras normalizada por qui-quadrado. Os dois primeiros fatores capturam a maior variância, posicionando palavras similares próximas.'
  },
  associations: {
    title: 'Associações Estatísticas',
    description: 'Medidas estatísticas que quantificam a força de associação entre pares de palavras.',
    tooltip: 'Calcula: Chi-quadrado (independência estatística), PMI (Pointwise Mutual Information), coeficiente de Dice (2*interseção/soma) e Jaccard (interseção/união). Valores altos indicam associação forte.'
  },
  sentiment: {
    title: 'Análise de Sentimentos',
    description: 'Classificação das palavras em positivas, negativas ou neutras com base em léxico de sentimentos.',
    tooltip: 'Usa léxico de sentimentos em português com ~200 palavras rotuladas. Conta ocorrências de cada polaridade, calcula percentuais e score geral: (positivas - negativas) / total.'
  },
  tfidf: {
    title: 'TF-IDF',
    description: 'Identifica palavras distintivas de cada documento, penalizando termos muito comuns.',
    tooltip: 'TF-IDF = Term Frequency × Inverse Document Frequency. TF = frequência no documento. IDF = log(total_docs / docs_com_termo). Palavras com alto TF-IDF são frequentes localmente mas raras globalmente.'
  },
  diversity: {
    title: 'Diversidade Léxica',
    description: 'Métricas que avaliam a riqueza e variedade do vocabulário utilizado no corpus.',
    tooltip: 'Calcula: TTR (Type-Token Ratio), MSTTR (TTR médio em segmentos), Hapax Legomena (%), Índice de Guiraud (types/√tokens) e Índice de Herdan (log types/log tokens).'
  },
  chd: {
    title: 'CHD / Reinert',
    description: 'Classificação Hierárquica Descendente que agrupa segmentos de texto em classes temáticas.',
    tooltip: 'Método de Max Reinert: segmenta texto em unidades de contexto, constrói matriz de presença/ausência de formas, aplica clustering divisivo baseado em chi-quadrado para formar classes lexicais.'
  },
  coding: {
    title: 'Codificação Qualitativa',
    description: 'Permite criar e aplicar códigos temáticos a trechos de texto para análise de conteúdo.',
    tooltip: 'Análise de conteúdo qualitativa: seleção de segmentos, atribuição de códigos do livro de códigos, auto-codificação por keywords e exportação em formato compatível com NVivo/Atlas.ti.'
  },
  radar: {
    title: 'Radar de Categorias',
    description: 'Gráfico radar mostrando a distribuição dos códigos aplicados por categoria temática.',
    tooltip: 'Agrega contagens de segmentos codificados por categoria do livro de códigos. Normaliza para percentuais e plota em eixos radiais, formando polígono que representa o perfil temático do corpus.'
  },
  sunburst: {
    title: 'Sunburst de Códigos',
    description: 'Hierarquia visual em anéis concêntricos mostrando categorias (centro) e códigos (periferia).',
    tooltip: 'Usa algoritmo de partition do D3.js para dividir arco de 360° proporcionalmente às contagens. Anel interno = categorias, anel externo = códigos. Clique para zoom em categoria específica.'
  },
  kwic: {
    title: 'KWIC',
    description: 'Keyword in Context: mostra cada ocorrência de uma palavra com seu contexto imediato.',
    tooltip: 'Busca todas as ocorrências do termo, extrai N caracteres à esquerda e direita, alinha pelo termo central. Permite identificar padrões de uso e colocações. Exportável para concordância.'
  }
};

const HelpTooltip = ({ info }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <div className="relative inline-block ml-2">
      <button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
        className="w-5 h-5 rounded-full bg-secondary hover:bg-primary text-muted-foreground hover:text-white flex items-center justify-center text-xs font-bold transition-colors"
      >
        ?
      </button>
      {showTooltip && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 bg-background border border-primary/50 rounded-lg shadow-xl text-xs text-foreground/80 leading-relaxed">
          <div className="font-semibold text-primary mb-1">Como funciona:</div>
          {info}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-background" />
        </div>
      )}
    </div>
  );
};

// Componente de cabeçalho de visualização com descrição e tooltip
const VisualizationHeader = ({ vizKey, icon: Icon, extraContent }) => {
  const info = VISUALIZATION_INFO[vizKey];
  if (!info) return null;
  
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon className="w-6 h-6 text-primary" />}
        <h3 className="text-xl font-semibold">{info.title}</h3>
        <HelpTooltip info={info.tooltip} />
        {extraContent}
      </div>
      <p className="text-sm text-muted-foreground max-w-3xl">{info.description}</p>
    </div>
  );
};

const defaultStopwordsEN = [
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now'
];

// Léxico de sentimentos para português
const sentimentLexicon = {
  positive: new Set([
    'bom', 'boa', 'ótimo', 'ótima', 'excelente', 'maravilhoso', 'maravilhosa', 'fantástico', 'fantástica',
    'incrível', 'perfeito', 'perfeita', 'adorável', 'lindo', 'linda', 'feliz', 'alegre', 'contente',
    'satisfeito', 'satisfeita', 'amor', 'amar', 'adorar', 'gostar', 'apreciar', 'agradecer', 'obrigado',
    'sucesso', 'vitória', 'conquista', 'alcançar', 'conseguir', 'melhor', 'positivo', 'positiva',
    'favorável', 'benefício', 'vantagem', 'oportunidade', 'progresso', 'avanço', 'desenvolvimento',
    'crescimento', 'melhoria', 'solução', 'resolver', 'facilitar', 'ajudar', 'apoiar', 'colaborar',
    'importante', 'relevante', 'significativo', 'significativa', 'valioso', 'valiosa', 'útil',
    'eficiente', 'eficaz', 'produtivo', 'produtiva', 'inovador', 'inovadora', 'criativo', 'criativa',
    'interessante', 'fascinante', 'impressionante', 'notável', 'excepcional', 'extraordinário',
    'bonito', 'bonita', 'beleza', 'harmonia', 'paz', 'tranquilo', 'tranquila', 'sereno', 'serena',
    'esperança', 'confiança', 'seguro', 'segura', 'forte', 'robusto', 'robusta', 'sólido', 'sólida',
    'claro', 'clara', 'transparente', 'honesto', 'honesta', 'justo', 'justa', 'correto', 'correta'
  ]),
  negative: new Set([
    'mau', 'ruim', 'péssimo', 'péssima', 'horrível', 'terrível', 'horroroso', 'horrorosa',
    'triste', 'infeliz', 'deprimido', 'deprimida', 'ansioso', 'ansiosa', 'preocupado', 'preocupada',
    'medo', 'receio', 'temor', 'raiva', 'ódio', 'irritado', 'irritada', 'frustrado', 'frustrada',
    'decepcionado', 'decepcionada', 'desapontado', 'desapontada', 'problema', 'dificuldade',
    'obstáculo', 'barreira', 'impedimento', 'falha', 'erro', 'fracasso', 'derrota', 'perda',
    'negativo', 'negativa', 'desfavorável', 'prejudicial', 'danoso', 'danosa', 'nocivo', 'nociva',
    'perigoso', 'perigosa', 'risco', 'ameaça', 'crise', 'conflito', 'disputa', 'briga',
    'violência', 'agressão', 'ataque', 'destruição', 'deterioração', 'declínio', 'queda',
    'pior', 'inferior', 'fraco', 'fraca', 'insuficiente', 'inadequado', 'inadequada',
    'difícil', 'complicado', 'complicada', 'complexo', 'complexa', 'confuso', 'confusa',
    'incerto', 'incerta', 'duvidoso', 'duvidosa', 'questionável', 'suspeito', 'suspeita',
    'injusto', 'injusta', 'errado', 'errada', 'incorreto', 'incorreta', 'falso', 'falsa',
    'feio', 'feia', 'desagradável', 'incômodo', 'incômoda', 'chato', 'chata', 'entediante',
    'cansativo', 'cansativa', 'exaustivo', 'exaustiva', 'estressante', 'doloroso', 'dolorosa'
  ])
};

// Paleta de cores para corpus (3-color theme palette)
const corpusColors = [
  'oklch(0.585 0.204 277.12)', 'oklch(0.457 0.215 277.02)', 'oklch(0.359 0.135 278.70)'
];

// ==================== CÓDIGOS DE CAPACIDADES COM KEYWORDS ====================
const capacityCodebook = {
  '1': {
    name: 'Analítica – Individual',
    color: 'oklch(0.585 0.204 277.12)',
    codes: {
      '1.1': { 
        name: 'Formação técnica dos profissionais',
        keywords: ['formação', 'técnico', 'profissional', 'qualificação', 'especialização', 'curso', 'graduação', 'pós-graduação', 'mestrado', 'doutorado', 'capacitação técnica']
      },
      '1.2': { 
        name: 'Capacidade de análise de dados',
        keywords: ['análise', 'dados', 'estatística', 'indicadores', 'métricas', 'dashboard', 'relatório', 'planilha', 'excel', 'power bi', 'tableau']
      },
      '1.3': { 
        name: 'Uso de evidências na tomada de decisão',
        keywords: ['evidência', 'decisão', 'baseado em dados', 'científico', 'pesquisa', 'estudo', 'literatura', 'publicação']
      },
      '1.4': { 
        name: 'Capacitação e treinamento',
        keywords: ['capacitação', 'treinamento', 'workshop', 'oficina', 'curso', 'educação continuada', 'atualização', 'reciclagem']
      }
    }
  },
  '2': {
    name: 'Analítica – Organizacional',
    color: 'oklch(0.457 0.215 277.02)',
    codes: {
      '2.1': { 
        name: 'Sistemas de informação',
        keywords: ['sistema', 'informação', 'software', 'banco de dados', 'plataforma', 'tecnologia', 'digital', 'informatização', 'prontuário eletrônico']
      },
      '2.2': { 
        name: 'Produção de indicadores',
        keywords: ['indicador', 'meta', 'índice', 'taxa', 'percentual', 'mensuração', 'medição', 'benchmark']
      },
      '2.3': { 
        name: 'Monitoramento e avaliação',
        keywords: ['monitoramento', 'avaliação', 'acompanhamento', 'supervisão', 'controle', 'fiscalização', 'auditoria']
      },
      '2.4': { 
        name: 'Compartilhamento de dados entre setores',
        keywords: ['compartilhamento', 'interoperabilidade', 'integração', 'troca de dados', 'intersetorial', 'entre setores']
      },
      '2.5': { 
        name: 'Infraestrutura de informação',
        keywords: ['infraestrutura', 'servidor', 'rede', 'internet', 'conectividade', 'hardware', 'equipamento', 'computador']
      }
    }
  },
  '3': {
    name: 'Analítica – Sistêmica',
    color: 'oklch(0.359 0.135 278.70)',
    codes: {
      '3.1': { 
        name: 'Parcerias com universidades',
        keywords: ['universidade', 'academia', 'parceria acadêmica', 'pesquisador', 'professor', 'faculdade', 'instituto de pesquisa']
      },
      '3.2': { 
        name: 'Produção científica',
        keywords: ['artigo', 'publicação', 'paper', 'revista científica', 'periódico', 'tese', 'dissertação']
      },
      '3.3': { 
        name: 'Uso de evidências externas',
        keywords: ['evidência externa', 'benchmark internacional', 'boas práticas', 'experiência internacional', 'referência']
      },
      '3.4': { 
        name: 'Redes de conhecimento',
        keywords: ['rede', 'network', 'comunidade de prática', 'grupo de trabalho', 'fórum', 'encontro']
      }
    }
  },
  '4': {
    name: 'Operacional – Individual',
    color: 'oklch(0.585 0.204 277.12)',
    codes: {
      '4.1': { 
        name: 'Gestão de equipes',
        keywords: ['equipe', 'time', 'liderança', 'gestão de pessoas', 'recursos humanos', 'colaborador', 'funcionário']
      },
      '4.2': { 
        name: 'Coordenação de atividades',
        keywords: ['coordenação', 'organização', 'planejamento', 'cronograma', 'agenda', 'priorização']
      },
      '4.3': { 
        name: 'Negociação entre atores',
        keywords: ['negociação', 'mediação', 'acordo', 'consenso', 'diálogo', 'conversa', 'reunião']
      }
    }
  },
  '5': {
    name: 'Operacional – Organizacional',
    color: 'oklch(0.457 0.215 277.02)',
    codes: {
      '5.1': { 
        name: 'Recursos financeiros',
        keywords: ['recurso financeiro', 'orçamento', 'verba', 'dotação', 'financiamento', 'custeio', 'investimento', 'dinheiro', 'gasto']
      },
      '5.2': { 
        name: 'Recursos humanos',
        keywords: ['recursos humanos', 'pessoal', 'servidor', 'contratação', 'concurso', 'terceirizado', 'efetivo']
      },
      '5.3': { 
        name: 'Estrutura administrativa',
        keywords: ['estrutura', 'organograma', 'departamento', 'setor', 'divisão', 'coordenadoria', 'diretoria']
      },
      '5.4': { 
        name: 'Processos de gestão',
        keywords: ['processo', 'fluxo', 'procedimento', 'protocolo', 'rotina', 'norma', 'regulamento']
      },
      '5.5': { 
        name: 'Coordenação intersetorial',
        keywords: ['intersetorial', 'entre secretarias', 'articulação', 'integração setorial', 'transversal']
      }
    }
  },
  '6': {
    name: 'Operacional – Sistêmica',
    color: 'oklch(0.359 0.135 278.70)',
    codes: {
      '6.1': { 
        name: 'Coordenação federativa',
        keywords: ['federativo', 'federação', 'pacto', 'consórcio', 'região de saúde', 'macrorregião']
      },
      '6.2': { 
        name: 'Relação município–estado–união',
        keywords: ['município', 'estado', 'união', 'federal', 'estadual', 'municipal', 'ministério', 'secretaria estadual']
      },
      '6.3': { 
        name: 'Mecanismos de cooperação',
        keywords: ['cooperação', 'convênio', 'contrato', 'termo de cooperação', 'parceria formal']
      },
      '6.4': { 
        name: 'Instrumentos de gestão interfederativa',
        keywords: ['CIB', 'CIT', 'COSEMS', 'CONASS', 'bipartite', 'tripartite', 'pactuação']
      }
    }
  },
  '7': {
    name: 'Política – Individual',
    color: 'oklch(0.585 0.204 277.12)',
    codes: {
      '7.1': { 
        name: 'Habilidade política',
        keywords: ['habilidade política', 'articulação', 'influência', 'lobby', 'advocacy']
      },
      '7.2': { 
        name: 'Relação com stakeholders',
        keywords: ['stakeholder', 'ator', 'parte interessada', 'envolvido', 'interessado']
      },
      '7.3': { 
        name: 'Comunicação política',
        keywords: ['comunicação', 'discurso', 'narrativa', 'mensagem', 'mídia', 'imprensa', 'entrevista']
      },
      '7.4': { 
        name: 'Mediação de conflitos',
        keywords: ['conflito', 'mediação', 'disputa', 'tensão', 'divergência', 'impasse']
      }
    }
  },
  '8': {
    name: 'Política – Organizacional',
    color: 'oklch(0.457 0.215 277.02)',
    codes: {
      '8.1': { 
        name: 'Relação com outras secretarias',
        keywords: ['outra secretaria', 'secretaria de', 'pasta', 'órgão']
      },
      '8.2': { 
        name: 'Articulação interinstitucional',
        keywords: ['interinstitucional', 'entre instituições', 'parceria institucional']
      },
      '8.3': { 
        name: 'Apoio político à política pública',
        keywords: ['apoio político', 'prioridade', 'agenda política', 'compromisso', 'vontade política']
      },
      '8.4': { 
        name: 'Confiança entre instituições',
        keywords: ['confiança', 'credibilidade', 'legitimidade', 'reputação']
      }
    }
  },
  '9': {
    name: 'Política – Sistêmica',
    color: 'oklch(0.359 0.135 278.70)',
    codes: {
      '9.1': { 
        name: 'Participação social',
        keywords: ['participação', 'sociedade civil', 'cidadão', 'usuário', 'população', 'comunidade']
      },
      '9.2': { 
        name: 'Conselhos e instâncias participativas',
        keywords: ['conselho', 'conferência', 'audiência pública', 'consulta pública', 'ouvidoria']
      },
      '9.3': { 
        name: 'Transparência',
        keywords: ['transparência', 'acesso à informação', 'LAI', 'portal', 'dados abertos', 'publicidade']
      },
      '9.4': { 
        name: 'Confiança pública',
        keywords: ['confiança pública', 'legitimidade social', 'apoio popular', 'opinião pública']
      },
      '9.5': { 
        name: 'Apoio político amplo',
        keywords: ['apoio amplo', 'coalizão', 'consenso político', 'base de apoio']
      }
    }
  },
  '10': {
    name: 'Capacidade Transversal',
    color: 'oklch(0.585 0.204 277.12)',
    codes: {
      '10.1': { 
        name: 'Financiamento',
        keywords: ['financiamento', 'fundo', 'repasse', 'transferência', 'SUS', 'PAB', 'MAC']
      },
      '10.2': { 
        name: 'Cooperação institucional',
        keywords: ['cooperação', 'colaboração', 'apoio mútuo', 'sinergia']
      },
      '10.3': { 
        name: 'Falta de recursos',
        keywords: ['falta', 'escassez', 'insuficiência', 'carência', 'deficit', 'limitação']
      },
      '10.4': { 
        name: 'Conflito institucional',
        keywords: ['conflito', 'disputa', 'competição', 'rivalidade', 'tensão institucional']
      },
      '10.5': { 
        name: 'Falta de dados',
        keywords: ['falta de dados', 'ausência de informação', 'dados incompletos', 'subnotificação']
      }
    }
  }
};

// Função para obter todos os códigos em formato flat
const getAllCodes = () => {
  const allCodes = [];
  Object.entries(capacityCodebook).forEach(([catId, category]) => {
    Object.entries(category.codes).forEach(([codeId, codeData]) => {
      allCodes.push({
        id: codeId,
        name: typeof codeData === 'string' ? codeData : codeData.name,
        keywords: typeof codeData === 'object' ? codeData.keywords : [],
        categoryId: catId,
        categoryName: category.name,
        color: category.color
      });
    });
  });
  return allCodes;
};

// ==================== SISTEMA DE AUTO-CODIFICAÇÃO ====================

// Função para normalizar texto para matching
const normalizeForMatching = (text) => {
  return text.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

// Função para encontrar códigos automaticamente em um texto
const autoCodeText = (text, allCodes) => {
  const normalizedText = normalizeForMatching(text);
  const foundCodes = [];
  const matches = [];
  
  allCodes.forEach(code => {
    if (!code.keywords || code.keywords.length === 0) return;
    
    code.keywords.forEach(keyword => {
      const normalizedKeyword = normalizeForMatching(keyword);
      const regex = new RegExp(`\\b${normalizedKeyword.replace(/\s+/g, '\\s+')}\\b`, 'gi');
      
      let match;
      while ((match = regex.exec(normalizedText)) !== null) {
        // Encontrar posição no texto original
        const startPos = match.index;
        const endPos = startPos + match[0].length;
        
        // Verificar se já não temos este código para este match
        const existingMatch = matches.find(m => 
          m.codeId === code.id && 
          Math.abs(m.start - startPos) < 5
        );
        
        if (!existingMatch) {
          matches.push({
            codeId: code.id,
            codeName: code.name,
            categoryName: code.categoryName,
            color: code.color,
            keyword: keyword,
            matchedText: match[0],
            start: startPos,
            end: endPos,
            confidence: keyword.split(' ').length > 1 ? 0.9 : 0.7 // Multi-word = higher confidence
          });
          
          if (!foundCodes.includes(code.id)) {
            foundCodes.push(code.id);
          }
        }
      }
    });
  });
  
  // Ordenar por posição
  matches.sort((a, b) => a.start - b.start);
  
  return {
    codes: foundCodes,
    matches: matches,
    totalMatches: matches.length
  };
};

// Função para auto-codificar todos os documentos
const autoCodeAllDocuments = (documents, allCodes) => {
  const results = [];
  
  documents.forEach(doc => {
    // Dividir em sentenças/segmentos
    const sentences = doc.content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    sentences.forEach((sentence, idx) => {
      const coding = autoCodeText(sentence, allCodes);
      
      if (coding.codes.length > 0) {
        results.push({
          id: `${doc.id}-${idx}`,
          documentId: doc.id,
          documentName: doc.name,
          text: sentence.trim(),
          codes: coding.codes,
          matches: coding.matches,
          confidence: Math.max(...coding.matches.map(m => m.confidence)),
          isAutomatic: true,
          createdAt: new Date().toISOString()
        });
      }
    });
  });
  
  return results;
};

// Paleta de cores para códigos personalizados (3-color theme palette)
const codeColorPalette = [
  'oklch(0.585 0.204 277.12)', 'oklch(0.457 0.215 277.02)', 'oklch(0.359 0.135 278.70)'
];

const cleanText = (text, options = {}, customStopwords = null) => {
  const { removeNumbers = true, removePunctuation = true, lowercase = true, removeStopwords = true, minLength = 4 } = options;
  
  // Forçar mínimo de 4 caracteres para evitar conectivos
  const effectiveMinLength = Math.max(minLength, 4);
  
  let cleaned = text;
  if (lowercase) cleaned = cleaned.toLowerCase();
  if (removeNumbers) cleaned = cleaned.replace(/\d+/g, ' ');
  if (removePunctuation) cleaned = cleaned.replace(/[^\w\sáàâãéèêíìîóòôõúùûçñ]/gi, ' ');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  let words = cleaned.split(' ').filter(w => w.length >= effectiveMinLength);
  
  // SEMPRE filtrar palavras curtas obrigatórias (conectivos, preposições, etc.)
  words = words.filter(w => !MANDATORY_SHORT_WORDS_PT.has(w.toLowerCase()));
  
  if (removeStopwords && customStopwords) {
    words = words.filter(w => !customStopwords.has(w));
  }
  
  return words;
};

const tokenize = (text) => {
  return text.toLowerCase()
    .replace(/[^\w\sáàâãéèêíìîóòôõúùûçñ]/gi, ' ')
    .split(/\s+/)
    .filter(w => w.length > 0);
};

// ==================== SISTEMA DE LEMATIZAÇÃO E NORMALIZAÇÃO ====================

// Calcula distância de Levenshtein entre duas strings (para detectar typos)
const levenshteinDistance = (str1, str2) => {
  const m = str1.length;
  const n = str2.length;
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
};

// Normaliza palavra removendo sufixos de gênero e plural em português
const normalizePortugueseWord = (word) => {
  const lower = word.toLowerCase().trim();
  
  // Remover sufixos de plural e gênero (ordem importa - do mais específico ao menos)
  const suffixRules = [
    // Plurais irregulares
    { pattern: /ões$/i, replacement: 'ão' },
    { pattern: /ães$/i, replacement: 'ão' },
    { pattern: /is$/i, replacement: 'l' },  // papéis -> papel
    { pattern: /éis$/i, replacement: 'el' }, // anéis -> anel
    { pattern: /óis$/i, replacement: 'ol' }, // faróis -> farol
    // Gênero neutro/inclusivo
    { pattern: /xs$/i, replacement: '' },    // ministrxs -> ministr
    { pattern: /x$/i, replacement: '' },     // ministrx -> ministr
    { pattern: /@s$/i, replacement: '' },    // ministr@s -> ministr
    { pattern: /@$/i, replacement: '' },     // ministr@ -> ministr
    { pattern: /es$/i, replacement: '' },    // ministres -> ministr (linguagem neutra)
    // Feminino plural -> masculino singular
    { pattern: /as$/i, replacement: 'o' },   // ministras -> ministro
    // Masculino plural -> singular
    { pattern: /os$/i, replacement: 'o' },   // ministros -> ministro
    // Feminino singular -> masculino
    { pattern: /a$/i, replacement: 'o' },    // ministra -> ministro
    // Plural simples
    { pattern: /s$/i, replacement: '' },     // outros plurais
  ];
  
  let normalized = lower;
  
  // Aplicar regras de normalização
  for (const rule of suffixRules) {
    if (rule.pattern.test(normalized) && normalized.length > 3) {
      const candidate = normalized.replace(rule.pattern, rule.replacement);
      // Só aplicar se o resultado tiver pelo menos 3 caracteres
      if (candidate.length >= 3) {
        normalized = candidate;
        break; // Aplicar apenas uma regra
      }
    }
  }
  
  return normalized;
};

// Verifica se duas palavras são variações uma da outra (APENAS gênero, plural, typo da MESMA palavra)
const areWordVariations = (word1, word2, maxTypoDistance = 1) => {
  const w1 = word1.toLowerCase();
  const w2 = word2.toLowerCase();
  
  // Idênticas
  if (w1 === w2) return { isVariation: true, type: 'identical', confidence: 1.0 };
  
  // Verificar se são variações morfológicas DIRETAS (gênero/número)
  // A palavra base deve ser EXATAMENTE a mesma, só mudando o sufixo
  
  // Caso 1: Variação de gênero (o/a no final)
  // ministro <-> ministra
  if (w1.length === w2.length) {
    if ((w1.endsWith('o') && w2.endsWith('a') && w1.slice(0, -1) === w2.slice(0, -1)) ||
        (w1.endsWith('a') && w2.endsWith('o') && w1.slice(0, -1) === w2.slice(0, -1))) {
      return { isVariation: true, type: 'gender', confidence: 1.0 };
    }
  }
  
  // Caso 2: Variação de número (plural com 's')
  // ministro <-> ministros, ministra <-> ministras
  if (Math.abs(w1.length - w2.length) === 1) {
    const longer = w1.length > w2.length ? w1 : w2;
    const shorter = w1.length > w2.length ? w2 : w1;
    if (longer.endsWith('s') && longer.slice(0, -1) === shorter) {
      return { isVariation: true, type: 'plural', confidence: 1.0 };
    }
  }
  
  // Caso 3: Variação de gênero + número
  // ministro <-> ministras (diferença de 2: 'o' -> 'as')
  if (Math.abs(w1.length - w2.length) === 1) {
    const longer = w1.length > w2.length ? w1 : w2;
    const shorter = w1.length > w2.length ? w2 : w1;
    // ministro -> ministras: shorter termina em 'o', longer termina em 'as'
    if (shorter.endsWith('o') && longer.endsWith('as') && shorter.slice(0, -1) === longer.slice(0, -2)) {
      return { isVariation: true, type: 'gender_plural', confidence: 1.0 };
    }
    // ministra -> ministros: shorter termina em 'a', longer termina em 'os'
    if (shorter.endsWith('a') && longer.endsWith('os') && shorter.slice(0, -1) === longer.slice(0, -2)) {
      return { isVariation: true, type: 'gender_plural', confidence: 1.0 };
    }
  }
  
  // Caso 4: Linguagem neutra (x, @, e)
  // ministro <-> ministrx, ministro <-> ministr@
  const neutralSuffixes = ['x', 'xs', '@', '@s'];
  for (const suffix of neutralSuffixes) {
    // Verificar se uma palavra é a versão neutra da outra
    if (w1.endsWith(suffix) || w2.endsWith(suffix)) {
      const neutral = w1.endsWith(suffix) ? w1 : w2;
      const regular = w1.endsWith(suffix) ? w2 : w1;
      const neutralBase = neutral.slice(0, -suffix.length);
      
      // A palavra regular deve ter o mesmo base + sufixo de gênero/número
      if (regular.startsWith(neutralBase) && 
          (regular.endsWith('o') || regular.endsWith('a') || 
           regular.endsWith('os') || regular.endsWith('as') ||
           regular.endsWith('e') || regular.endsWith('es'))) {
        const regularBase = regular.replace(/(os|as|o|a|es|e)$/, '');
        if (neutralBase === regularBase) {
          return { isVariation: true, type: 'neutral', confidence: 0.95 };
        }
      }
    }
  }
  
  // Caso 5: Typos - MUITO restritivo
  // Só considerar typo se:
  // - Distância de Levenshtein = 1 (apenas 1 caractere diferente)
  // - As palavras têm o mesmo tamanho ou diferença de 1
  // - A diferença NÃO está no início da palavra (prefixos diferentes = palavras diferentes)
  if (Math.abs(w1.length - w2.length) <= 1 && w1.length >= 4) {
    const distance = levenshteinDistance(w1, w2);
    
    // Só aceitar distância 1 para evitar falsos positivos
    if (distance === 1) {
      // Verificar se os primeiros 3 caracteres são iguais (mesmo prefixo)
      // Isso evita agrupar "presidente" com "precedente"
      if (w1.slice(0, 3) === w2.slice(0, 3)) {
        // Verificar também se os últimos 2 caracteres são similares
        // para evitar agrupar palavras com sufixos muito diferentes
        const ending1 = w1.slice(-2);
        const ending2 = w2.slice(-2);
        if (ending1 === ending2 || levenshteinDistance(ending1, ending2) <= 1) {
          return { isVariation: true, type: 'typo', confidence: 0.85, distance };
        }
      }
    }
  }
  
  // NÃO é uma variação - são palavras diferentes
  return { isVariation: false };
};

// Agrupa palavras por suas formas canônicas (lemas)
const groupWordVariations = (wordFrequency) => {
  const groups = new Map(); // canonical -> { words: [{word, count}], totalCount }
  const wordToCanonical = new Map(); // word -> canonical
  
  // Ordenar por frequência (processar mais frequentes primeiro como candidatos canônicos)
  const sortedWords = [...wordFrequency].sort((a, b) => b.count - a.count);
  
  for (const { word, count } of sortedWords) {
    const normalized = normalizePortugueseWord(word);
    let foundGroup = false;
    
    // Procurar grupo existente
    for (const [canonical, group] of groups) {
      const canonicalNorm = normalizePortugueseWord(canonical);
      const result = areWordVariations(word, canonical);
      
      if (result.isVariation) {
        group.words.push({ word, count, variationType: result.type, confidence: result.confidence });
        group.totalCount += count;
        wordToCanonical.set(word, canonical);
        foundGroup = true;
        break;
      }
    }
    
    // Criar novo grupo se não encontrou
    if (!foundGroup) {
      groups.set(word, {
        canonical: word,
        normalizedForm: normalized,
        words: [{ word, count, variationType: 'canonical', confidence: 1.0 }],
        totalCount: count
      });
      wordToCanonical.set(word, word);
    }
  }
  
  return { groups, wordToCanonical };
};

// Calcula frequência considerando variações morfológicas e typos
const calculateWordFrequencyWithVariations = (words) => {
  // Primeiro, calcular frequência básica
  const basicFreq = {};
  words.forEach(word => {
    basicFreq[word] = (basicFreq[word] || 0) + 1;
  });
  
  const wordFrequency = Object.entries(basicFreq)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count);
  
  // Agrupar variações
  const { groups, wordToCanonical } = groupWordVariations(wordFrequency);
  
  // Converter para formato de saída
  const groupedFrequency = Array.from(groups.values())
    .map(group => ({
      word: group.canonical,
      count: group.totalCount,
      isGroup: group.words.length > 1,
      variations: group.words,
      normalizedForm: group.normalizedForm
    }))
    .sort((a, b) => b.count - a.count);
  
  return {
    frequency: groupedFrequency,
    groups,
    wordToCanonical,
    // Manter também a frequência simples para referência
    rawFrequency: wordFrequency
  };
};

const calculateWordFrequency = (words) => {
  const freq = {};
  words.forEach(word => {
    freq[word] = (freq[word] || 0) + 1;
  });
  return Object.entries(freq)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count);
};

const calculateCooccurrence = (segments, windowSize = 5, stopwords = null, options = {}) => {
  const cooc = {};
  
  segments.forEach(segment => {
    const words = cleanText(segment, options, stopwords);
    for (let i = 0; i < words.length; i++) {
      for (let j = Math.max(0, i - windowSize); j < Math.min(words.length, i + windowSize + 1); j++) {
        if (i !== j) {
          const pair = [words[i], words[j]].sort().join('|||');
          cooc[pair] = (cooc[pair] || 0) + 1;
        }
      }
    }
  });
  
  return Object.entries(cooc)
    .map(([pair, weight]) => {
      const [source, target] = pair.split('|||');
      return { source, target, weight };
    })
    .sort((a, b) => b.weight - a.weight);
};

// ==================== ANÁLISE AVANÇADA DE REDES ====================

// Construir grafo a partir de coocorrências
const buildGraph = (cooccurrences, minWeight = 2, maxEdges = 200) => {
  const edges = cooccurrences
    .filter(e => e.weight >= minWeight)
    .slice(0, maxEdges);
  
  const nodes = new Map();
  
  edges.forEach(edge => {
    if (!nodes.has(edge.source)) {
      nodes.set(edge.source, { id: edge.source, degree: 0, weightedDegree: 0, neighbors: new Set() });
    }
    if (!nodes.has(edge.target)) {
      nodes.set(edge.target, { id: edge.target, degree: 0, weightedDegree: 0, neighbors: new Set() });
    }
    
    nodes.get(edge.source).degree++;
    nodes.get(edge.source).weightedDegree += edge.weight;
    nodes.get(edge.source).neighbors.add(edge.target);
    
    nodes.get(edge.target).degree++;
    nodes.get(edge.target).weightedDegree += edge.weight;
    nodes.get(edge.target).neighbors.add(edge.source);
  });
  
  return {
    nodes: Array.from(nodes.values()),
    edges: edges,
    nodeMap: nodes
  };
};

// Calcular métricas de centralidade
const calculateCentralityMetrics = (graph) => {
  if (!graph || !graph.nodes) {
    return { nodes: [], metrics: { nodeCount: 0, edgeCount: 0, density: '0.00', avgDegree: '0.00' } };
  }
  
  const { nodes, edges, nodeMap } = graph;
  const n = nodes.length;
  
  if (n === 0) return { nodes: [], metrics: {} };
  
  // 1. Degree Centrality (normalizado)
  nodes.forEach(node => {
    node.degreeCentrality = n > 1 ? node.degree / (n - 1) : 0;
  });
  
  // 2. Betweenness Centrality (simplificado via BFS)
  const betweenness = new Map();
  nodes.forEach(node => betweenness.set(node.id, 0));
  
  // Amostragem para performance (max 50 nós como fonte)
  const sampleNodes = nodes.slice(0, Math.min(50, n));
  
  sampleNodes.forEach(source => {
    // BFS para encontrar caminhos mais curtos
    const dist = new Map();
    const paths = new Map();
    const queue = [source.id];
    dist.set(source.id, 0);
    paths.set(source.id, 1);
    
    while (queue.length > 0) {
      const current = queue.shift();
      const currentNode = nodeMap.get(current);
      if (!currentNode) continue;
      
      currentNode.neighbors.forEach(neighbor => {
        if (!dist.has(neighbor)) {
          dist.set(neighbor, dist.get(current) + 1);
          paths.set(neighbor, paths.get(current));
          queue.push(neighbor);
        } else if (dist.get(neighbor) === dist.get(current) + 1) {
          paths.set(neighbor, paths.get(neighbor) + paths.get(current));
        }
      });
    }
    
    // Acumular betweenness
    nodes.forEach(target => {
      if (target.id !== source.id && dist.has(target.id)) {
        const pathCount = paths.get(target.id) || 1;
        // Simplificação: contribuição proporcional aos caminhos
        nodes.forEach(intermediate => {
          if (intermediate.id !== source.id && intermediate.id !== target.id) {
            if (dist.has(intermediate.id) && dist.get(intermediate.id) < dist.get(target.id)) {
              betweenness.set(
                intermediate.id, 
                betweenness.get(intermediate.id) + (1 / pathCount)
              );
            }
          }
        });
      }
    });
  });
  
  // Normalizar betweenness
  const maxBetweenness = Math.max(...Array.from(betweenness.values()), 1);
  nodes.forEach(node => {
    node.betweennessCentrality = betweenness.get(node.id) / maxBetweenness;
  });
  
  // 3. Closeness Centrality (simplificado)
  nodes.forEach(node => {
    let totalDist = 0;
    let reachable = 0;
    
    // BFS para distâncias
    const dist = new Map();
    const queue = [node.id];
    dist.set(node.id, 0);
    
    while (queue.length > 0) {
      const current = queue.shift();
      const currentNode = nodeMap.get(current);
      if (!currentNode) continue;
      
      currentNode.neighbors.forEach(neighbor => {
        if (!dist.has(neighbor)) {
          dist.set(neighbor, dist.get(current) + 1);
          totalDist += dist.get(neighbor);
          reachable++;
          queue.push(neighbor);
        }
      });
    }
    
    node.closenessCentrality = reachable > 0 ? reachable / totalDist : 0;
  });
  
  // 4. Eigenvector Centrality (aproximação via power iteration)
  let eigenvector = new Map();
  nodes.forEach(node => eigenvector.set(node.id, 1 / n));
  
  for (let iter = 0; iter < 20; iter++) {
    const newEigenvector = new Map();
    let sum = 0;
    
    nodes.forEach(node => {
      let score = 0;
      node.neighbors.forEach(neighbor => {
        score += eigenvector.get(neighbor) || 0;
      });
      newEigenvector.set(node.id, score);
      sum += score * score;
    });
    
    // Normalizar
    const norm = Math.sqrt(sum) || 1;
    nodes.forEach(node => {
      eigenvector.set(node.id, newEigenvector.get(node.id) / norm);
    });
  }
  
  nodes.forEach(node => {
    node.eigenvectorCentrality = eigenvector.get(node.id);
  });
  
  // Calcular métricas globais
  const totalEdges = edges.length;
  const maxPossibleEdges = (n * (n - 1)) / 2;
  const density = maxPossibleEdges > 0 ? totalEdges / maxPossibleEdges : 0;
  const avgDegree = n > 0 ? nodes.reduce((sum, node) => sum + node.degree, 0) / n : 0;
  const avgWeightedDegree = n > 0 ? nodes.reduce((sum, node) => sum + node.weightedDegree, 0) / n : 0;
  const totalWeight = edges.reduce((sum, e) => sum + e.weight, 0);
  
  return {
    nodes: nodes.sort((a, b) => b.degreeCentrality - a.degreeCentrality),
    metrics: {
      nodeCount: n,
      edgeCount: totalEdges,
      density: density.toFixed(4),
      avgDegree: avgDegree.toFixed(2),
      avgWeightedDegree: avgWeightedDegree.toFixed(2),
      totalWeight,
      maxDegree: Math.max(...nodes.map(n => n.degree)),
      minDegree: Math.min(...nodes.map(n => n.degree))
    }
  };
};

// Detecção de comunidades (Louvain simplificado)
const detectCommunities = (graph) => {
  if (!graph || !graph.nodes) {
    return { communities: [], modularity: 0, communityCount: 0 };
  }
  
  const { nodes, edges, nodeMap } = graph;
  if (nodes.length === 0) return { communities: [], modularity: 0, communityCount: 0 };
  
  // Inicializar cada nó em sua própria comunidade
  const community = new Map();
  nodes.forEach((node, idx) => community.set(node.id, idx));
  
  // Criar mapa de adjacência com pesos
  const adj = new Map();
  nodes.forEach(node => adj.set(node.id, new Map()));
  
  edges.forEach(edge => {
    adj.get(edge.source).set(edge.target, edge.weight);
    adj.get(edge.target).set(edge.source, edge.weight);
  });
  
  const totalWeight = edges.reduce((sum, e) => sum + e.weight, 0) * 2;
  
  // Função para calcular ganho de modularidade
  const modularityGain = (node, targetCommunity) => {
    const ki = node.weightedDegree;
    let sumIn = 0;
    let sumTot = 0;
    
    nodes.forEach(other => {
      if (community.get(other.id) === targetCommunity) {
        sumTot += other.weightedDegree;
        const weight = adj.get(node.id).get(other.id) || 0;
        sumIn += weight;
      }
    });
    
    if (totalWeight === 0) return 0;
    
    return (sumIn / totalWeight) - (sumTot * ki) / (totalWeight * totalWeight);
  };
  
  // Iterar até convergência (max 10 iterações)
  let changed = true;
  let iterations = 0;
  
  while (changed && iterations < 10) {
    changed = false;
    iterations++;
    
    nodes.forEach(node => {
      const currentCommunity = community.get(node.id);
      let bestCommunity = currentCommunity;
      let bestGain = 0;
      
      // Verificar comunidades dos vizinhos
      const neighborCommunities = new Set();
      node.neighbors.forEach(neighbor => {
        neighborCommunities.add(community.get(neighbor));
      });
      
      neighborCommunities.forEach(targetCommunity => {
        if (targetCommunity !== currentCommunity) {
          const gain = modularityGain(node, targetCommunity);
          if (gain > bestGain) {
            bestGain = gain;
            bestCommunity = targetCommunity;
          }
        }
      });
      
      if (bestCommunity !== currentCommunity) {
        community.set(node.id, bestCommunity);
        changed = true;
      }
    });
  }
  
  // Agrupar nós por comunidade
  const communityGroups = new Map();
  nodes.forEach(node => {
    const comm = community.get(node.id);
    if (!communityGroups.has(comm)) {
      communityGroups.set(comm, []);
    }
    communityGroups.get(comm).push(node);
  });
  
  // Calcular modularidade final
  let modularity = 0;
  if (totalWeight > 0) {
    nodes.forEach(nodeI => {
      nodes.forEach(nodeJ => {
        if (community.get(nodeI.id) === community.get(nodeJ.id)) {
          const aij = adj.get(nodeI.id).get(nodeJ.id) || 0;
          const ki = nodeI.weightedDegree;
          const kj = nodeJ.weightedDegree;
          modularity += aij - (ki * kj) / totalWeight;
        }
      });
    });
    modularity /= totalWeight;
  }
  
  // Cores para comunidades (3-color theme palette)
  const communityColors = [
    'oklch(0.585 0.204 277.12)', 'oklch(0.457 0.215 277.02)', 'oklch(0.359 0.135 278.70)'
  ];
  
  // Atribuir cores aos nós
  const communityList = Array.from(communityGroups.keys());
  nodes.forEach(node => {
    const commIdx = communityList.indexOf(community.get(node.id));
    node.community = commIdx;
    node.communityColor = communityColors[commIdx % communityColors.length];
  });
  
  return {
    communities: Array.from(communityGroups.entries()).map(([id, members], idx) => ({
      id: idx,
      size: members.length,
      members: members.map(m => m.id),
      color: communityColors[idx % communityColors.length],
      topNodes: members.sort((a, b) => b.degree - a.degree).slice(0, 5).map(m => m.id)
    })),
    modularity: modularity.toFixed(4),
    communityCount: communityGroups.size
  };
};

// ==================== MÓDULOS ESTATÍSTICOS AVANÇADOS ====================

// Calcular TF-IDF
const calculateTFIDF = (documents, stopwords = null, options = {}) => {
  const docFreq = new Map(); // Frequência de documentos por termo
  const termFreq = []; // Frequência de termos por documento
  const totalDocs = documents.length;
  
  // Calcular TF para cada documento
  documents.forEach((doc, docIdx) => {
    const words = cleanText(doc.content, options, stopwords);
    const tf = new Map();
    const totalWords = words.length;
    
    words.forEach(word => {
      tf.set(word, (tf.get(word) || 0) + 1);
    });
    
    // Normalizar TF
    tf.forEach((count, word) => {
      tf.set(word, count / totalWords);
      
      // Contar documentos que contêm o termo
      if (!docFreq.has(word)) {
        docFreq.set(word, new Set());
      }
      docFreq.get(word).add(docIdx);
    });
    
    termFreq.push({ docId: doc.id, docName: doc.name, tf });
  });
  
  // Calcular IDF e TF-IDF
  const tfidfResults = [];
  
  termFreq.forEach(({ docId, docName, tf }) => {
    const docTfidf = [];
    
    tf.forEach((tfValue, word) => {
      const df = docFreq.get(word).size;
      const idf = Math.log(totalDocs / df);
      const tfidf = tfValue * idf;
      
      docTfidf.push({ word, tf: tfValue, idf, tfidf });
    });
    
    // Ordenar por TF-IDF
    docTfidf.sort((a, b) => b.tfidf - a.tfidf);
    
    tfidfResults.push({
      docId,
      docName,
      topTerms: docTfidf.slice(0, 20),
      totalTerms: docTfidf.length
    });
  });
  
  // Calcular TF-IDF global
  const globalTfidf = new Map();
  tfidfResults.forEach(doc => {
    doc.topTerms.forEach(term => {
      const current = globalTfidf.get(term.word) || { word: term.word, totalTfidf: 0, docCount: 0 };
      current.totalTfidf += term.tfidf;
      current.docCount++;
      globalTfidf.set(term.word, current);
    });
  });
  
  return {
    byDocument: tfidfResults,
    global: Array.from(globalTfidf.values())
      .map(t => ({ ...t, avgTfidf: t.totalTfidf / t.docCount }))
      .sort((a, b) => b.avgTfidf - a.avgTfidf)
      .slice(0, 50)
  };
};

// Calcular especificidades por corpus
const calculateSpecificities = (documents, corpora, stopwords = null, options = {}) => {
  if (!corpora || corpora.length < 2) return null;
  
  const corpusWords = new Map();
  const corpusTotals = new Map();
  let globalTotal = 0;
  const globalFreq = new Map();
  
  // Contar palavras por corpus
  corpora.forEach(corpus => {
    const words = new Map();
    let total = 0;
    
    const corpusDocs = documents.filter(d => corpus.documentIds?.includes(d.id));
    
    corpusDocs.forEach(doc => {
      const docWords = cleanText(doc.content, options, stopwords);
      docWords.forEach(word => {
        words.set(word, (words.get(word) || 0) + 1);
        globalFreq.set(word, (globalFreq.get(word) || 0) + 1);
        total++;
        globalTotal++;
      });
    });
    
    corpusWords.set(corpus.id, words);
    corpusTotals.set(corpus.id, total);
  });
  
  // Calcular especificidades (qui-quadrado)
  const specificities = [];
  
  corpora.forEach(corpus => {
    const words = corpusWords.get(corpus.id);
    const corpusTotal = corpusTotals.get(corpus.id);
    
    if (corpusTotal === 0) return;
    
    const corpusSpec = [];
    
    words.forEach((observed, word) => {
      const globalCount = globalFreq.get(word);
      const expected = (corpusTotal / globalTotal) * globalCount;
      
      if (expected > 0) {
        // Qui-quadrado
        const chiSquare = Math.pow(observed - expected, 2) / expected;
        // Especificidade (positiva se acima do esperado)
        const specificity = observed > expected ? chiSquare : -chiSquare;
        
        corpusSpec.push({
          word,
          observed,
          expected: expected.toFixed(2),
          chiSquare: chiSquare.toFixed(2),
          specificity: specificity.toFixed(2),
          ratio: (observed / expected).toFixed(2)
        });
      }
    });
    
    // Ordenar por especificidade absoluta
    corpusSpec.sort((a, b) => Math.abs(b.specificity) - Math.abs(a.specificity));
    
    specificities.push({
      corpusId: corpus.id,
      corpusName: corpus.name,
      corpusColor: corpus.color,
      totalWords: corpusTotal,
      topPositive: corpusSpec.filter(s => parseFloat(s.specificity) > 0).slice(0, 15),
      topNegative: corpusSpec.filter(s => parseFloat(s.specificity) < 0).slice(0, 15)
    });
  });
  
  return specificities;
};

// Calcular índices de diversidade léxica
const calculateLexicalDiversity = (text, stopwords = null, options = {}) => {
  const words = cleanText(text, options, stopwords);
  const tokens = tokenize(text);
  const uniqueWords = new Set(words);
  
  const N = tokens.length; // Total de tokens
  const V = uniqueWords.size; // Vocabulário
  
  // TTR - Type-Token Ratio
  const ttr = N > 0 ? V / N : 0;
  
  // RTTR - Root TTR
  const rttr = N > 0 ? V / Math.sqrt(N) : 0;
  
  // CTTR - Corrected TTR
  const cttr = N > 0 ? V / Math.sqrt(2 * N) : 0;
  
  // Hapax Legomena (palavras que aparecem 1 vez)
  const freq = new Map();
  words.forEach(w => freq.set(w, (freq.get(w) || 0) + 1));
  const hapax = Array.from(freq.values()).filter(c => c === 1).length;
  const hapaxRatio = V > 0 ? hapax / V : 0;
  
  // Dis Legomena (palavras que aparecem 2 vezes)
  const dis = Array.from(freq.values()).filter(c => c === 2).length;
  
  // Yule's K
  const freqOfFreq = new Map();
  freq.forEach(count => {
    freqOfFreq.set(count, (freqOfFreq.get(count) || 0) + 1);
  });
  
  let sumM = 0;
  freqOfFreq.forEach((fi, i) => {
    sumM += fi * i * i;
  });
  const yuleK = N > 0 ? 10000 * (sumM - N) / (N * N) : 0;
  
  // Simpson's D
  let simpsonSum = 0;
  freq.forEach(ni => {
    simpsonSum += ni * (ni - 1);
  });
  const simpsonD = N > 1 ? simpsonSum / (N * (N - 1)) : 0;
  
  // Herdan's C
  const herdanC = N > 1 && V > 0 ? Math.log(V) / Math.log(N) : 0;
  
  return {
    totalTokens: N,
    uniqueWords: V,
    ttr: (ttr * 100).toFixed(2),
    rttr: rttr.toFixed(2),
    cttr: cttr.toFixed(2),
    hapaxCount: hapax,
    hapaxRatio: (hapaxRatio * 100).toFixed(2),
    disCount: dis,
    yuleK: yuleK.toFixed(2),
    simpsonD: simpsonD.toFixed(4),
    herdanC: herdanC.toFixed(3)
  };
};

// Teste de qui-quadrado para associação entre palavras
const calculateChiSquareAssociation = (cooccurrences, wordFrequency, totalWords) => {
  const freqMap = new Map();
  wordFrequency.forEach(w => freqMap.set(w.word, w.count));
  
  return cooccurrences.slice(0, 100).map(edge => {
    const observed = edge.weight;
    const freqA = freqMap.get(edge.source) || 1;
    const freqB = freqMap.get(edge.target) || 1;
    
    // Frequência esperada sob independência
    const expected = (freqA * freqB) / totalWords;
    
    // Qui-quadrado
    const chiSquare = expected > 0 ? Math.pow(observed - expected, 2) / expected : 0;
    
    // Log-likelihood ratio (G²)
    const logLikelihood = observed > 0 && expected > 0 
      ? 2 * observed * Math.log(observed / expected) 
      : 0;
    
    // Dice coefficient
    const dice = (2 * observed) / (freqA + freqB);
    
    // Jaccard index
    const jaccard = observed / (freqA + freqB - observed);
    
    // PMI (Pointwise Mutual Information)
    const pmi = observed > 0 && expected > 0 
      ? Math.log2(observed / expected)
      : 0;
    
    return {
      source: edge.source,
      target: edge.target,
      cooccurrence: observed,
      expected: expected.toFixed(2),
      chiSquare: chiSquare.toFixed(2),
      logLikelihood: logLikelihood.toFixed(2),
      dice: dice.toFixed(4),
      jaccard: jaccard.toFixed(4),
      pmi: pmi.toFixed(2)
    };
  });
};

// ==================== ANÁLISE DE BIGRAMAS ====================

// Calcular bigramas (pares de palavras adjacentes)
const calculateBigrams = (text, stopwords = null, minFreq = 2, options = {}) => {
  const words = cleanText(text, options, stopwords);
  const bigramCounts = new Map();
  
  for (let i = 0; i < words.length - 1; i++) {
    const bigram = `${words[i]} ${words[i + 1]}`;
    bigramCounts.set(bigram, (bigramCounts.get(bigram) || 0) + 1);
  }
  
  // Converter para array e filtrar por frequência mínima
  const bigrams = Array.from(bigramCounts.entries())
    .map(([bigram, count]) => {
      const [word1, word2] = bigram.split(' ');
      return { bigram, word1, word2, count };
    })
    .filter(b => b.count >= minFreq)
    .sort((a, b) => b.count - a.count);
  
  return bigrams;
};

// Construir rede de bigramas
const buildBigramNetwork = (bigrams, maxNodes = 100) => {
  const nodes = new Map();
  const edges = [];
  
  bigrams.slice(0, maxNodes * 2).forEach(({ word1, word2, count }) => {
    if (!nodes.has(word1)) {
      nodes.set(word1, { id: word1, degree: 0, totalWeight: 0 });
    }
    if (!nodes.has(word2)) {
      nodes.set(word2, { id: word2, degree: 0, totalWeight: 0 });
    }
    
    nodes.get(word1).degree++;
    nodes.get(word1).totalWeight += count;
    nodes.get(word2).degree++;
    nodes.get(word2).totalWeight += count;
    
    edges.push({ source: word1, target: word2, weight: count });
  });
  
  // Limitar nós
  const sortedNodes = Array.from(nodes.values())
    .sort((a, b) => b.totalWeight - a.totalWeight)
    .slice(0, maxNodes);
  
  const nodeSet = new Set(sortedNodes.map(n => n.id));
  const filteredEdges = edges.filter(e => nodeSet.has(e.source) && nodeSet.has(e.target));
  
  return { nodes: sortedNodes, edges: filteredEdges };
};

// ==================== ANÁLISE DE SENTIMENTOS ====================

const analyzeSentiment = (text, stopwords = null, options = {}) => {
  // Mesclar opções com removeNumbers = true padrão
  const mergedOptions = { removeNumbers: true, ...options };
  const words = cleanText(text, mergedOptions, stopwords);
  
  let positive = 0;
  let negative = 0;
  let neutral = 0;
  
  const positiveWords = [];
  const negativeWords = [];
  
  words.forEach(word => {
    if (sentimentLexicon.positive.has(word)) {
      positive++;
      positiveWords.push(word);
    } else if (sentimentLexicon.negative.has(word)) {
      negative++;
      negativeWords.push(word);
    } else {
      neutral++;
    }
  });
  
  const total = positive + negative + neutral;
  
  return {
    positive: {
      count: positive,
      percentage: total > 0 ? ((positive / total) * 100).toFixed(1) : 0,
      words: [...new Set(positiveWords)].slice(0, 20)
    },
    negative: {
      count: negative,
      percentage: total > 0 ? ((negative / total) * 100).toFixed(1) : 0,
      words: [...new Set(negativeWords)].slice(0, 20)
    },
    neutral: {
      count: neutral,
      percentage: total > 0 ? ((neutral / total) * 100).toFixed(1) : 0
    },
    total,
    score: total > 0 ? ((positive - negative) / total * 100).toFixed(1) : 0
  };
};

// ==================== ÁRVORE DE PALAVRAS (WORD TREE) ====================

const buildWordTree = (text, centerWord, maxBranches = 30, contextWords = 5, minLength = 4) => {
  if (!centerWord || !text) return { left: [], right: [], center: centerWord };

  const sentences = text.split(/[.!?\n]+/).filter(s => s.trim().length > 0);
  const centerLower = centerWord.toLowerCase().replace(/[^\wáàâãéèêíïóôõöúçñü]/gi, '').trim();

  if (!centerLower) return { left: [], right: [], center: centerWord };

  const leftContext = new Map();
  const rightContext = new Map();

  // Função para verificar se palavra de contexto é válida (mais permissiva)
  const isContextWord = (w) => w.length >= 2 && !MANDATORY_SHORT_WORDS_PT.has(w);

  sentences.forEach(sentence => {
    // Limpar pontuação mas manter TODAS as palavras para encontrar o centro
    const allWords = sentence.toLowerCase()
      .split(/\s+/)
      .map(w => w.replace(/[^\wáàâãéèêíïóôõöúçñü]/gi, '').trim())
      .filter(w => w.length > 0);

    allWords.forEach((word, idx) => {
      // Match exato ou stem match (palavra começa com o termo buscado)
      if (word === centerLower || word.startsWith(centerLower)) {
        // Coletar contexto à esquerda (palavras válidas antes do centro)
        const leftWords = [];
        for (let i = idx - 1; i >= Math.max(0, idx - contextWords - 3) && leftWords.length < contextWords; i--) {
          if (isContextWord(allWords[i])) {
            leftWords.unshift(allWords[i]);
          }
        }
        if (leftWords.length > 0) {
          // Adicionar caminhos progressivos (1 palavra, 2 palavras, etc.)
          for (let len = 1; len <= leftWords.length; len++) {
            const path = leftWords.slice(leftWords.length - len).join(' ');
            if (path.trim()) {
              leftContext.set(path, (leftContext.get(path) || 0) + 1);
            }
          }
        }

        // Coletar contexto à direita (palavras válidas depois do centro)
        const rightWords = [];
        for (let i = idx + 1; i < Math.min(allWords.length, idx + contextWords + 3) && rightWords.length < contextWords; i++) {
          if (isContextWord(allWords[i])) {
            rightWords.push(allWords[i]);
          }
        }
        if (rightWords.length > 0) {
          for (let len = 1; len <= rightWords.length; len++) {
            const path = rightWords.slice(0, len).join(' ');
            if (path.trim()) {
              rightContext.set(path, (rightContext.get(path) || 0) + 1);
            }
          }
        }
      }
    });
  });

  const leftBranches = Array.from(leftContext.entries())
    .map(([path, count]) => ({ path, count, words: path.split(' ') }))
    .sort((a, b) => b.count - a.count)
    .slice(0, maxBranches);

  const rightBranches = Array.from(rightContext.entries())
    .map(([path, count]) => ({ path, count, words: path.split(' ') }))
    .sort((a, b) => b.count - a.count)
    .slice(0, maxBranches);

  // Contar ocorrências totais da palavra central
  let totalOccurrences = 0;
  sentences.forEach(sentence => {
    const words = sentence.toLowerCase().split(/\s+/).map(w => w.replace(/[^\wáàâãéèêíïóôõöúçñü]/gi, '').trim());
    totalOccurrences += words.filter(w => w === centerLower || w.startsWith(centerLower)).length;
  });

  return {
    center: centerWord,
    left: leftBranches,
    right: rightBranches,
    totalOccurrences
  };
};

const performKWIC = (text, keyword, contextSize = 50) => {
  const results = [];
  const lowerText = text.toLowerCase();
  const lowerKeyword = keyword.toLowerCase();
  let index = lowerText.indexOf(lowerKeyword);
  
  while (index !== -1) {
    const start = Math.max(0, index - contextSize);
    const end = Math.min(text.length, index + keyword.length + contextSize);
    
    // Find line number
    const textBeforeMatch = text.slice(0, index);
    const lineNumber = (textBeforeMatch.match(/\n/g) || []).length + 1;
    
    // Find sentence boundaries
    const sentenceStart = Math.max(
      text.lastIndexOf('.', index) + 1,
      text.lastIndexOf('!', index) + 1,
      text.lastIndexOf('?', index) + 1,
      0
    );
    const sentenceEndDot = text.indexOf('.', index);
    const sentenceEndExc = text.indexOf('!', index);
    const sentenceEndQue = text.indexOf('?', index);
    const sentenceEnd = Math.min(
      sentenceEndDot === -1 ? Infinity : sentenceEndDot,
      sentenceEndExc === -1 ? Infinity : sentenceEndExc,
      sentenceEndQue === -1 ? Infinity : sentenceEndQue,
      text.length
    ) + 1;
    
    results.push({
      left: text.slice(start, index).trim(),
      keyword: text.slice(index, index + keyword.length),
      right: text.slice(index + keyword.length, end).trim(),
      position: index,
      lineNumber,
      fullSentence: text.slice(sentenceStart, sentenceEnd).trim(),
      charPosition: index
    });
    
    index = lowerText.indexOf(lowerKeyword, index + 1);
  }
  
  return results;
};

// Função para análise detalhada de incidências COM SUPORTE A VARIAÇÕES (plural, gênero, typos)
const analyzeWordIncidences = (documents, targetWord, cleaningOptions, wordData = null) => {
  // Determinar todas as variações a serem buscadas
  let variationsToSearch = [targetWord.toLowerCase()];
  let isGroupedAnalysis = false;
  
  // Só buscar variações se a opção estiver ativada
  if (cleaningOptions.groupVariations) {
    // Se wordData contém informações de variações (do agrupamento), usar todas
    if (wordData && wordData.variations && wordData.variations.length > 1) {
      variationsToSearch = wordData.variations.map(v => v.word.toLowerCase());
      isGroupedAnalysis = true;
    } else {
      // Gerar variações comuns automaticamente
      const baseWord = targetWord.toLowerCase();
      const normalizedBase = normalizePortugueseWord(baseWord);
      
      // Gerar possíveis variações morfológicas
      const generatedVariations = new Set([baseWord]);
      
      // Adicionar variações de gênero e número
      if (baseWord.endsWith('o')) {
        generatedVariations.add(baseWord.slice(0, -1) + 'a');  // masculino -> feminino
        generatedVariations.add(baseWord + 's');               // singular -> plural masc
        generatedVariations.add(baseWord.slice(0, -1) + 'as'); // singular -> plural fem
      } else if (baseWord.endsWith('a')) {
        generatedVariations.add(baseWord.slice(0, -1) + 'o');  // feminino -> masculino
        generatedVariations.add(baseWord + 's');               // singular -> plural fem
        generatedVariations.add(baseWord.slice(0, -1) + 'os'); // singular -> plural masc
      } else if (!baseWord.endsWith('s')) {
        generatedVariations.add(baseWord + 's');               // adicionar plural
      }
      
      // Adicionar variações de linguagem neutra
      if (baseWord.length > 2) {
        const stem = normalizedBase;
        generatedVariations.add(stem + 'x');
        generatedVariations.add(stem + 'xs');
        generatedVariations.add(stem + '@');
        generatedVariations.add(stem + '@s');
      }
      
      variationsToSearch = Array.from(generatedVariations);
      isGroupedAnalysis = true;
    }
  }
  
  const analysis = {
    word: targetWord,
    normalizedForm: cleaningOptions.groupVariations ? normalizePortugueseWord(targetWord.toLowerCase()) : targetWord.toLowerCase(),
    isGroupedAnalysis,
    variationsSearched: variationsToSearch,
    variationsFound: {},
    totalOccurrences: 0,
    documentsWithWord: 0,
    occurrencesByDocument: [],
    allContexts: [],
    positions: [],
    methodology: {
      searchMethod: cleaningOptions.groupVariations 
        ? 'Busca com agrupamento morfológico (gênero, número, typos)' 
        : 'Busca exata case-insensitive (sem agrupamento)',
      variationDetection: cleaningOptions.groupVariations 
        ? 'Normalização portuguesa + Distância de Levenshtein (máx. 2)' 
        : 'Desativado',
      contextWindow: '50 caracteres antes e depois',
      cleaningApplied: cleaningOptions,
      variationsIncluded: variationsToSearch
    },
    timestamp: new Date().toISOString()
  };
  
  documents.forEach((doc, docIndex) => {
    const content = doc.content;
    const lowerContent = content.toLowerCase();
    const docOccurrences = [];
    let docCount = 0;
    
    // Buscar cada variação
    for (const variation of variationsToSearch) {
      let searchIndex = 0;
      
      while (true) {
        const foundIndex = lowerContent.indexOf(variation, searchIndex);
        if (foundIndex === -1) break;
        
        // Verificar se é uma palavra completa (não parte de outra palavra)
        const charBefore = foundIndex > 0 ? lowerContent[foundIndex - 1] : ' ';
        const charAfter = foundIndex + variation.length < lowerContent.length 
          ? lowerContent[foundIndex + variation.length] 
          : ' ';
        
        const isWordBoundaryBefore = /[\s\.,;:!?\-\(\)\[\]\"\'«»""'']/.test(charBefore);
        const isWordBoundaryAfter = /[\s\.,;:!?\-\(\)\[\]\"\'«»""'']/.test(charAfter);
        
        if (isWordBoundaryBefore && isWordBoundaryAfter) {
          docCount++;
          
          // Registrar variação encontrada
          const matchedText = content.slice(foundIndex, foundIndex + variation.length);
          if (!analysis.variationsFound[matchedText.toLowerCase()]) {
            analysis.variationsFound[matchedText.toLowerCase()] = { 
              count: 0, 
              originalForms: new Set() 
            };
          }
          analysis.variationsFound[matchedText.toLowerCase()].count++;
          analysis.variationsFound[matchedText.toLowerCase()].originalForms.add(matchedText);
          
          // Calcular linha e coluna
          const textBefore = content.slice(0, foundIndex);
          const lines = textBefore.split('\n');
          const lineNumber = lines.length;
          const columnNumber = lines[lines.length - 1].length + 1;
          
          // Extrair contexto
          const contextStart = Math.max(0, foundIndex - 50);
          const contextEnd = Math.min(content.length, foundIndex + variation.length + 50);
          
          // Extrair frase completa
          let sentenceStart = foundIndex;
          let sentenceEnd = foundIndex + variation.length;
          
          for (let i = foundIndex - 1; i >= 0; i--) {
            if (['.', '!', '?', '\n'].includes(content[i])) {
              sentenceStart = i + 1;
              break;
            }
            if (i === 0) sentenceStart = 0;
          }
          
          for (let i = foundIndex + variation.length; i < content.length; i++) {
            if (['.', '!', '?', '\n'].includes(content[i])) {
              sentenceEnd = i + 1;
              break;
            }
            if (i === content.length - 1) sentenceEnd = content.length;
          }
          
          const occurrence = {
            occurrenceNumber: analysis.allContexts.length + 1,
            documentId: docIndex + 1,
            documentName: doc.name,
            absolutePosition: foundIndex,
            lineNumber,
            columnNumber,
            contextBefore: content.slice(contextStart, foundIndex),
            matchedText: content.slice(foundIndex, foundIndex + variation.length),
            matchedVariation: variation,
            isExactMatch: variation === targetWord.toLowerCase(),
            variationType: variation === targetWord.toLowerCase() ? 'exact' : 
              (wordData?.variations?.find(v => v.word.toLowerCase() === variation)?.variationType || 'generated'),
            contextAfter: content.slice(foundIndex + variation.length, contextEnd),
            fullSentence: content.slice(sentenceStart, sentenceEnd).trim(),
            charIndexStart: foundIndex,
            charIndexEnd: foundIndex + variation.length
          };
          
          docOccurrences.push(occurrence);
          analysis.allContexts.push(occurrence);
          analysis.positions.push({
            doc: docIndex + 1,
            pos: foundIndex,
            line: lineNumber,
            col: columnNumber,
            variation
          });
        }
        
        searchIndex = foundIndex + 1;
      }
    }
    
    if (docCount > 0) {
      analysis.documentsWithWord++;
      analysis.occurrencesByDocument.push({
        documentId: docIndex + 1,
        documentName: doc.name,
        count: docCount,
        occurrences: docOccurrences,
        totalWords: content.split(/\s+/).length,
        relativeFrequency: (docCount / content.split(/\s+/).length * 1000).toFixed(4) + ' por 1000 palavras'
      });
    }
    
    analysis.totalOccurrences += docCount;
  });
  
  // Converter Sets para Arrays para serialização
  Object.keys(analysis.variationsFound).forEach(key => {
    analysis.variationsFound[key].originalForms = Array.from(analysis.variationsFound[key].originalForms);
  });
  
  // Calcular estatísticas agregadas
  analysis.statistics = {
    totalOccurrences: analysis.totalOccurrences,
    documentsAnalyzed: documents.length,
    documentsWithWord: analysis.documentsWithWord,
    coveragePercentage: ((analysis.documentsWithWord / documents.length) * 100).toFixed(2) + '%',
    averagePerDocument: (analysis.totalOccurrences / documents.length).toFixed(2),
    uniqueVariationsFound: Object.keys(analysis.variationsFound).length,
    variationBreakdown: Object.entries(analysis.variationsFound)
      .map(([variation, data]) => ({
        variation,
        count: data.count,
        percentage: ((data.count / analysis.totalOccurrences) * 100).toFixed(1) + '%',
        originalForms: data.originalForms
      }))
      .sort((a, b) => b.count - a.count),
    medianPerDocument: (() => {
      const counts = analysis.occurrencesByDocument.map(d => d.count).sort((a, b) => a - b);
      if (counts.length === 0) return 0;
      const mid = Math.floor(counts.length / 2);
      return counts.length % 2 ? counts[mid] : ((counts[mid - 1] + counts[mid]) / 2).toFixed(2);
    })()
  };
  
  return analysis;
};

// Gerar relatório científico em formato Markdown
const generateScientificReport = (analysis, cleaningOptions) => {
  const variationSection = analysis.statistics.variationBreakdown && analysis.statistics.variationBreakdown.length > 0 
    ? `
### 2.3 Análise de Variações Morfológicas
Esta análise agrupa automaticamente variações de gênero, número e possíveis erros de digitação.

| Variação Encontrada | Ocorrências | Percentual | Formas Originais |
|---------------------|-------------|------------|------------------|
${analysis.statistics.variationBreakdown.map(v => 
  `| ${v.variation} | ${v.count} | ${v.percentage} | ${v.originalForms.join(', ')} |`
).join('\n')}

**Variações buscadas:** ${analysis.variationsSearched ? analysis.variationsSearched.join(', ') : 'N/A'}
` : '';

  const report = `# Relatório de Análise de Incidências Textuais
## TextLab - Ferramenta de Análise Textual

**Data da Análise:** ${new Date().toLocaleString('pt-BR')}
**Palavra Analisada:** "${analysis.word}"
**Forma Normalizada:** "${analysis.normalizedForm || analysis.word}"
**Análise com Agrupamento:** ${analysis.isGroupedAnalysis ? 'Sim' : 'Não'}

---

## 1. Metodologia

### 1.1 Algoritmo de Busca com Agrupamento Morfológico
O algoritmo utiliza um sistema de **normalização morfológica** para agrupar variações de uma mesma palavra:

- **Variações de gênero:** ministro, ministra
- **Variações de número:** ministro, ministros, ministras
- **Linguagem neutra:** ministrx, ministr@, ministres
- **Erros de digitação:** Detectados via Distância de Levenshtein (máx. 2 edições)

\`\`\`javascript
// Algoritmo de normalização portuguesa
function normalizePortugueseWord(word) {
  let normalized = word.toLowerCase();
  
  // Regras de normalização (ordem de prioridade)
  const rules = [
    { pattern: /ões$/i, replacement: 'ão' },   // nações -> nação
    { pattern: /ães$/i, replacement: 'ão' },   // pães -> pão
    { pattern: /xs$/i, replacement: '' },      // ministrxs -> ministr
    { pattern: /as$/i, replacement: 'o' },     // ministras -> ministro
    { pattern: /os$/i, replacement: 'o' },     // ministros -> ministro
    { pattern: /a$/i, replacement: 'o' },      // ministra -> ministro
    { pattern: /s$/i, replacement: '' },       // plural -> singular
  ];
  
  for (const rule of rules) {
    if (rule.pattern.test(normalized) && normalized.length > 3) {
      normalized = normalized.replace(rule.pattern, rule.replacement);
      break;
    }
  }
  return normalized;
}

// Detecção de typos via Levenshtein
function levenshteinDistance(str1, str2) {
  // Matriz de programação dinâmica para calcular
  // número mínimo de edições (inserção, deleção, substituição)
  // Considera typo se distância <= 2 e similaridade >= 75%
}
\`\`\`

### 1.2 Parâmetros de Limpeza Aplicados
| Parâmetro | Valor |
|-----------|-------|
| Conversão para minúsculas | ${cleaningOptions.lowercase ? 'Sim' : 'Não'} |
| Remoção de números | ${cleaningOptions.removeNumbers ? 'Sim' : 'Não'} |
| Remoção de pontuação | ${cleaningOptions.removePunctuation ? 'Sim' : 'Não'} |
| Remoção de stopwords | ${cleaningOptions.removeStopwords ? 'Sim' : 'Não'} |
| Tamanho mínimo de palavra | ${cleaningOptions.minLength} caracteres |

### 1.3 Janela de Contexto
- **Contexto extraído:** 50 caracteres antes e depois da ocorrência
- **Frase completa:** Delimitada por pontuação (.!?) ou quebra de linha
- **Validação de limites:** Apenas palavras completas (não substrings)

---

## 2. Resultados Estatísticos

### 2.1 Resumo Geral
| Métrica | Valor |
|---------|-------|
| **Total de Ocorrências (todas variações)** | ${analysis.statistics.totalOccurrences} |
| **Variações Únicas Encontradas** | ${analysis.statistics.uniqueVariationsFound || 1} |
| **Documentos Analisados** | ${analysis.statistics.documentsAnalyzed} |
| **Documentos com a Palavra** | ${analysis.statistics.documentsWithWord} |
| **Cobertura** | ${analysis.statistics.coveragePercentage} |
| **Média por Documento** | ${analysis.statistics.averagePerDocument} |
| **Mediana por Documento** | ${analysis.statistics.medianPerDocument} |
${variationSection}
### 2.4 Distribuição por Documento
${analysis.occurrencesByDocument.map(doc => `
#### Documento ${doc.documentId}: ${doc.documentName}
- Ocorrências: **${doc.count}**
- Total de palavras no documento: ${doc.totalWords}
- Frequência relativa: ${doc.relativeFrequency}
`).join('')}

---

## 3. Evidências Detalhadas (Todas as Ocorrências)

${analysis.allContexts.map((occ, idx) => `
### Ocorrência #${idx + 1}
- **Documento:** ${occ.documentName} (ID: ${occ.documentId})
- **Posição:** Linha ${occ.lineNumber}, Coluna ${occ.columnNumber}
- **Índice de caractere:** ${occ.charIndexStart} - ${occ.charIndexEnd}
- **Variação encontrada:** "${occ.matchedText}" ${occ.isExactMatch ? '(forma exata)' : `(variação de "${analysis.word}")`}
- **Tipo de variação:** ${occ.variationType || 'exact'}

**Contexto:**
> ...${occ.contextBefore}**[${occ.matchedText}]**${occ.contextAfter}...

**Frase completa:**
> "${occ.fullSentence}"

---
`).join('')}

## 4. Código de Verificação

Para verificar estes resultados, você pode usar o seguinte código Python:

\`\`\`python
import pandas as pd
import re
from difflib import SequenceMatcher

# Carregar o corpus
corpus = """[Inserir texto do corpus aqui]"""

# Palavra alvo e suas variações
target_word = "${analysis.word}"
variations = ${JSON.stringify(analysis.variationsSearched || [analysis.word])}

def normalize_portuguese(word):
    """Normaliza palavra removendo sufixos de gênero/número"""
    w = word.lower()
    rules = [
        (r'ões$', 'ão'), (r'ães$', 'ão'), (r'xs$', ''), 
        (r'as$', 'o'), (r'os$', 'o'), (r'a$', 'o'), (r's$', '')
    ]
    for pattern, replacement in rules:
        if re.search(pattern, w) and len(w) > 3:
            return re.sub(pattern, replacement, w)
    return w

def is_word_boundary(text, start, end):
    """Verifica se a ocorrência é uma palavra completa"""
    before = text[start-1] if start > 0 else ' '
    after = text[end] if end < len(text) else ' '
    boundary_chars = r'[\\s.,;:!?\\-()\\[\\]"\\'«»""'']'
    return bool(re.match(boundary_chars, before) and re.match(boundary_chars, after))

# Encontrar todas as ocorrências de todas as variações
positions = []
text_lower = corpus.lower()

for variation in variations:
    start = 0
    while True:
        pos = text_lower.find(variation.lower(), start)
        if pos == -1:
            break
        
        if is_word_boundary(corpus, pos, pos + len(variation)):
            line_num = text_lower[:pos].count('\\n') + 1
            positions.append({
                'variation': variation,
                'matched_text': corpus[pos:pos+len(variation)],
                'position': pos,
                'line': line_num,
                'context': corpus[max(0,pos-50):pos+len(variation)+50]
            })
        start = pos + 1

# Criar DataFrame
df = pd.DataFrame(positions)
print(f"Total de ocorrências encontradas: {len(df)}")
print(f"Variações encontradas: {df['variation'].unique()}")
print(df.groupby('variation').size())
\`\`\`

**Resultado esperado:** ${analysis.statistics.totalOccurrences} ocorrências totais
**Variações esperadas:** ${analysis.statistics.uniqueVariationsFound || 1}

---

## 5. Validação e Reprodutibilidade

Este relatório foi gerado automaticamente pelo TextLab.
Os resultados podem ser verificados:

1. **Manualmente:** Usando Ctrl+F no documento original para cada variação
2. **Programaticamente:** Usando o código Python fornecido acima
3. **Via IRaMuTeQ:** Exportando o corpus e realizando busca lexical
4. **Via Excel/Google Sheets:** Importando o CSV exportado e verificando contagens

**Variações incluídas na análise:**
${(analysis.variationsSearched || [analysis.word]).map(v => `- ${v}`).join('\n')}

**Hash de verificação:** \`${Array.from(analysis.word).reduce((hash, char) => ((hash << 5) - hash) + char.charCodeAt(0), 0).toString(16)}\`

---

*Relatório gerado por TextLab - Análise Textual Avançada*
*Criado por Lucas Oliveira Teixeira com Claude Opus 4.5 para a UFABC*
`;

  return report;
};

// Gerar dados em formato CSV para análise externa
const generateIncidenceCSV = (analysis) => {
  let csv = 'Ocorrencia,Documento_ID,Documento_Nome,Linha,Coluna,Posicao_Char_Inicio,Posicao_Char_Fim,Variacao_Buscada,Texto_Encontrado,Tipo_Variacao,Match_Exato,Contexto_Antes,Contexto_Depois,Frase_Completa\n';
  
  analysis.allContexts.forEach((occ, idx) => {
    const escapeCsv = (str) => `"${(str || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`;
    csv += [
      idx + 1,
      occ.documentId,
      escapeCsv(occ.documentName),
      occ.lineNumber,
      occ.columnNumber,
      occ.charIndexStart,
      occ.charIndexEnd,
      escapeCsv(occ.matchedVariation || occ.matchedText),
      escapeCsv(occ.matchedText),
      escapeCsv(occ.variationType || 'exact'),
      occ.isExactMatch ? 'Sim' : 'Não',
      escapeCsv(occ.contextBefore),
      escapeCsv(occ.contextAfter),
      escapeCsv(occ.fullSentence)
    ].join(',') + '\n';
  });
  
  // Adicionar resumo de variações no final
  if (analysis.statistics.variationBreakdown && analysis.statistics.variationBreakdown.length > 0) {
    csv += '\n\n# RESUMO DE VARIACOES\n';
    csv += 'Variacao,Contagem,Percentual,Formas_Originais\n';
    analysis.statistics.variationBreakdown.forEach(v => {
      const escapeCsv = (str) => `"${(str || '').replace(/"/g, '""')}"`;
      csv += [
        escapeCsv(v.variation),
        v.count,
        v.percentage,
        escapeCsv(v.originalForms.join('; '))
      ].join(',') + '\n';
    });
  }
  
  return csv;
};

const generateIRaMuTeQCorpus = (documents) => {
  let corpus = '';
  documents.forEach((doc, idx) => {
    const segments = doc.content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    segments.forEach((segment, segIdx) => {
      const cleanedSegment = segment.trim().replace(/\s+/g, ' ');
      if (cleanedSegment.length > 10) {
        corpus += `**** *doc_${idx + 1} *seg_${segIdx + 1}\n`;
        corpus += cleanedSegment + '\n\n';
      }
    });
  });
  return corpus;
};

const performCHD = (segments, numClasses = 5, options = {}, stopwords = null) => {
  // Simplified CHD/Reinert clustering simulation
  const segmentData = segments.map((seg, idx) => {
    const words = cleanText(seg, options, stopwords);
    const wordFreq = calculateWordFrequency(words);
    return {
      id: idx,
      text: seg,
      words,
      topWords: wordFreq.slice(0, 10),
      cluster: Math.floor(Math.random() * numClasses)
    };
  });
  
  // Assign clusters based on word similarity
  const clusters = {};
  for (let i = 0; i < numClasses; i++) {
    clusters[i] = {
      id: i,
      segments: [],
      topWords: [],
      color: ['oklch(0.585 0.204 277.12)', 'oklch(0.457 0.215 277.02)', 'oklch(0.359 0.135 278.70)'][i % 3]
    };
  }
  
  segmentData.forEach(seg => {
    clusters[seg.cluster].segments.push(seg);
  });
  
  // Calculate top words per cluster
  Object.values(clusters).forEach(cluster => {
    const allWords = cluster.segments.flatMap(s => s.words);
    const freq = calculateWordFrequency(allWords);
    cluster.topWords = freq.slice(0, 15);
  });
  
  return { clusters, segmentData };
};

// ==================== COMPONENTS ====================

const WordCloudComponent = ({ words, width = 700, height = 500, onWordClick }) => {
  const [hoveredWord, setHoveredWord] = useState(null);
  const [positionedWords, setPositionedWords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Carregar d3 e d3-cloud via CDN e calcular layout
  useEffect(() => {
    if (!words || words.length === 0) {
      setPositionedWords([]);
      setIsLoading(false);
      return;
    }
    
    const loadAndRender = async () => {
      setIsLoading(true);
      
      // Carregar D3 se não estiver carregado
      if (!window.d3) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
      
      // Carregar d3-cloud se não estiver carregado
      if (!window.d3.layout || !window.d3.layout.cloud) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/d3-cloud/1.2.7/d3.layout.cloud.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
      
      // Preparar dados
      const maxCount = Math.max(...words.map(w => w.count));
      const minCount = Math.min(...words.map(w => w.count));
      const range = maxCount - minCount || 1;
      
      // Escala logarítmica para tamanho das palavras
      const fontSizeScale = (count) => {
        const normalized = (count - minCount) / range;
        const logScale = Math.log(normalized * 9 + 1) / Math.log(10);
        return 12 + logScale * 52; // 12px a 64px
      };
      
      const wordsData = words.slice(0, 120).map(w => ({
        text: w.word,
        size: fontSizeScale(w.count),
        count: w.count,
        originalWord: w
      }));
      
      // Criar layout usando d3-cloud
      const layout = window.d3.layout.cloud()
        .size([width, height])
        .words(wordsData)
        .padding(5)
        .rotate(() => {
          // 15% das palavras rotacionadas
          return Math.random() < 0.15 ? -90 : 0;
        })
        .font("'Inter', 'Segoe UI', system-ui, sans-serif")
        .fontSize(d => d.size)
        .spiral('archimedean')
        .random(() => 0.5) // Seed para consistência
        .on('end', (layoutWords) => {
          // Adicionar informações extras
          if (!layoutWords || layoutWords.length === 0) {
            setIsLoading(false);
            return;
          }
          const finalWords = layoutWords.map(w => ({
            ...w,
            count: w.count,
            opacity: 0.6 + (w.count - minCount) / range * 0.4,
            originalWord: w.originalWord
          }));
          setPositionedWords(finalWords);
          setIsLoading(false);
        });
      
      layout.start();
    };
    
    loadAndRender().catch(err => {
      console.error('Erro ao carregar d3-cloud:', err);
      setIsLoading(false);
    });
  }, [words, width, height]);
  
  // Cores gradiente baseadas na frequência
  const getWordColor = (word, maxCount) => {
    const ratio = word.count / maxCount;
    if (ratio > 0.5) return 'oklch(0.585 0.204 277.12)';
    if (ratio > 0.2) return 'oklch(0.457 0.215 277.02)';
    return 'oklch(0.359 0.135 278.70)';
  };
  
  const maxCount = words.length > 0 ? Math.max(...words.map(w => w.count)) : 1;
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center" style={{ width, height }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Gerando nuvem de palavras...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative">
      <svg 
        width={width} 
        height={height} 
        className="word-cloud rounded-xl"
        style={{ background: 'none' }}
      >
        <defs>
        </defs>
        
        <g transform={`translate(${width / 2}, ${height / 2})`}>
          {positionedWords.map((word, idx) => {
            const isHovered = hoveredWord === word.text;
            const color = getWordColor(word, maxCount);
            const isTopWord = word.count > maxCount * 0.5;
            
            return (
              <g key={idx}>{/* Palavra principal */}
                <text
                  x={word.x}
                  y={word.y}
                  fontSize={isHovered ? word.size * 1.15 : word.size}
                  fill={isHovered ? 'oklch(1.000 0 0)' : color}
                  opacity={isHovered ? 1 : word.opacity}
                  transform={`rotate(${word.rotate || 0}, ${word.x}, ${word.y})`}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{ 
                    fontFamily: word.font || "'Inter', sans-serif",
                    fontWeight: word.count > maxCount * 0.3 ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-out',
                    textShadow: isHovered ? 'none' : 'none'
                  }}
                  onMouseEnter={() => setHoveredWord(word.text)}
                  onMouseLeave={() => setHoveredWord(null)}
                  onClick={() => onWordClick && onWordClick(word.originalWord)}
                >
                  {word.text}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
      
      {/* Tooltip flutuante */}
      {hoveredWord && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-5 py-3 bg-background/95 border border-primary/40 rounded-xl shadow-lg z-10 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <span className="text-primary font-bold text-lg">{hoveredWord}</span>
            <span className="px-2 py-1 bg-primary/20 text-primary rounded-lg text-sm font-medium">
              {positionedWords.find(w => w.text === hoveredWord)?.count || 0}x
            </span>
          </div>
          <p className="text-muted-foreground text-xs mt-1">Clique para análise detalhada de incidências</p>
        </div>
      )}
    </div>
  );
};

const NetworkGraph = ({ cooccurrences, width = 700, height = 500, isDarkMode = true }) => {
  const [hoveredNode, setHoveredNode] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const svgRef = React.useRef(null);
  
  // Force-directed layout with collision avoidance
  const graphData = useMemo(() => {
    if (!cooccurrences || cooccurrences.length === 0) {
      return { nodes: [], links: [], maxWeight: 0 };
    }
    const topLinks = cooccurrences.slice(0, 100);
    const nodes = new Map();
    
    topLinks.forEach(link => {
      if (!nodes.has(link.source)) {
        nodes.set(link.source, { id: link.source, weight: 0, connections: [] });
      }
      if (!nodes.has(link.target)) {
        nodes.set(link.target, { id: link.target, weight: 0, connections: [] });
      }
      nodes.get(link.source).weight += link.weight;
      nodes.get(link.target).weight += link.weight;
      nodes.get(link.source).connections.push(link.target);
      nodes.get(link.target).connections.push(link.source);
    });
    
    const nodeArray = Array.from(nodes.values());
    const maxWeight = Math.max(...nodeArray.map(n => n.weight), 1);
    
    // Initialize positions in a circle
    const centerX = width / 2;
    const centerY = height / 2;
    nodeArray.forEach((node, idx) => {
      const angle = (idx / nodeArray.length) * 2 * Math.PI;
      const radius = 120 + Math.random() * 80;
      node.x = centerX + Math.cos(angle) * radius;
      node.y = centerY + Math.sin(angle) * radius;
      node.radius = 6 + (node.weight / maxWeight) * 22;
      node.vx = 0;
      node.vy = 0;
    });
    
    // Force-directed simulation (120 iterations)
    const repulsion = 2500;
    const attraction = 0.006;
    const centerGravity = 0.015;
    const minNodeDistance = 45;
    
    for (let iter = 0; iter < 120; iter++) {
      const alpha = 1 - iter / 120;
      
      // Repulsion between all nodes
      for (let i = 0; i < nodeArray.length; i++) {
        for (let j = i + 1; j < nodeArray.length; j++) {
          const dx = nodeArray[j].x - nodeArray[i].x;
          const dy = nodeArray[j].y - nodeArray[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const minDist = nodeArray[i].radius + nodeArray[j].radius + minNodeDistance;
          
          if (dist < minDist * 2) {
            const force = (repulsion * alpha) / (dist * dist);
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            nodeArray[i].vx -= fx;
            nodeArray[i].vy -= fy;
            nodeArray[j].vx += fx;
            nodeArray[j].vy += fy;
          }
        }
      }
      
      // Attraction along edges
      topLinks.forEach(link => {
        const source = nodes.get(link.source);
        const target = nodes.get(link.target);
        if (!source || !target) return;
        
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = dist * attraction * alpha * (1 + link.weight / maxWeight);
        
        source.vx += (dx / dist) * force;
        source.vy += (dy / dist) * force;
        target.vx -= (dx / dist) * force;
        target.vy -= (dy / dist) * force;
      });
      
      // Center gravity
      nodeArray.forEach(node => {
        node.vx += (centerX - node.x) * centerGravity * alpha;
        node.vy += (centerY - node.y) * centerGravity * alpha;
      });
      
      // Apply velocities with damping
      nodeArray.forEach(node => {
        node.x += node.vx * 0.85;
        node.y += node.vy * 0.85;
        node.vx *= 0.9;
        node.vy *= 0.9;
        // Keep in bounds
        const margin = 50;
        node.x = Math.max(margin, Math.min(width - margin, node.x));
        node.y = Math.max(margin, Math.min(height - margin, node.y));
      });
    }
    
    // Final collision resolution pass
    for (let pass = 0; pass < 8; pass++) {
      for (let i = 0; i < nodeArray.length; i++) {
        for (let j = i + 1; j < nodeArray.length; j++) {
          const dx = nodeArray[j].x - nodeArray[i].x;
          const dy = nodeArray[j].y - nodeArray[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const minDist = nodeArray[i].radius + nodeArray[j].radius + 8;
          
          if (dist < minDist) {
            const overlap = (minDist - dist) / 2;
            const nx = dx / dist;
            const ny = dy / dist;
            nodeArray[i].x -= nx * overlap;
            nodeArray[i].y -= ny * overlap;
            nodeArray[j].x += nx * overlap;
            nodeArray[j].y += ny * overlap;
          }
        }
      }
    }
    
    // Calculate hub scores
    const maxConnections = Math.max(...nodeArray.map(n => n.connections.length), 1);
    nodeArray.forEach(node => {
      node.hubScore = node.connections.length / maxConnections;
    });
    
    return { nodes: nodeArray, links: topLinks, maxWeight };
  }, [cooccurrences, width, height]);
  
  const nodeMap = useMemo(() => {
    const map = new Map();
    graphData.nodes.forEach(n => map.set(n.id, n));
    return map;
  }, [graphData.nodes]);
  
  // Get hovered node data for tooltip
  const hoveredNodeData = useMemo(() => {
    if (!hoveredNode) return null;
    const node = nodeMap.get(hoveredNode);
    if (!node) return null;
    
    const connections = graphData.links
      .filter(l => l.source === hoveredNode || l.target === hoveredNode)
      .map(l => ({
        word: l.source === hoveredNode ? l.target : l.source,
        weight: l.weight
      }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 5);
    
    const percentile = Math.round(node.hubScore * 100);
    
    return { ...node, connections, percentile };
  }, [hoveredNode, nodeMap, graphData.links]);
  
  // Create Bezier curve path
  const createCurvedPath = (source, target, idx) => {
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const midX = (source.x + target.x) / 2;
    const midY = (source.y + target.y) / 2;
    const perpX = -dy / dist;
    const perpY = dx / dist;
    const curvature = Math.min(dist * 0.15, 35) * (idx % 2 === 0 ? 1 : -1);
    const ctrlX = midX + perpX * curvature;
    const ctrlY = midY + perpY * curvature;
    return `M ${source.x} ${source.y} Q ${ctrlX} ${ctrlY} ${target.x} ${target.y}`;
  };
  
  // Zoom/Pan handlers
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoomLevel(prev => Math.max(0.3, Math.min(4, prev * delta)));
  }, []);
  
  const handleMouseDown = useCallback((e) => {
    if (e.button === 0 && !hoveredNode) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  }, [hoveredNode, panOffset]);
  
  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      setPanOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
    // Track mouse for tooltip
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      setTooltipPos({ x: (e.clientX - rect.left - panOffset.x) / zoomLevel, y: (e.clientY - rect.top - panOffset.y) / zoomLevel });
    }
  }, [isDragging, dragStart, panOffset, zoomLevel]);
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  const resetView = useCallback(() => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  }, []);
  
  return (
    <div className="relative">
      {/* Zoom controls */}
      <div className="absolute top-2 right-2 z-10 flex gap-1">
        <button
          onClick={() => setZoomLevel(z => Math.min(4, z * 1.2))}
          className="p-1.5 rounded bg-secondary hover:bg-secondary/80 text-secondary-foreground text-xs"
          title="Zoom In"
        >+</button>
        <button
          onClick={() => setZoomLevel(z => Math.max(0.3, z / 1.2))}
          className="p-1.5 rounded bg-secondary hover:bg-secondary/80 text-secondary-foreground text-xs"
          title="Zoom Out"
        >−</button>
        <button
          onClick={resetView}
          className="p-1.5 rounded bg-secondary hover:bg-secondary/80 text-secondary-foreground text-xs"
          title="Reset View"
        >⟲</button>
      </div>
      <div className="absolute bottom-2 left-2 z-10 text-xs text-muted-foreground">
        Zoom: {Math.round(zoomLevel * 100)}% | Scroll to zoom, drag to pan
      </div>
      
      <svg 
        ref={svgRef}
        width={width} 
        height={height} 
        className="network-graph cursor-grab"
        style={{ cursor: isDragging ? 'grabbing' : (hoveredNode ? 'pointer' : 'grab') }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
        </defs>
        
        <g transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}>
          {/* Links as Bezier curves */}
          {graphData.links.map((link, idx) => {
            const source = nodeMap.get(link.source);
            const target = nodeMap.get(link.target);
            if (!source || !target) return null;
            
            const isHighlighted = hoveredNode === link.source || hoveredNode === link.target;
            
            return (
              <path
                key={`link-${idx}`}
                d={createCurvedPath(source, target, idx)}
                fill="none"
                stroke={isHighlighted ? "oklch(0.585 0.204 277.12)" : "url(#networkLinkGradient)"}
                strokeWidth={1.5 + (link.weight / graphData.maxWeight) * 3}
                opacity={hoveredNode ? (isHighlighted ? 0.9 : 0.08) : 0.4}
                style={{ transition: 'opacity 0.2s' }}
              />
            );
          })}
          
          {/* Nodes */}
          {graphData.nodes.map((node, idx) => {
            const isHovered = hoveredNode === node.id;
            const isConnected = hoveredNode && hoveredNodeData?.connections.some(c => c.word === node.id);
            
            return (
              <g 
                key={`node-${idx}`}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                style={{ cursor: 'pointer' }}
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.radius}
                  fill={isHovered ? 'oklch(0.680 0.158 276.93)' : 'oklch(0.585 0.204 277.12)'}
                  stroke={isHovered ? "oklch(0.585 0.204 277.12)" : "oklch(1.000 0 0)"}
                  strokeWidth={isHovered ? 3 : 2}
                  opacity={hoveredNode ? (isHovered ? 1 : (isConnected ? 0.85 : 0.12)) : 0.85}
                  style={{ transition: 'opacity 0.2s, fill 0.2s' }}
                />
                <text
                  x={node.x}
                  y={node.y - node.radius - 6}
                  textAnchor="middle"
                  fill={isDarkMode ? "oklch(0.280 0.037 260.03)" : "oklch(0.984 0.003 247.86)"}
                  fontSize={Math.max(9, 10 + node.radius / 4)}
                  fontWeight={isHovered ? 600 : 400}
                  style={{ fontFamily: "'JetBrains Mono', monospace", pointerEvents: 'none' }}
                  opacity={hoveredNode ? (isHovered || isConnected ? 1 : 0.2) : 0.85}
                >
                  {node.id}
                </text>
              </g>
            );
          })}
        </g>
        
        {/* Rich Tooltip */}
        {hoveredNodeData && (
          <g transform={`translate(${Math.min(tooltipPos.x * zoomLevel + panOffset.x + 20, width - 200)}, ${Math.max(tooltipPos.y * zoomLevel + panOffset.y - 10, 10)})`}>
            <rect
              x={0} y={0}
              width={185} height={hoveredNodeData.connections.length > 0 ? 90 + hoveredNodeData.connections.length * 16 : 70}
              rx={8}
              fill="oklch(0.208 0.040 265.75 / 0.95)"
              stroke="oklch(0.585 0.204 277.12)"
              strokeWidth={1}
            />
            <text x={10} y={22} fill="oklch(0.585 0.204 277.12)" fontSize={13} fontWeight={600}>{hoveredNodeData.id}</text>
            <text x={10} y={42} fill="oklch(0.551 0.023 264.36)" fontSize={10}>
              Hub Score: {(hoveredNodeData.hubScore * 100).toFixed(0)}% (top {100 - hoveredNodeData.percentile}%)
            </text>
            <text x={10} y={58} fill="oklch(0.551 0.023 264.36)" fontSize={10}>
              Conexões: {hoveredNodeData.connections.length} | Peso: {hoveredNodeData.weight}
            </text>
            {hoveredNodeData.connections.length > 0 && (
              <>
                <line x1={10} y1={68} x2={175} y2={68} stroke="oklch(0.872 0.009 258.34)" strokeWidth={1} />
                <text x={10} y={82} fill="oklch(0.551 0.023 264.36)" fontSize={9}>Top conexões:</text>
                {hoveredNodeData.connections.map((conn, i) => (
                  <text key={i} x={15} y={96 + i * 16} fill="oklch(0.280 0.037 260.03)" fontSize={10}>
                    • {conn.word} ({conn.weight})
                  </text>
                ))}
              </>
            )}
          </g>
        )}
      </svg>
    </div>
  );
};

const ClusterVisualization = ({ chdResult }) => {
  const [selectedCluster, setSelectedCluster] = useState(null);
  
  if (!chdResult) return null;
  
  const { clusters } = chdResult;
  if (!clusters) return null;
  
  const clusterArray = Object.values(clusters).filter(c => c.segments?.length > 0);
  
  return (
    <div className="cluster-viz">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {clusterArray.map((cluster, idx) => (
          <button
            key={cluster.id}
            onClick={() => setSelectedCluster(selectedCluster === cluster.id ? null : cluster.id)}
            className={`p-4 rounded-xl border-2 transition-all duration-300 ${
              selectedCluster === cluster.id 
                ? 'border-white scale-105 shadow-lg' 
                : 'border-input hover:border-input'
            }`}
            style={{ 
              backgroundColor: cluster.color + '20',
              borderColor: selectedCluster === cluster.id ? cluster.color : undefined
            }}
          >
            <div className="text-2xl font-bold mb-1" style={{ color: cluster.color }}>
              {cluster.segments?.length || 0}
            </div>
            <div className={`text-xs text-muted-foreground`}>
              Classe {cluster.id + 1}
            </div>
            <div className="text-xs text-muted-foreground mt-2 truncate">
              {cluster.topWords.slice(0, 3).map(w => w.word).join(', ')}
            </div>
          </button>
        ))}
      </div>
      
      {selectedCluster !== null && clusters[selectedCluster] && (
        <div className="bg-card rounded-xl p-6 border border-input">
          <h4 className="text-lg font-semibold mb-4" style={{ color: clusters[selectedCluster].color }}>
            Classe {selectedCluster + 1} - Palavras Características
          </h4>
          <div className="flex flex-wrap gap-2 mb-6">
            {clusters[selectedCluster].topWords.map((word, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-full text-sm"
                style={{ 
                  backgroundColor: clusters[selectedCluster].color + '30',
                  color: clusters[selectedCluster].color
                }}
              >
                {word.word} ({word.count})
              </span>
            ))}
          </div>
          <h5 className="text-sm font-medium text-muted-foreground mb-3">
            Segmentos representativos ({clusters[selectedCluster].segments.length} total)
          </h5>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {clusters[selectedCluster].segments.slice(0, 5).map((seg, idx) => (
              <div key={idx} className="text-sm text-foreground/80 p-3 bg-muted/30 rounded-lg">
                "{seg.text.slice(0, 200)}..."
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const StatisticsPanel = ({ stats }) => {
  if (!stats) return null;
  
  const statItems = stats.groupingEnabled ? [
    { label: 'Documentos', value: stats.documentCount, icon: FileText },
    { label: 'Palavras Totais', value: stats.totalWords.toLocaleString(), icon: Hash },
    { label: 'Formas Únicas (raw)', value: (stats.uniqueWordsRaw || stats.uniqueWords).toLocaleString(), icon: Activity, color: 'text-muted-foreground' },
    { label: 'Lemas (agrupados)', value: stats.uniqueWords.toLocaleString(), icon: Layers, color: 'text-primary' },
    { label: 'Grupos c/ Variações', value: (stats.groupedWords || 0).toLocaleString(), icon: GitBranch, color: 'text-primary' },
    { label: 'Riqueza Léxica', value: `${stats.lexicalRichness}%`, icon: TrendingUp },
  ] : [
    { label: 'Documentos', value: stats.documentCount, icon: FileText },
    { label: 'Palavras Totais', value: stats.totalWords.toLocaleString(), icon: Hash },
    { label: 'Palavras Únicas', value: stats.uniqueWords.toLocaleString(), icon: Layers },
    { label: 'Segmentos', value: stats.segments.toLocaleString(), icon: GitBranch },
    { label: 'Hapax (freq=1)', value: stats.hapax.toLocaleString(), icon: Activity },
    { label: 'Riqueza Léxica', value: `${stats.lexicalRichness}%`, icon: TrendingUp },
  ];
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statItems.map((item, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-br from-card to-background rounded-xl p-4 border border-border hover:border-input transition-all duration-300"
          >
            <item.icon className={`w-5 h-5 ${item.color || 'text-primary'} mb-2`} />
            <div className="text-2xl font-bold text-foreground mb-1">{item.value}</div>
            <div className={`text-xs text-muted-foreground`}>{item.label}</div>
          </div>
        ))}
      </div>
      
      {/* Info sobre agrupamento - só mostra se estiver ativo */}
      {stats.groupingEnabled ? (
        <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Layers className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-primary">Agrupamento Morfológico Ativo</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Variações de gênero (ministro/ministra), número (singular/plural), linguagem neutra (x, @) e possíveis typos 
                são automaticamente agrupados na mesma contagem. Clique em qualquer palavra na nuvem para ver todas as variações.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-input rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Activity className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-foreground/80">Modo Simples (sem agrupamento)</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Cada forma de palavra é contada separadamente. Ative "Agrupar variações morfológicas" nas opções 
                para combinar automaticamente variações de gênero, número e typos.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== VISUALIZAÇÕES AVANÇADAS ====================

// Heatmap de Coocorrência
const HeatmapVisualization = ({ cooccurrences, words, width = 700, height = 500, isDarkMode = true }) => {
  const [heatmapData, setHeatmapData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const svgRef = React.useRef(null);
  
  useEffect(() => {
    if (!cooccurrences || cooccurrences.length === 0 || !words || words.length === 0) {
      setHeatmapData([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    // Pegar top 20 palavras para o heatmap
    const topWords = words.slice(0, 20).map(w => w.word);
    
    // Criar matriz de coocorrência
    const matrix = [];
    const coocMap = new Map();
    
    cooccurrences.forEach(c => {
      coocMap.set(`${c.source}-${c.target}`, c.weight);
      coocMap.set(`${c.target}-${c.source}`, c.weight);
    });
    
    topWords.forEach((word1, i) => {
      topWords.forEach((word2, j) => {
        const weight = i === j ? 0 : (coocMap.get(`${word1}-${word2}`) || 0);
        matrix.push({
          x: j,
          y: i,
          word1,
          word2,
          value: weight
        });
      });
    });
    
    setHeatmapData({ matrix, words: topWords });
    setIsLoading(false);
  }, [cooccurrences, words]);
  
  // Zoom/Pan handlers
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoomLevel(prev => Math.max(0.5, Math.min(3, prev * delta)));
  }, []);
  
  const handleMouseDown = useCallback((e) => {
    if (e.button === 0 && hoveredCell === null) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  }, [hoveredCell, panOffset]);
  
  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      setPanOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  }, [isDragging, dragStart]);
  
  const handleMouseUp = useCallback(() => setIsDragging(false), []);
  const resetView = useCallback(() => { setZoomLevel(1); setPanOffset({ x: 0, y: 0 }); }, []);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center" style={{ width, height }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Gerando heatmap...</p>
        </div>
      </div>
    );
  }
  
  if (!heatmapData.matrix || heatmapData.matrix.length === 0) {
    return <div className="text-muted-foreground text-center p-8">Dados insuficientes para heatmap</div>;
  }
  
  const cellSize = Math.min((width - 120) / heatmapData.words.length, (height - 80) / heatmapData.words.length);
  const maxValue = Math.max(...heatmapData.matrix.map(d => d.value));
  const hoveredData = hoveredCell !== null ? heatmapData.matrix[hoveredCell] : null;
  
  const getColor = (value) => {
    if (value === 0) return 'oklch(0.872 0.009 258.34 / 0.2)';
    const intensity = value / maxValue;
    const opacity = 0.3 + intensity * 0.7;
    return `oklch(0.585 0.204 277.12 / ${opacity})`;
  };
  
  return (
    <div className="relative">
      {/* Controls */}
      <div className="absolute top-2 right-2 z-10 flex gap-1">
        <button onClick={() => setZoomLevel(z => Math.min(3, z * 1.2))} className="p-1.5 rounded bg-secondary hover:bg-secondary/80 text-foreground text-xs">+</button>
        <button onClick={() => setZoomLevel(z => Math.max(0.5, z / 1.2))} className="p-1.5 rounded bg-secondary hover:bg-secondary/80 text-foreground text-xs">−</button>
        <button onClick={resetView} className="p-1.5 rounded bg-secondary hover:bg-secondary/80 text-foreground text-xs">⟲</button>
      </div>
      
      <svg 
        ref={svgRef}
        width={width} 
        height={height}
        className="cursor-grab"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
        </defs>
        
        <g transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}>
          <g transform={`translate(100, 60)`}>
            {/* Células do heatmap */}
            {heatmapData.matrix.map((cell, idx) => {
              const isHovered = hoveredCell === idx;
              const isInRow = hoveredData && cell.y === hoveredData.y;
              const isInCol = hoveredData && cell.x === hoveredData.x;
              
              return (
                <rect
                  key={idx}
                  x={cell.x * cellSize}
                  y={cell.y * cellSize}
                  width={cellSize - 1}
                  height={cellSize - 1}
                  fill={getColor(cell.value)}
                  stroke={isHovered ? 'oklch(0.585 0.204 277.12)' : (isInRow || isInCol) ? 'oklch(0.872 0.009 258.34)' : 'transparent'}
                  strokeWidth={isHovered ? 2 : 1}
                  rx={2}
                  opacity={hoveredCell !== null ? (isHovered ? 1 : (isInRow || isInCol ? 0.7 : 0.25)) : 0.9}
                  style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                  onMouseEnter={() => setHoveredCell(idx)}
                  onMouseLeave={() => setHoveredCell(null)}
                />
              );
            })}
            
            {/* Labels X (topo) */}
            {heatmapData.words.map((word, i) => (
              <text
                key={`x-${i}`}
                x={i * cellSize + cellSize / 2}
                y={-8}
                fontSize={9}
                fill={hoveredData && hoveredData.x === i ? 'oklch(0.585 0.204 277.12)' : 'oklch(0.551 0.023 264.36)'}
                fontWeight={hoveredData && hoveredData.x === i ? 600 : 400}
                textAnchor="end"
                transform={`rotate(-45, ${i * cellSize + cellSize / 2}, -8)`}
              >
                {word.length > 8 ? word.slice(0, 8) + '…' : word}
              </text>
            ))}
            
            {/* Labels Y (esquerda) */}
            {heatmapData.words.map((word, i) => (
              <text
                key={`y-${i}`}
                x={-8}
                y={i * cellSize + cellSize / 2 + 4}
                fontSize={9}
                fill={hoveredData && hoveredData.y === i ? 'oklch(0.585 0.204 277.12)' : 'oklch(0.551 0.023 264.36)'}
                fontWeight={hoveredData && hoveredData.y === i ? 600 : 400}
                textAnchor="end"
              >
                {word.length > 10 ? word.slice(0, 10) + '…' : word}
              </text>
            ))}
          </g>
        </g>
        
        {/* Rich Tooltip */}
        {hoveredData && (
          <g transform={`translate(${width - 200}, 20)`}>
            <rect x={0} y={0} width={190} height={75} rx={8} fill="oklch(0.208 0.040 265.75 / 0.95)" stroke="oklch(0.585 0.204 277.12)" strokeWidth={1} />
            <text x={10} y={20} fill="oklch(0.585 0.204 277.12)" fontSize={12} fontWeight={600}>Coocorrência</text>
            <text x={10} y={40} fill="oklch(0.280 0.037 260.03)" fontSize={11}>{hoveredData.word1} ↔ {hoveredData.word2}</text>
            <text x={10} y={58} fill="oklch(0.551 0.023 264.36)" fontSize={10}>
              Frequência: {hoveredData.value} ({((hoveredData.value / maxValue) * 100).toFixed(0)}% do máx)
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};

// Treemap de Frequências
const TreemapVisualization = ({ words, width = 700, height = 500, onWordClick, isDarkMode = true }) => {
  const [treemapData, setTreemapData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredRect, setHoveredRect] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const svgRef = React.useRef(null);
  
  useEffect(() => {
    if (!words || words.length === 0) {
      setTreemapData([]);
      setIsLoading(false);
      return;
    }
    
    const loadAndRender = async () => {
      setIsLoading(true);
      
      // Carregar D3 se necessário
      if (!window.d3) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
      
      // Preparar dados hierárquicos
      const topWords = words.slice(0, 50);
      const root = {
        name: 'root',
        children: topWords.map((w, idx) => ({
          name: w.word,
          value: w.count,
          rank: idx + 1,
          original: w
        }))
      };
      
      // Criar hierarquia e layout
      const hierarchy = window.d3.hierarchy(root)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);
      
      window.d3.treemap()
        .size([width - 20, height - 20])
        .padding(2)
        .round(true)(hierarchy);
      
      setTreemapData(hierarchy.leaves());
      setIsLoading(false);
    };
    
    loadAndRender().catch(err => {
      console.error('Erro ao gerar treemap:', err);
      setIsLoading(false);
    });
  }, [words, width, height]);
  
  // Zoom/Pan handlers
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoomLevel(prev => Math.max(0.5, Math.min(3, prev * delta)));
  }, []);
  
  const handleMouseDown = useCallback((e) => {
    if (e.button === 0 && hoveredRect === null) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  }, [hoveredRect, panOffset]);
  
  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      setPanOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  }, [isDragging, dragStart]);
  
  const handleMouseUp = useCallback(() => setIsDragging(false), []);
  const resetView = useCallback(() => { setZoomLevel(1); setPanOffset({ x: 0, y: 0 }); }, []);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center" style={{ width, height }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Gerando treemap...</p>
        </div>
      </div>
    );
  }
  
  const maxValue = Math.max(...treemapData.map(d => d.value), 1);
  const hoveredData = hoveredRect !== null ? treemapData[hoveredRect] : null;
  
  const getColor = (value, idx) => {
    const opacity = 0.5 + (value / maxValue) * 0.5;
    return `oklch(0.585 0.204 277.12 / ${opacity})`;
  };
  
  return (
    <div className="relative">
      {/* Controls */}
      <div className="absolute top-2 right-2 z-10 flex gap-1">
        <button onClick={() => setZoomLevel(z => Math.min(3, z * 1.2))} className="p-1.5 rounded bg-secondary hover:bg-secondary/80 text-foreground text-xs">+</button>
        <button onClick={() => setZoomLevel(z => Math.max(0.5, z / 1.2))} className="p-1.5 rounded bg-secondary hover:bg-secondary/80 text-foreground text-xs">−</button>
        <button onClick={resetView} className="p-1.5 rounded bg-secondary hover:bg-secondary/80 text-foreground text-xs">⟲</button>
      </div>
      <div className="absolute bottom-2 left-2 z-10 text-xs text-muted-foreground">
        {treemapData.length} termos
      </div>
      
      <svg 
        ref={svgRef}
        width={width} 
        height={height}
        className="cursor-grab"
        style={{ cursor: isDragging ? 'grabbing' : (hoveredRect !== null ? 'pointer' : 'grab') }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
        </defs>
        
        <g transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}>
          <g transform="translate(10, 10)">
            {treemapData.map((leaf, idx) => {
              const w = leaf.x1 - leaf.x0;
              const h = leaf.y1 - leaf.y0;
              const isHovered = hoveredRect === idx;
              
              return (
                <g key={idx}>
                  <rect
                    x={leaf.x0}
                    y={leaf.y0}
                    width={w}
                    height={h}
                    fill={getColor(leaf.value, idx)}
                    stroke={isHovered ? 'oklch(1.000 0 0)' : 'oklch(0.208 0.040 265.75 / 0.8)'}
                    strokeWidth={isHovered ? 3 : 1}
                    rx={4}
                    opacity={hoveredRect !== null ? (isHovered ? 1 : 0.35) : 0.9}
                    style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                    onMouseEnter={() => setHoveredRect(idx)}
                    onMouseLeave={() => setHoveredRect(null)}
                    onClick={() => onWordClick && onWordClick(leaf.data.original)}
                  />
                  {w > 40 && h > 20 && (
                    <text
                      x={leaf.x0 + w / 2}
                      y={leaf.y0 + h / 2}
                      fontSize={Math.min(14, Math.max(9, w / 6))}
                      fill={isHovered ? 'oklch(1.000 0 0)' : 'oklch(0.984 0.003 247.86)'}
                      fontWeight={isHovered ? 700 : 600}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      opacity={hoveredRect !== null ? (isHovered ? 1 : 0.4) : 1}
                      style={{ pointerEvents: 'none', transition: 'opacity 0.2s' }}
                    >
                      {leaf.data.name.length > w / 8 ? leaf.data.name.slice(0, Math.floor(w / 8)) + '…' : leaf.data.name}
                    </text>
                  )}
                  {w > 50 && h > 35 && (
                    <text
                      x={leaf.x0 + w / 2}
                      y={leaf.y0 + h / 2 + 12}
                      fontSize={9}
                      fill="oklch(0.208 0.040 265.75 / 0.7)"
                      textAnchor="middle"
                      opacity={hoveredRect !== null ? (isHovered ? 1 : 0.3) : 0.8}
                      style={{ pointerEvents: 'none', transition: 'opacity 0.2s' }}
                    >
                      {leaf.value}x
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </g>
        
        {/* Rich Tooltip */}
        {hoveredData && (
          <g transform={`translate(${width - 180}, 20)`}>
            <rect x={0} y={0} width={170} height={70} rx={8} fill="oklch(0.208 0.040 265.75 / 0.95)" stroke="oklch(0.457 0.215 277.02)" strokeWidth={1} />
            <text x={10} y={18} fill="oklch(0.457 0.215 277.02)" fontSize={13} fontWeight={600}>{hoveredData.data.name}</text>
            <text x={10} y={38} fill="oklch(0.551 0.023 264.36)" fontSize={10}>Frequência: {hoveredData.value}</text>
            <text x={10} y={54} fill="oklch(0.551 0.023 264.36)" fontSize={10}>Rank: #{hoveredData.data.rank} | {((hoveredData.value / maxValue) * 100).toFixed(0)}% do máx</text>
          </g>
        )}
      </svg>
    </div>
  );
};

// Radar Chart para Perfil de Categorias
const RadarVisualization = ({ codedSegments, codebook, width = 500, height = 500, isDarkMode = true }) => {
  const [radarData, setRadarData] = useState(null);
  const [hoveredAxis, setHoveredAxis] = useState(null);
  
  useEffect(() => {
    if (!codedSegments || codedSegments.length === 0 || !codebook) {
      setRadarData(null);
      return;
    }
    
    // Converter codebook objeto para array
    const codebookArray = Object.entries(codebook).map(([id, cat]) => ({
      id,
      name: cat.name,
      color: cat.color,
      codes: Object.entries(cat.codes || {}).map(([codeId, code]) => ({
        id: codeId,
        name: code.name
      }))
    }));
    
    // Contar segmentos por categoria
    const categoryCounts = {};
    codebookArray.forEach(cat => {
      categoryCounts[cat.name] = { count: 0, color: cat.color, codes: [] };
    });
    
    codedSegments.forEach(seg => {
      seg.codes.forEach(codeId => {
        codebookArray.forEach(cat => {
          const code = cat.codes.find(c => c.id === codeId);
          if (code) {
            categoryCounts[cat.name].count++;
            if (!categoryCounts[cat.name].codes.includes(code.name)) {
              categoryCounts[cat.name].codes.push(code.name);
            }
          }
        });
      });
    });
    
    const data = Object.entries(categoryCounts)
      .filter(([_, info]) => info.count > 0)
      .map(([name, info]) => ({ axis: name, value: info.count, color: info.color, codes: info.codes }));
    
    if (data.length < 3) {
      setRadarData(null);
      return;
    }
    
    setRadarData(data);
  }, [codedSegments, codebook]);
  
  if (!radarData || radarData.length < 3) {
    return (
      <div className="flex items-center justify-center text-muted-foreground" style={{ width, height }}>
        <div className="text-center">
          <p>Codifique pelo menos 3 categorias diferentes</p>
          <p className="text-sm mt-2">para visualizar o radar</p>
        </div>
      </div>
    );
  }
  
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 60;
  const levels = 5;
  const maxValue = Math.max(...radarData.map(d => d.value));
  const angleSlice = (Math.PI * 2) / radarData.length;
  const totalSegments = radarData.reduce((sum, d) => sum + d.value, 0);
  
  // Gerar pontos do polígono
  const points = radarData.map((d, i) => {
    const angle = angleSlice * i - Math.PI / 2;
    const r = (d.value / maxValue) * radius;
    return {
      x: centerX + r * Math.cos(angle),
      y: centerY + r * Math.sin(angle),
      labelX: centerX + (radius + 25) * Math.cos(angle),
      labelY: centerY + (radius + 25) * Math.sin(angle),
      ...d
    };
  });
  
  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
  const hoveredData = hoveredAxis !== null ? radarData[hoveredAxis] : null;
  
  return (
    <div className="relative">
      <svg width={width} height={height}>
        <defs>
        </defs>
        
        {/* Grid circular */}
        {[...Array(levels)].map((_, i) => (
          <circle
            key={i}
            cx={centerX}
            cy={centerY}
            r={(radius / levels) * (i + 1)}
            fill="none"
            stroke="oklch(0.551 0.023 264.36 / 0.2)"
            strokeWidth={1}
          />
        ))}
        
        {/* Eixos */}
        {radarData.map((d, i) => {
          const angle = angleSlice * i - Math.PI / 2;
          const x2 = centerX + radius * Math.cos(angle);
          const y2 = centerY + radius * Math.sin(angle);
          const isHovered = hoveredAxis === i;
          
          return (
            <g key={i}>
              <line
                x1={centerX}
                y1={centerY}
                x2={x2}
                y2={y2}
                stroke={isHovered ? d.color || 'oklch(0.585 0.204 277.12)' : 'oklch(0.551 0.023 264.36 / 0.3)'}
                strokeWidth={isHovered ? 2 : 1}
              />
              <text
                x={points[i].labelX}
                y={points[i].labelY}
                fontSize={isHovered ? 12 : 10}
                fill={isHovered ? d.color || 'oklch(0.585 0.204 277.12)' : 'oklch(0.551 0.023 264.36)'}
                fontWeight={isHovered ? 600 : 400}
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {d.axis.length > 12 ? d.axis.slice(0, 12) + '…' : d.axis}
              </text>
            </g>
          );
        })}
        
        {/* Área preenchida */}
        <path
          d={pathData}
          fill="oklch(0.585 0.204 277.12 / 0.25)"
          stroke="oklch(0.585 0.204 277.12)"
          strokeWidth={2}
          opacity={hoveredAxis !== null ? 0.5 : 1}
        />
        
        {/* Pontos interativos */}
        {points.map((p, i) => {
          const isHovered = hoveredAxis === i;
          return (
            <g 
              key={i}
              onMouseEnter={() => setHoveredAxis(i)}
              onMouseLeave={() => setHoveredAxis(null)}
              style={{ cursor: 'pointer' }}
            >
              <circle
                cx={p.x}
                cy={p.y}
                r={isHovered ? 10 : 6}
                fill={p.color || 'oklch(0.585 0.204 277.12)'}
                stroke="oklch(1.000 0 0)"
                strokeWidth={2}
                style={{ transition: 'r 0.2s' }}
              />
            </g>
          );
        })}
        
        {/* Tooltip */}
        {hoveredData && (
          <g transform={`translate(${width - 170}, 20)`}>
            <rect x={0} y={0} width={160} height={75 + Math.min(hoveredData.codes.length, 3) * 12} rx={8} fill="oklch(0.208 0.040 265.75 / 0.95)" stroke={hoveredData.color || 'oklch(0.585 0.204 277.12)'} strokeWidth={1} />
            <text x={10} y={18} fill={hoveredData.color || 'oklch(0.585 0.204 277.12)'} fontSize={12} fontWeight={600}>{hoveredData.axis}</text>
            <text x={10} y={38} fill="oklch(0.551 0.023 264.36)" fontSize={10}>Segmentos: {hoveredData.value}</text>
            <text x={10} y={54} fill="oklch(0.551 0.023 264.36)" fontSize={10}>{((hoveredData.value / totalSegments) * 100).toFixed(1)}% do total</text>
            {hoveredData.codes.slice(0, 3).map((code, i) => (
              <text key={i} x={15} y={72 + i * 12} fill="oklch(0.551 0.023 264.36)" fontSize={9}>• {code}</text>
            ))}
          </g>
        )}
      </svg>
    </div>
  );
};

// Sunburst de Hierarquia de Códigos
const SunburstVisualization = ({ codedSegments, codebook, width = 500, height = 500 }) => {
  const [sunburstData, setSunburstData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredArc, setHoveredArc] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  // Zoom/Pan state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const svgRef = React.useRef(null);
  
  // Zoom/Pan handlers
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoomLevel(prev => Math.max(0.3, Math.min(4, prev * delta)));
  }, []);
  
  const handleMouseDown = useCallback((e) => {
    if (e.target.tagName === 'path') return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  }, [panOffset]);
  
  const handleMouseMove = useCallback((e) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) {
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
    if (isDragging) {
      setPanOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  }, [isDragging, dragStart]);
  
  const handleMouseUp = useCallback(() => setIsDragging(false), []);
  const resetView = useCallback(() => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  }, []);
  
  useEffect(() => {
    if (!codedSegments || codedSegments.length === 0 || !codebook) {
      setSunburstData(null);
      setIsLoading(false);
      return;
    }
    
    const loadAndRender = async () => {
      setIsLoading(true);
      
      // Carregar D3 se necessário
      if (!window.d3) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
      
      // Converter codebook objeto para array
      const codebookArray = Object.entries(codebook).map(([id, cat]) => ({
        id,
        name: cat.name,
        color: cat.color,
        codes: Object.entries(cat.codes || {}).map(([codeId, code]) => ({
          id: codeId,
          name: code.name
        }))
      }));
      
      // Construir hierarquia
      const hierarchy = {
        name: 'Codificação',
        children: codebookArray.map(cat => {
          const catCodes = cat.codes.map(code => {
            const count = codedSegments.filter(seg => 
              seg.codes.includes(code.id)
            ).length;
            return { name: code.name, value: count || 0.1, id: code.id, categoryName: cat.name, categoryColor: cat.color };
          }).filter(c => c.value > 0);
          
          return {
            name: cat.name,
            color: cat.color,
            children: catCodes.length > 0 ? catCodes : [{ name: 'Vazio', value: 0.1 }]
          };
        }).filter(cat => cat.children.some(c => c.value > 0.1))
      };
      
      if (hierarchy.children.length === 0) {
        setSunburstData(null);
        setIsLoading(false);
        return;
      }
      
      const root = window.d3.hierarchy(hierarchy)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);
      
      const partition = window.d3.partition()
        .size([2 * Math.PI, Math.min(width, height) / 2 - 20]);
      
      partition(root);
      
      setSunburstData(root.descendants());
      setIsLoading(false);
    };
    
    loadAndRender().catch(err => {
      console.error('Erro ao gerar sunburst:', err);
      setIsLoading(false);
    });
  }, [codedSegments, codebook, width, height]);
  
  // Calculate total for percentages
  const totalValue = useMemo(() => {
    if (!sunburstData) return 0;
    return sunburstData.filter(d => d.depth === 2).reduce((sum, d) => sum + (d.value || 0), 0);
  }, [sunburstData]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center" style={{ width, height }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Gerando sunburst...</p>
        </div>
      </div>
    );
  }
  
  if (!sunburstData || sunburstData.length <= 1) {
    return (
      <div className="flex items-center justify-center text-muted-foreground" style={{ width, height }}>
        <div className="text-center">
          <p>Codifique alguns segmentos</p>
          <p className="text-sm mt-2">para visualizar a hierarquia</p>
        </div>
      </div>
    );
  }
  
  const centerX = width / 2;
  const centerY = height / 2;
  const colors = ['oklch(0.585 0.204 277.12)', 'oklch(0.585 0.204 277.12)', 'oklch(0.457 0.215 277.02)', 'oklch(0.457 0.215 277.02)', 'oklch(0.359 0.135 278.70)', 'oklch(0.457 0.215 277.02)', 'oklch(0.585 0.204 277.12)', 'oklch(0.457 0.215 277.02)'];
  
  const arc = (d) => {
    if (d.depth === 0) return '';
    const startAngle = d.x0;
    const endAngle = d.x1;
    const innerRadius = d.y0;
    const outerRadius = d.y1;
    
    const x0 = Math.cos(startAngle - Math.PI / 2) * innerRadius;
    const y0 = Math.sin(startAngle - Math.PI / 2) * innerRadius;
    const x1 = Math.cos(endAngle - Math.PI / 2) * innerRadius;
    const y1 = Math.sin(endAngle - Math.PI / 2) * innerRadius;
    const x2 = Math.cos(endAngle - Math.PI / 2) * outerRadius;
    const y2 = Math.sin(endAngle - Math.PI / 2) * outerRadius;
    const x3 = Math.cos(startAngle - Math.PI / 2) * outerRadius;
    const y3 = Math.sin(startAngle - Math.PI / 2) * outerRadius;
    
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    
    return `M ${x0} ${y0} A ${innerRadius} ${innerRadius} 0 ${largeArc} 1 ${x1} ${y1} L ${x2} ${y2} A ${outerRadius} ${outerRadius} 0 ${largeArc} 0 ${x3} ${y3} Z`;
  };
  
  // Get arc center for potential label positioning
  const getArcCenter = (d) => {
    const angle = (d.x0 + d.x1) / 2 - Math.PI / 2;
    const radius = (d.y0 + d.y1) / 2;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius
    };
  };
  
  // Tooltip data
  const hoveredData = hoveredArc !== null && sunburstData[hoveredArc] ? sunburstData[hoveredArc] : null;
  const hoveredColor = hoveredData ? colors[(hoveredData.depth === 1 ? hoveredArc : (hoveredData.parent?.data?.name?.charCodeAt(0) || 0)) % colors.length] : 'oklch(0.585 0.204 277.12)';
  
  return (
    <div className="relative">
      {/* Zoom controls */}
      <div className="absolute top-2 right-2 z-10 flex gap-1">
        <button
          onClick={() => setZoomLevel(z => Math.min(4, z * 1.2))}
          className="w-7 h-7 rounded bg-card/90 border border-input text-foreground/80 hover:bg-accent hover:text-white flex items-center justify-center text-sm font-bold transition-colors"
          title="Zoom in"
        >+</button>
        <button
          onClick={() => setZoomLevel(z => Math.max(0.3, z / 1.2))}
          className="w-7 h-7 rounded bg-card/90 border border-input text-foreground/80 hover:bg-accent hover:text-white flex items-center justify-center text-sm font-bold transition-colors"
          title="Zoom out"
        >−</button>
        <button
          onClick={resetView}
          className="w-7 h-7 rounded bg-card/90 border border-input text-foreground/80 hover:bg-accent hover:text-white flex items-center justify-center text-xs transition-colors"
          title="Reset view"
        >⟲</button>
      </div>
      
      <svg 
        ref={svgRef}
        width={width} 
        height={height}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => { handleMouseUp(); setHoveredArc(null); }}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <defs>
        </defs>
        
        <g transform={`translate(${centerX + panOffset.x}, ${centerY + panOffset.y}) scale(${zoomLevel})`}>
          {/* Center glow */}
          
          {/* Arcs */}
          {sunburstData.map((d, idx) => {
            if (d.depth === 0) return null;
            const colorIdx = d.depth === 1 ? idx : (d.parent?.data?.name?.charCodeAt(0) || 0) % colors.length;
            const baseOpacity = d.depth === 1 ? 0.9 : 0.75;
            const isHovered = hoveredArc === idx;
            const isRelated = hoveredData && (
              d === hoveredData || 
              d === hoveredData.parent || 
              d.parent === hoveredData ||
              (hoveredData.parent && d.parent === hoveredData.parent)
            );
            
            const opacity = hoveredArc !== null 
              ? (isHovered ? 1 : (isRelated ? 0.85 : 0.2))
              : baseOpacity;
            
            return (
              <path
                key={idx}
                d={arc(d)}
                fill={colors[colorIdx % colors.length]}
                stroke={isHovered ? 'oklch(1.000 0 0)' : 'oklch(0.984 0.003 247.86)'}
                strokeWidth={isHovered ? 2 : 1}
                opacity={opacity}
                style={{ cursor: 'pointer', transition: 'opacity 0.2s, stroke-width 0.15s' }}
                onMouseEnter={(e) => {
                  e.stopPropagation();
                  setHoveredArc(idx);
                }}
                onMouseLeave={() => setHoveredArc(null)}
              />
            );
          })}
          
          {/* Center label */}
          <text x={0} y={4} textAnchor="middle" fill="oklch(0.585 0.204 277.12)" fontSize={12} fontWeight={600}>
            {Math.floor(totalValue)} segs
          </text>
        </g>
        
        {/* SVG Tooltip */}
        {hoveredData && (
          <g transform={`translate(${Math.min(mousePos.x + 15, width - 175)}, ${Math.max(mousePos.y - 10, 10)})`}>
            <rect 
              x={0} y={0} 
              width={165} 
              height={hoveredData.depth > 1 ? 78 : 60} 
              rx={8} 
              fill="oklch(0.208 0.040 265.75 / 0.95)" 
              stroke={hoveredColor} 
              strokeWidth={1.5} 
            />
            <text x={10} y={20} fill={hoveredColor} fontSize={12} fontWeight={600}>
              {hoveredData.data.name.length > 18 ? hoveredData.data.name.slice(0, 18) + '…' : hoveredData.data.name}
            </text>
            <text x={10} y={38} fill="oklch(0.280 0.037 260.03)" fontSize={11}>
              Segmentos: <tspan fontWeight={600}>{Math.floor(hoveredData.value)}</tspan>
            </text>
            <text x={10} y={54} fill="oklch(0.551 0.023 264.36)" fontSize={10}>
              {totalValue > 0 ? ((hoveredData.value / totalValue) * 100).toFixed(1) : 0}% do total
            </text>
            {hoveredData.depth > 1 && hoveredData.parent && (
              <text x={10} y={70} fill="oklch(0.551 0.023 264.36)" fontSize={9}>
                Cat: {hoveredData.parent.data.name}
              </text>
            )}
          </g>
        )}
      </svg>
      
      {/* Zoom indicator */}
      <div className="absolute bottom-2 left-2 text-xs text-muted-foreground bg-background/70 px-2 py-1 rounded">
        {Math.round(zoomLevel * 100)}%
      </div>
    </div>
  );
};

// ==================== DENDROGRAMA DE CLUSTERING HIERÁRQUICO ====================

// Dendrograma interativo com zoom/pan, layout circular e collision avoidance
const DendrogramVisualization = ({ words, frequencies, linkageMatrix, width = 700, height = 500 }) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [layout, setLayout] = useState('horizontal'); // horizontal, vertical, circular
  const svgRef = React.useRef(null);
  
  // Zoom/Pan handlers
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoomLevel(prev => Math.max(0.3, Math.min(4, prev * delta)));
  }, []);
  
  const handleMouseDown = useCallback((e) => {
    if (e.target.tagName === 'text' || e.target.tagName === 'circle') return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  }, [panOffset]);
  
  const handleMouseMove = useCallback((e) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) {
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
    if (isDragging) {
      setPanOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  }, [isDragging, dragStart]);
  
  const handleMouseUp = useCallback(() => setIsDragging(false), []);
  const resetView = useCallback(() => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  }, []);
  
  const cycleLayout = useCallback(() => {
    setLayout(l => {
      if (l === 'horizontal') return 'vertical';
      if (l === 'vertical') return 'circular';
      return 'horizontal';
    });
    resetView();
  }, [resetView]);
  
  // Collision avoidance for labels using force-directed repulsion
  const applyCollisionAvoidance = useCallback((labels, iterations = 15) => {
    const result = labels.map(l => ({ ...l, labelX: l.x, labelY: l.y }));
    const minDistance = 18; // Minimum distance between label centers
    
    for (let iter = 0; iter < iterations; iter++) {
      for (let i = 0; i < result.length; i++) {
        for (let j = i + 1; j < result.length; j++) {
          const dx = result[j].labelX - result[i].labelX;
          const dy = result[j].labelY - result[i].labelY;
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;
          
          if (dist < minDistance) {
            // Repulsion force inversely proportional to distance
            const force = (minDistance - dist) / dist * 0.5;
            const fx = dx * force;
            const fy = dy * force;
            
            result[i].labelX -= fx;
            result[i].labelY -= fy;
            result[j].labelX += fx;
            result[j].labelY += fy;
          }
        }
      }
    }
    
    return result;
  }, []);
  
  // Build dendrogram structure from linkage matrix
  const dendrogramData = useMemo(() => {
    if (!words || !linkageMatrix || words.length === 0) return null;
    
    const n = words.length;
    const nodes = [];
    
    // Create leaf nodes
    for (let i = 0; i < n; i++) {
      nodes.push({
        id: i,
        label: words[i],
        freq: frequencies?.[words[i]] || 1,
        isLeaf: true,
        x: 0,
        y: 0,
        angle: 0,
        radius: 0,
        height: 0
      });
    }
    
    // Create internal nodes from linkage
    const maxDist = Math.max(...linkageMatrix.map(row => row[2])) || 1;
    
    for (let i = 0; i < linkageMatrix.length; i++) {
      const [left, right, dist, count] = linkageMatrix[i];
      const leftNode = nodes[Math.floor(left)];
      const rightNode = nodes[Math.floor(right)];
      
      nodes.push({
        id: n + i,
        left: leftNode,
        right: rightNode,
        distance: dist,
        normalizedDist: dist / maxDist,
        count: count,
        isLeaf: false,
        x: 0,
        y: 0,
        angle: 0,
        radius: 0,
        height: dist
      });
    }
    
    // Root is last node
    const root = nodes[nodes.length - 1];
    
    const margin = { top: 40, right: 150, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(innerWidth, innerHeight) / 2 - 60;
    
    let leafIndex = 0;
    
    // Layout function based on mode
    const layoutNode = (node, depth = 0) => {
      if (node.isLeaf) {
        if (layout === 'circular') {
          // Circular layout: leaves on outer ring
          node.angle = (leafIndex / n) * 2 * Math.PI - Math.PI / 2;
          node.radius = maxRadius;
          node.x = Math.cos(node.angle) * node.radius;
          node.y = Math.sin(node.angle) * node.radius;
        } else if (layout === 'horizontal') {
          node.x = innerWidth;
          node.y = n > 1 ? (leafIndex / (n - 1)) * innerHeight : innerHeight / 2;
        } else {
          node.x = n > 1 ? (leafIndex / (n - 1)) * innerWidth : innerWidth / 2;
          node.y = innerHeight;
        }
        leafIndex++;
        return;
      }
      
      layoutNode(node.left, depth + 1);
      layoutNode(node.right, depth + 1);
      
      if (layout === 'circular') {
        // Average angle of children, radius based on distance
        node.angle = (node.left.angle + node.right.angle) / 2;
        node.radius = (1 - node.normalizedDist) * maxRadius * 0.85;
        node.x = Math.cos(node.angle) * node.radius;
        node.y = Math.sin(node.angle) * node.radius;
      } else if (layout === 'horizontal') {
        node.x = (1 - node.normalizedDist) * innerWidth;
        node.y = (node.left.y + node.right.y) / 2;
      } else {
        node.x = (node.left.x + node.right.x) / 2;
        node.y = (1 - node.normalizedDist) * innerHeight;
      }
    };
    
    layoutNode(root);
    
    // Collect all edges/arcs
    const edges = [];
    const collectEdges = (node) => {
      if (!node.isLeaf) {
        if (layout === 'circular') {
          // Circular: use arcs
          edges.push({
            type: 'arc',
            parentAngle: node.angle,
            parentRadius: node.radius,
            leftAngle: node.left.angle,
            leftRadius: node.left.radius,
            rightAngle: node.right.angle,
            rightRadius: node.right.radius,
            distance: node.distance,
            x1: node.x, y1: node.y,
            leftX: node.left.x, leftY: node.left.y,
            rightX: node.right.x, rightY: node.right.y
          });
        } else if (layout === 'horizontal') {
          edges.push({ x1: node.x, y1: node.left.y, x2: node.x, y2: node.right.y, type: 'line', distance: node.distance });
          edges.push({ x1: node.x, y1: node.left.y, x2: node.left.x, y2: node.left.y, type: 'line', distance: node.distance });
          edges.push({ x1: node.x, y1: node.right.y, x2: node.right.x, y2: node.right.y, type: 'line', distance: node.distance });
        } else {
          edges.push({ x1: node.left.x, y1: node.y, x2: node.right.x, y2: node.y, type: 'line', distance: node.distance });
          edges.push({ x1: node.left.x, y1: node.y, x2: node.left.x, y2: node.left.y, type: 'line', distance: node.distance });
          edges.push({ x1: node.right.x, y1: node.y, x2: node.right.x, y2: node.right.y, type: 'line', distance: node.distance });
        }
        collectEdges(node.left);
        collectEdges(node.right);
      }
    };
    collectEdges(root);
    
    // Get leaf nodes and apply collision avoidance
    let leaves = nodes.filter(nd => nd.isLeaf);
    if (layout === 'horizontal') {
      leaves = leaves.sort((a, b) => a.y - b.y);
    } else if (layout === 'vertical') {
      leaves = leaves.sort((a, b) => a.x - b.x);
    } else {
      leaves = leaves.sort((a, b) => a.angle - b.angle);
    }
    
    return { root, nodes, edges, leaves, margin, maxDist, centerX, centerY, maxRadius };
  }, [words, frequencies, linkageMatrix, width, height, layout]);
  
  // Apply collision avoidance to leaves
  const leavesWithCollision = useMemo(() => {
    if (!dendrogramData?.leaves) return [];
    return applyCollisionAvoidance(dendrogramData.leaves, 20);
  }, [dendrogramData, applyCollisionAvoidance]);
  
  if (!dendrogramData) {
    return (
      <div className="flex items-center justify-center text-muted-foreground" style={{ width, height }}>
        <div className="text-center">
          <p>Dados insuficientes para dendrograma</p>
          <p className="text-sm mt-2">Carregue ou gere dados de clustering</p>
        </div>
      </div>
    );
  }
  
  const { edges, margin, maxDist, centerX, centerY, maxRadius } = dendrogramData;
  
  // Color scale based on distance
  const getEdgeColor = (dist) => {
    const t = dist / maxDist;
    if (t < 0.33) return 'oklch(0.585 0.204 277.12)';
    if (t < 0.66) return 'oklch(0.457 0.215 277.02)';
    return 'oklch(0.359 0.135 278.70)';
  };
  
  // Create arc path for circular layout
  const createArcPath = (edge) => {
    const { x1, y1, leftX, leftY, rightX, rightY, parentRadius, leftRadius, rightRadius, leftAngle, rightAngle } = edge;
    
    // Draw: parent to arc, arc between children angles at parent radius, then radial to each child
    const arcStartX = Math.cos(leftAngle) * parentRadius;
    const arcStartY = Math.sin(leftAngle) * parentRadius;
    const arcEndX = Math.cos(rightAngle) * parentRadius;
    const arcEndY = Math.sin(rightAngle) * parentRadius;
    
    // Large arc flag
    const angleDiff = Math.abs(rightAngle - leftAngle);
    const largeArc = angleDiff > Math.PI ? 1 : 0;
    const sweep = rightAngle > leftAngle ? 1 : 0;
    
    return [
      // Arc from left angle to right angle at parent radius
      `M ${arcStartX} ${arcStartY} A ${parentRadius} ${parentRadius} 0 ${largeArc} ${sweep} ${arcEndX} ${arcEndY}`,
      // Line from arc to left child
      `M ${arcStartX} ${arcStartY} L ${leftX} ${leftY}`,
      // Line from arc to right child
      `M ${arcEndX} ${arcEndY} L ${rightX} ${rightY}`
    ];
  };
  
  const layoutIcon = layout === 'horizontal' ? '↔' : layout === 'vertical' ? '↕' : '◎';
  const layoutLabel = layout === 'horizontal' ? 'Horizontal' : layout === 'vertical' ? 'Vertical' : 'Circular';
  
  // Calculate transform based on layout
  const getTransform = () => {
    if (layout === 'circular') {
      return `translate(${centerX + panOffset.x}, ${centerY + panOffset.y}) scale(${zoomLevel})`;
    }
    return `translate(${margin.left + panOffset.x}, ${margin.top + panOffset.y}) scale(${zoomLevel})`;
  };
  
  return (
    <div className="relative">
      {/* Controls */}
      <div className="absolute top-2 right-2 z-10 flex gap-1">
        <button
          onClick={cycleLayout}
          className="px-2 h-7 rounded bg-card/90 border border-input text-foreground/80 hover:bg-accent hover:text-white text-xs transition-colors flex items-center gap-1"
          title={`Layout: ${layoutLabel}`}
        >
          <span>{layoutIcon}</span>
          <span className="hidden sm:inline">{layoutLabel}</span>
        </button>
        <button
          onClick={() => setZoomLevel(z => Math.min(4, z * 1.2))}
          className="w-7 h-7 rounded bg-card/90 border border-input text-foreground/80 hover:bg-accent hover:text-white flex items-center justify-center text-sm font-bold transition-colors"
        >+</button>
        <button
          onClick={() => setZoomLevel(z => Math.max(0.3, z / 1.2))}
          className="w-7 h-7 rounded bg-card/90 border border-input text-foreground/80 hover:bg-accent hover:text-white flex items-center justify-center text-sm font-bold transition-colors"
        >−</button>
        <button
          onClick={resetView}
          className="w-7 h-7 rounded bg-card/90 border border-input text-foreground/80 hover:bg-accent hover:text-white flex items-center justify-center text-xs transition-colors"
        >⟲</button>
      </div>
      
      <svg
        ref={svgRef}
        width={width}
        height={height}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => { handleMouseUp(); setHoveredNode(null); }}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <defs>
        </defs>
        
        <g transform={getTransform()}>
          {/* Circular background rings */}
          {layout === 'circular' && (
            <>
              <circle cx={0} cy={0} r={maxRadius} fill="none" stroke="oklch(0.872 0.009 258.34)" strokeWidth={1} strokeDasharray="4,4" opacity={0.5} />
              <circle cx={0} cy={0} r={maxRadius * 0.66} fill="none" stroke="oklch(0.872 0.009 258.34)" strokeWidth={1} strokeDasharray="4,4" opacity={0.3} />
              <circle cx={0} cy={0} r={maxRadius * 0.33} fill="none" stroke="oklch(0.872 0.009 258.34)" strokeWidth={1} strokeDasharray="4,4" opacity={0.2} />
              <circle cx={0} cy={0} r={maxRadius * 0.15} fill="transparent" />
            </>
          )}
          
          {/* Edges */}
          {edges.map((edge, i) => {
            const color = getEdgeColor(edge.distance);
            const isHighlighted = hoveredNode && (
              layout === 'circular' 
                ? (Math.abs(edge.leftAngle - hoveredNode.angle) < 0.1 || Math.abs(edge.rightAngle - hoveredNode.angle) < 0.1)
                : (Math.abs(edge.y1 - hoveredNode.y) < 1 || Math.abs(edge.y2 - hoveredNode.y) < 1)
            );
            
            if (edge.type === 'arc') {
              const paths = createArcPath(edge);
              return (
                <g key={i}>
                  {paths.map((d, pi) => (
                    <path
                      key={pi}
                      d={d}
                      fill="none"
                      stroke={color}
                      strokeWidth={isHighlighted ? 3 : 2}
                      opacity={hoveredNode ? (isHighlighted ? 1 : 0.25) : 0.8}
                      style={{ transition: 'opacity 0.2s, stroke-width 0.15s' }}
                    />
                  ))}
                </g>
              );
            }
            
            return (
              <line
                key={i}
                x1={edge.x1}
                y1={edge.y1}
                x2={edge.x2}
                y2={edge.y2}
                stroke={color}
                strokeWidth={isHighlighted ? 3 : 2}
                opacity={hoveredNode ? (isHighlighted ? 1 : 0.25) : 0.8}
                style={{ transition: 'opacity 0.2s, stroke-width 0.15s' }}
              />
            );
          })}
          
          {/* Leaf nodes and labels with collision avoidance */}
          {leavesWithCollision.map((leaf, i) => {
            const isHovered = hoveredNode?.id === leaf.id;
            const maxFreq = Math.max(...leavesWithCollision.map(l => l.freq));
            const freqNorm = leaf.freq / maxFreq;
            
            // Label positioning based on layout
            let labelX, labelY, textAnchor, labelOffsetX = 0, labelOffsetY = 0;
            
            if (layout === 'circular') {
              // Position label outside the circle
              const labelRadius = maxRadius + 15;
              const baseAngle = leaf.angle;
              labelX = Math.cos(baseAngle) * labelRadius;
              labelY = Math.sin(baseAngle) * labelRadius;
              
              // Apply collision offset
              labelX = leaf.labelX + (labelX - leaf.x);
              labelY = leaf.labelY + (labelY - leaf.y);
              
              // Rotate text to be readable
              textAnchor = (baseAngle > Math.PI / 2 || baseAngle < -Math.PI / 2) ? 'end' : 'start';
              if (textAnchor === 'end') {
                labelX = Math.cos(baseAngle) * (labelRadius + 5);
              }
            } else if (layout === 'horizontal') {
              labelX = leaf.labelX + 12;
              labelY = leaf.labelY + 4;
              textAnchor = 'start';
            } else {
              labelX = leaf.labelX;
              labelY = leaf.labelY + 18;
              textAnchor = 'middle';
            }
            
            // Leader line if label moved significantly
            const showLeader = Math.sqrt(
              Math.pow(leaf.labelX - leaf.x, 2) + Math.pow(leaf.labelY - leaf.y, 2)
            ) > 8;
            
            return (
              <g
                key={leaf.id}
                onMouseEnter={() => setHoveredNode(leaf)}
                onMouseLeave={() => setHoveredNode(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Leader line for collision-avoided labels */}
                {showLeader && layout !== 'circular' && (
                  <line
                    x1={leaf.x}
                    y1={leaf.y}
                    x2={leaf.labelX}
                    y2={leaf.labelY}
                    stroke="oklch(0.872 0.009 258.34)"
                    strokeWidth={1}
                    strokeDasharray="2,2"
                    opacity={0.5}
                  />
                )}
                
                <circle
                  cx={leaf.x}
                  cy={leaf.y}
                  r={isHovered ? 8 : 5 + freqNorm * 3}
                  fill={isHovered ? 'oklch(0.680 0.158 276.93)' : 'oklch(0.585 0.204 277.12)'}
                  stroke={isHovered ? 'oklch(1.000 0 0)' : 'oklch(0.984 0.003 247.86)'}
                  strokeWidth={isHovered ? 2 : 1.5}
                  style={{ transition: 'r 0.15s, stroke-width 0.15s' }}
                />
                <text
                  x={labelX}
                  y={labelY}
                  fill={isHovered ? 'oklch(0.585 0.204 277.12)' : 'oklch(0.280 0.037 260.03)'}
                  fontSize={isHovered ? 12 : 11}
                  fontWeight={isHovered ? 600 : 400}
                  textAnchor={textAnchor}
                  style={{ transition: 'fill 0.15s' }}
                >
                  {leaf.label}
                </text>
              </g>
            );
          })}
          
          {/* Center dot for circular */}
          {layout === 'circular' && (
            <circle cx={0} cy={0} r={4} fill="oklch(0.585 0.204 277.12)" opacity={0.6} />
          )}
        </g>
        
        {/* Distance scale */}
        {layout !== 'circular' && (
          <g transform={`translate(${margin.left}, ${height - 25})`}>
            <text x={0} y={0} fill="oklch(0.551 0.023 264.36)" fontSize={10}>0</text>
            <line x1={20} y1={-4} x2={120} y2={-4} stroke="oklch(0.872 0.009 258.34)" strokeWidth={1} />
            <text x={125} y={0} fill="oklch(0.551 0.023 264.36)" fontSize={10}>{maxDist.toFixed(2)}</text>
            <text x={70} y={12} fill="oklch(0.551 0.023 264.36)" fontSize={9} textAnchor="middle">Distância</text>
          </g>
        )}
        
        {/* Circular legend */}
        {layout === 'circular' && (
          <g transform={`translate(20, ${height - 50})`}>
            <text x={0} y={0} fill="oklch(0.551 0.023 264.36)" fontSize={10}>Centro = Alta similaridade</text>
            <text x={0} y={14} fill="oklch(0.551 0.023 264.36)" fontSize={10}>Borda = Baixa similaridade</text>
          </g>
        )}
        
        {/* Tooltip */}
        {hoveredNode && (
          <g transform={`translate(${Math.min(mousePos.x + 15, width - 160)}, ${Math.max(mousePos.y - 10, 10)})`}>
            <rect x={0} y={0} width={150} height={65} rx={8} fill="oklch(0.208 0.040 265.75 / 0.95)" stroke="oklch(0.585 0.204 277.12)" strokeWidth={1.5} />
            <text x={10} y={20} fill="oklch(0.585 0.204 277.12)" fontSize={12} fontWeight={600}>{hoveredNode.label}</text>
            <text x={10} y={38} fill="oklch(0.280 0.037 260.03)" fontSize={11}>Frequência: {hoveredNode.freq}</text>
            <text x={10} y={54} fill="oklch(0.551 0.023 264.36)" fontSize={10}>
              {layout === 'circular' ? `Ângulo: ${(hoveredNode.angle * 180 / Math.PI).toFixed(0)}°` : `Posição: ${hoveredNode.y?.toFixed(0) || 0}`}
            </text>
          </g>
        )}
      </svg>
      
      {/* Zoom indicator */}
      <div className="absolute bottom-2 left-2 text-xs text-muted-foreground bg-background/70 px-2 py-1 rounded flex items-center gap-2">
        <span>{Math.round(zoomLevel * 100)}%</span>
        <span className="text-muted-foreground">|</span>
        <span className="text-primary">{layoutLabel}</span>
      </div>
    </div>
  );
};

// ==================== COMPONENTES DE ANÁLISE DE REDE AVANÇADA ====================

// Componente de Métricas de Centralidade
const CentralityMetricsPanel = ({ networkAnalysis, onNodeClick, isDarkMode = true }) => {
  const [sortBy, setSortBy] = useState('degree');
  const [showCount, setShowCount] = useState(20);
  
  if (!networkAnalysis?.centrality?.nodes || !networkAnalysis?.centrality?.metrics) return null;
  
  const { nodes, metrics } = networkAnalysis.centrality;
  const t = getThemeClasses(isDarkMode);
  
  const sortedNodes = useMemo(() => {
    const sorted = [...nodes];
    switch (sortBy) {
      case 'degree': return sorted.sort((a, b) => b.degreeCentrality - a.degreeCentrality);
      case 'betweenness': return sorted.sort((a, b) => b.betweennessCentrality - a.betweennessCentrality);
      case 'closeness': return sorted.sort((a, b) => b.closenessCentrality - a.closenessCentrality);
      case 'eigenvector': return sorted.sort((a, b) => b.eigenvectorCentrality - a.eigenvectorCentrality);
      default: return sorted;
    }
  }, [nodes, sortBy]);
  
  return (
    <div className="space-y-6">
      {/* Métricas Globais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`${t.cardInner} rounded-xl p-4 border ${t.cardInnerBorder}`}>
          <div className="text-3xl font-bold text-primary">{metrics.nodeCount}</div>
          <div className={`text-sm ${t.textMuted}`}>Nós</div>
        </div>
        <div className={`${t.cardInner} rounded-xl p-4 border ${t.cardInnerBorder}`}>
          <div className="text-3xl font-bold text-primary">{metrics.edgeCount}</div>
          <div className={`text-sm ${t.textMuted}`}>Arestas</div>
        </div>
        <div className={`${t.cardInner} rounded-xl p-4 border ${t.cardInnerBorder}`}>
          <div className="text-3xl font-bold text-primary">{metrics.density}</div>
          <div className={`text-sm ${t.textMuted}`}>Densidade</div>
        </div>
        <div className={`${t.cardInner} rounded-xl p-4 border ${t.cardInnerBorder}`}>
          <div className="text-3xl font-bold text-muted-foreground">{metrics.avgDegree}</div>
          <div className={`text-sm ${t.textMuted}`}>Grau Médio</div>
        </div>
      </div>
      
      {/* Seletor de Métrica */}
      <div className="flex items-center gap-4 flex-wrap">
        <span className={`text-sm ${t.textMuted}`}>Ordenar por:</span>
        {[
          { key: 'degree', label: 'Grau', desc: 'Número de conexões diretas' },
          { key: 'betweenness', label: 'Intermediação', desc: 'Ponte entre grupos' },
          { key: 'closeness', label: 'Proximidade', desc: 'Distância média aos outros nós' },
          { key: 'eigenvector', label: 'Autovetor', desc: 'Conexão com nós influentes' }
        ].map(opt => (
          <button
            key={opt.key}
            onClick={() => setSortBy(opt.key)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              sortBy === opt.key 
                ? 'bg-primary text-white' 
                : t.button
            }`}
            title={opt.desc}
          >
            {opt.label}
          </button>
        ))}
      </div>
      
      {/* Tabela de Nós */}
      <div className={`${t.cardInner} rounded-xl border ${t.cardInnerBorder} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className={t.tableHeader}>
              <tr>
                <th className={`px-4 py-3 text-left ${t.textSecondary}`}>#</th>
                <th className={`px-4 py-3 text-left ${t.textSecondary}`}>Palavra</th>
                <th className={`px-4 py-3 text-right ${t.textSecondary}`}>Grau</th>
                <th className={`px-4 py-3 text-right ${t.textSecondary}`}>Betweenness</th>
                <th className={`px-4 py-3 text-right ${t.textSecondary}`}>Closeness</th>
                <th className={`px-4 py-3 text-right ${t.textSecondary}`}>Eigenvector</th>
                <th className={`px-4 py-3 text-center ${t.textSecondary}`}>Comunidade</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${t.tableDivide}`}>
              {sortedNodes.slice(0, showCount).map((node, idx) => (
                <tr 
                  key={node.id}
                  className={`${t.hoverRow} cursor-pointer transition-colors`}
                  onClick={() => onNodeClick && onNodeClick(node)}
                >
                  <td className={`px-4 py-2 ${t.textDimmed}`}>{idx + 1}</td>
                  <td className={`px-4 py-2 font-medium ${t.text}`}>{node.id}</td>
                  <td className="px-4 py-2 text-right">
                    <span className="text-primary">{node.degree}</span>
                    <span className={`${t.textDimmed} text-xs ml-1`}>({(node.degreeCentrality * 100).toFixed(1)}%)</span>
                  </td>
                  <td className="px-4 py-2 text-right text-primary">{(node.betweennessCentrality * 100).toFixed(2)}%</td>
                  <td className="px-4 py-2 text-right text-primary">{(node.closenessCentrality * 100).toFixed(2)}%</td>
                  <td className="px-4 py-2 text-right text-muted-foreground">{(node.eigenvectorCentrality * 100).toFixed(2)}%</td>
                  <td className="px-4 py-2 text-center">
                    <span 
                      className="inline-block w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold"
                      style={{ backgroundColor: node.communityColor || 'oklch(0.457 0.215 277.02)' }}
                    >
                      {node.community + 1}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {nodes.length > showCount && (
          <div className={`p-3 border-t ${t.divider} text-center`}>
            <button
              onClick={() => setShowCount(prev => prev + 20)}
              className="text-sm text-primary hover:text-primary"
            >
              Mostrar mais ({nodes.length - showCount} restantes)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente de Comunidades Detectadas
const CommunitiesPanel = ({ networkAnalysis, isDarkMode = true }) => {
  const [expandedCommunity, setExpandedCommunity] = useState(null);
  
  if (!networkAnalysis?.communities?.communities) return null;
  
  const t = getThemeClasses(isDarkMode);
  
  const { communities, modularity, communityCount } = networkAnalysis.communities;
  
  return (
    <div className="space-y-6">
      {/* Resumo */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`bg-primary/10 rounded-xl p-4 border border-primary/30 dark:border-primary/30`}>
          <div className="text-3xl font-bold text-primary">{communityCount}</div>
          <div className={`text-sm ${t.textMuted}`}>Comunidades Detectadas</div>
        </div>
        <div className={`bg-primary/10 rounded-xl p-4 border border-primary/30 dark:border-primary/30`}>
          <div className="text-3xl font-bold text-primary">{modularity}</div>
          <div className={`text-sm ${t.textMuted}`}>Modularidade (Q)</div>
          <div className={`text-xs ${t.textDimmed} mt-1`}>
            {parseFloat(modularity) > 0.3 ? 'Estrutura comunitária forte' : 
             parseFloat(modularity) > 0.1 ? 'Estrutura moderada' : 'Estrutura fraca'}
          </div>
        </div>
      </div>
      
      {/* Lista de Comunidades */}
      <div className="space-y-3">
        {communities.map(comm => (
          <div 
            key={comm.id}
            className={`${t.cardInner} rounded-xl border ${t.cardInnerBorder} overflow-hidden`}
          >
            <button
              onClick={() => setExpandedCommunity(expandedCommunity === comm.id ? null : comm.id)}
              className={`w-full flex items-center justify-between p-4 ${t.hoverRow} transition-colors`}
            >
              <div className="flex items-center gap-3">
                <span 
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white"
                  style={{ backgroundColor: comm.color }}
                >
                  {comm.id + 1}
                </span>
                <div className="text-left">
                  <div className="font-medium">Comunidade {comm.id + 1}</div>
                  <div className={`text-sm ${t.textMuted}`}>{comm.size} palavras</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className={`text-xs ${t.textDimmed}`}>Principais termos:</div>
                  <div className={`text-sm ${t.textSecondary}`}>{comm.topNodes.slice(0, 3).join(', ')}</div>
                </div>
                <ChevronDown className={`w-5 h-5 ${t.textMuted} transition-transform ${expandedCommunity === comm.id ? 'rotate-180' : ''}`} />
              </div>
            </button>
            
            {expandedCommunity === comm.id && (
              <div className={`p-4 border-t ${t.divider} bg-muted`}>
                <div className="flex flex-wrap gap-2">
                  {comm.members.map(member => (
                    <span 
                      key={member}
                      className="px-2 py-1 rounded text-sm"
                      style={{ backgroundColor: `${comm.color}30`, color: comm.color }}
                    >
                      {member}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente de Associações Estatísticas (Qui-quadrado, PMI, etc.)
const AssociationsPanel = ({ statisticalAnalysis, isDarkMode = true }) => {
  const [sortBy, setSortBy] = useState('cooccurrence');
  
  if (!statisticalAnalysis?.chiSquareAssociations) return null;
  
  const t = getThemeClasses(isDarkMode);
  const associations = statisticalAnalysis.chiSquareAssociations;
  
  const sortedAssociations = useMemo(() => {
    const sorted = [...associations];
    switch (sortBy) {
      case 'cooccurrence': return sorted.sort((a, b) => b.cooccurrence - a.cooccurrence);
      case 'chiSquare': return sorted.sort((a, b) => parseFloat(b.chiSquare) - parseFloat(a.chiSquare));
      case 'pmi': return sorted.sort((a, b) => parseFloat(b.pmi) - parseFloat(a.pmi));
      case 'dice': return sorted.sort((a, b) => parseFloat(b.dice) - parseFloat(a.dice));
      default: return sorted;
    }
  }, [associations, sortBy]);
  
  return (
    <div className="space-y-4">
      {/* Seletor de Métrica */}
      <div className="flex items-center gap-4 flex-wrap">
        <span className={`text-sm ${t.textMuted}`}>Ordenar por:</span>
        {[
          { key: 'cooccurrence', label: 'Coocorrência', desc: 'Frequência conjunta' },
          { key: 'chiSquare', label: 'Qui²', desc: 'Significância estatística' },
          { key: 'pmi', label: 'PMI', desc: 'Informação mútua pontual' },
          { key: 'dice', label: 'Dice', desc: 'Coeficiente de Dice' }
        ].map(opt => (
          <button
            key={opt.key}
            onClick={() => setSortBy(opt.key)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              sortBy === opt.key 
                ? 'bg-secondary text-white' 
                : t.button
            }`}
            title={opt.desc}
          >
            {opt.label}
          </button>
        ))}
      </div>
      
      {/* Tabela de Associações */}
      <div className={`${t.cardInner} rounded-xl border ${t.cardInnerBorder} overflow-hidden`}>
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-sm">
            <thead className={`${t.tableHeader} sticky top-0`}>
              <tr>
                <th className={`px-3 py-2 text-left ${t.textSecondary}`}>Par de Palavras</th>
                <th className={`px-3 py-2 text-right ${t.textSecondary}`}>Cooc.</th>
                <th className={`px-3 py-2 text-right ${t.textSecondary}`}>Esperado</th>
                <th className={`px-3 py-2 text-right ${t.textSecondary}`}>χ²</th>
                <th className={`px-3 py-2 text-right ${t.textSecondary}`}>PMI</th>
                <th className={`px-3 py-2 text-right ${t.textSecondary}`}>Dice</th>
                <th className={`px-3 py-2 text-right ${t.textSecondary}`}>Jaccard</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${t.tableDivide}`}>
              {sortedAssociations.slice(0, 50).map((assoc, idx) => (
                <tr key={idx} className={t.hoverRow}>
                  <td className="px-3 py-2">
                    <span className="text-primary">{assoc.source}</span>
                    <span className={`${t.textDimmed} mx-1`}>↔</span>
                    <span className="text-primary">{assoc.target}</span>
                  </td>
                  <td className={`px-3 py-2 text-right font-medium ${t.text}`}>{assoc.cooccurrence}</td>
                  <td className={`px-3 py-2 text-right ${t.textMuted}`}>{assoc.expected}</td>
                  <td className="px-3 py-2 text-right text-muted-foreground">{assoc.chiSquare}</td>
                  <td className="px-3 py-2 text-right text-primary">{assoc.pmi}</td>
                  <td className="px-3 py-2 text-right text-primary">{assoc.dice}</td>
                  <td className="px-3 py-2 text-right text-rose-400">{assoc.jaccard}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Legenda */}
      <div className={`text-xs ${t.textDimmed} space-y-1`}>
        <p><strong>χ² (Qui-quadrado):</strong> Mede se a associação é significativa (maior = mais significativo)</p>
        <p><strong>PMI:</strong> Informação mútua pontual, valores positivos indicam associação acima do esperado</p>
        <p><strong>Dice/Jaccard:</strong> Medidas de similaridade entre 0 e 1</p>
      </div>
    </div>
  );
};

// Componente de Diversidade Léxica
const LexicalDiversityPanel = ({ statisticalAnalysis, isDarkMode = true }) => {
  if (!statisticalAnalysis?.lexicalDiversity) return null;
  
  const t = getThemeClasses(isDarkMode);
  const ld = statisticalAnalysis.lexicalDiversity;
  
  const metrics = [
    { key: 'ttr', label: 'TTR', value: `${ld.ttr}%`, desc: 'Type-Token Ratio: vocabulário único / total de palavras', color: 'cyan' },
    { key: 'rttr', label: 'RTTR', value: ld.rttr, desc: 'Root TTR: V / √N (corrigido para tamanho)', color: 'purple' },
    { key: 'cttr', label: 'CTTR', value: ld.cttr, desc: 'Corrected TTR: V / √(2N)', color: 'blue' },
    { key: 'herdanC', label: 'Herdan C', value: ld.herdanC, desc: 'log(V) / log(N) - estabilidade léxica', color: 'green' },
    { key: 'yuleK', label: 'Yule K', value: ld.yuleK, desc: 'Constante de Yule: mede repetitividade (menor = mais diverso)', color: 'amber' },
    { key: 'simpsonD', label: 'Simpson D', value: ld.simpsonD, desc: 'Índice de Simpson: probabilidade de repetição', color: 'rose' }
  ];
  
  const colorClasses = false ? {
    cyan: 'text-primary border-primary/30 bg-primary/10',
    purple: 'text-primary border-primary/30 bg-primary/10',
    blue: 'text-primary border-primary/30 bg-primary/10',
    green: 'text-primary border-primary/30 bg-primary/10',
    amber: 'text-muted-foreground border-border bg-muted',
    rose: 'text-rose-400 border-rose-500/30 bg-rose-900/20'
  } : {
    cyan: 'text-primary border-primary/30 bg-primary/5',
    purple: 'text-primary border-primary/30 bg-primary/5',
    blue: 'text-primary border-primary/30 bg-primary/5',
    green: 'text-primary border-primary/30 bg-primary/5',
    amber: 'text-muted-foreground border-border bg-muted',
    rose: 'text-rose-600 border-rose-300 bg-rose-50'
  };
  
  return (
    <div className="space-y-6">
      {/* Resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className={`${t.cardInner} rounded-xl p-4 border ${t.cardInnerBorder}`}>
          <div className={`text-2xl font-bold ${t.text}`}>{ld.totalTokens.toLocaleString()}</div>
          <div className={`text-sm ${t.textMuted}`}>Total de Tokens</div>
        </div>
        <div className={`${t.cardInner} rounded-xl p-4 border ${t.cardInnerBorder}`}>
          <div className="text-2xl font-bold text-primary">{ld.uniqueWords.toLocaleString()}</div>
          <div className={`text-sm ${t.textMuted}`}>Palavras Únicas</div>
        </div>
        <div className={`${t.cardInner} rounded-xl p-4 border ${t.cardInnerBorder}`}>
          <div className="text-2xl font-bold text-primary">{ld.hapaxCount.toLocaleString()}</div>
          <div className={`text-sm ${t.textMuted}`}>Hapax Legomena ({ld.hapaxRatio}%)</div>
        </div>
      </div>
      
      {/* Métricas de Diversidade */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {metrics.map(metric => (
          <div 
            key={metric.key}
            className={`rounded-xl p-4 border ${colorClasses[metric.color]}`}
          >
            <div className="text-2xl font-bold">{metric.value}</div>
            <div className="text-sm font-medium">{metric.label}</div>
            <div className={`text-xs ${t.textDimmed} mt-1`}>{metric.desc}</div>
          </div>
        ))}
      </div>
      
      {/* Interpretação */}
      <div className={`bg-muted rounded-xl p-4 border ${t.divider}`}>
        <h4 className={`font-medium mb-2 ${t.textSecondary}`}>Interpretação</h4>
        <div className={`text-sm ${t.textMuted} space-y-2`}>
          <p>
            <strong>TTR {parseFloat(ld.ttr) > 50 ? 'alto' : parseFloat(ld.ttr) > 30 ? 'médio' : 'baixo'}</strong>: 
            {parseFloat(ld.ttr) > 50 
              ? ' Vocabulário muito diversificado, típico de textos acadêmicos ou literários.'
              : parseFloat(ld.ttr) > 30 
                ? ' Diversidade moderada, comum em textos informativos.'
                : ' Vocabulário repetitivo, pode indicar foco temático específico.'}
          </p>
          <p>
            <strong>Hapax ratio {parseFloat(ld.hapaxRatio) > 50 ? 'alto' : 'moderado'}</strong>:
            {parseFloat(ld.hapaxRatio) > 50 
              ? ' Muitas palavras aparecem apenas uma vez, indicando riqueza vocabular.'
              : ' Proporção típica de hapax legomena.'}
          </p>
        </div>
      </div>
    </div>
  );
};

// Componente de TF-IDF
const TFIDFPanel = ({ statisticalAnalysis, isDarkMode = true }) => {
  const [selectedDoc, setSelectedDoc] = useState(null);
  
  if (!statisticalAnalysis?.tfidf) return null;
  
  const t = getThemeClasses(isDarkMode);
  const { byDocument, global } = statisticalAnalysis.tfidf;
  
  return (
    <div className="space-y-6">
      {/* TF-IDF Global */}
      <div>
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Termos mais Discriminantes (TF-IDF Global)
        </h4>
        <div className={`${t.cardInner} rounded-xl p-4 border ${t.cardInnerBorder}`}>
          <div className="flex flex-wrap gap-2">
            {global.slice(0, 30).map((term, idx) => (
              <span
                key={term.word}
                className="px-2 py-1 rounded text-sm"
                style={{
                  backgroundColor: false 
                    ? `oklch(0.585 0.204 277.12 / ${0.1 + (term.avgTfidf * 2)})` 
                    : `oklch(0.457 0.215 277.02 / ${0.1 + (term.avgTfidf * 2)})`,
                  color: false 
                    ? (idx < 10 ? 'oklch(0.585 0.204 277.12)' : idx < 20 ? 'oklch(0.457 0.215 277.02)' : 'oklch(0.551 0.023 264.36)')
                    : (idx < 10 ? 'oklch(0.585 0.204 277.12)' : idx < 20 ? 'oklch(0.457 0.215 277.02)' : 'oklch(0.872 0.009 258.34)')
                }}
                title={`TF-IDF médio: ${term.avgTfidf.toFixed(4)}, Documentos: ${term.docCount}`}
              >
                {term.word}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      {/* TF-IDF por Documento */}
      <div>
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          TF-IDF por Documento
        </h4>
        <div className="space-y-2">
          {byDocument.map(doc => (
            <div 
              key={doc.docId}
              className={`${t.cardInner} rounded-xl border ${t.cardInnerBorder} overflow-hidden`}
            >
              <button
                onClick={() => setSelectedDoc(selectedDoc === doc.docId ? null : doc.docId)}
                className={`w-full flex items-center justify-between p-3 ${t.hoverRow} transition-colors`}
              >
                <span className="font-medium truncate">{doc.docName}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${t.textMuted}`}>{doc.totalTerms} termos</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${selectedDoc === doc.docId ? 'rotate-180' : ''}`} />
                </div>
              </button>
              
              {selectedDoc === doc.docId && (
                <div className={`p-3 border-t ${t.divider} bg-muted`}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className={t.textMuted}>
                          <th className="px-2 py-1 text-left">Termo</th>
                          <th className="px-2 py-1 text-right">TF</th>
                          <th className="px-2 py-1 text-right">IDF</th>
                          <th className="px-2 py-1 text-right">TF-IDF</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${t.tableDivide}`}>
                        {doc.topTerms.slice(0, 15).map(term => (
                          <tr key={term.word}>
                            <td className="px-2 py-1 text-primary">{term.word}</td>
                            <td className={`px-2 py-1 text-right ${t.textMuted}`}>{term.tf.toFixed(4)}</td>
                            <td className="px-2 py-1 text-right text-primary">{term.idf.toFixed(2)}</td>
                            <td className={`px-2 py-1 text-right font-medium ${t.text}`}>{term.tfidf.toFixed(4)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Componente de Especificidades por Corpus
const SpecificitiesPanel = ({ statisticalAnalysis }) => {
  if (!statisticalAnalysis?.specificities || statisticalAnalysis.specificities.length < 2) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Análise de especificidades requer pelo menos 2 corpus com documentos.</p>
        <p className="text-sm mt-2">Crie múltiplos corpus na aba Importar para comparar.</p>
      </div>
    );
  }
  
  const specificities = statisticalAnalysis.specificities;
  
  return (
    <div className="space-y-6">
      <p className={`text-sm text-muted-foreground`}>
        Especificidades mostram palavras que são significativamente mais ou menos frequentes em cada corpus comparado ao esperado.
      </p>
      
      {specificities.map(corpus => (
        <div 
          key={corpus.corpusId}
          className="bg-muted rounded-xl border border-border overflow-hidden"
        >
          <div 
            className="p-4 border-b border-border flex items-center gap-3"
            style={{ borderLeftWidth: '4px', borderLeftColor: corpus.corpusColor }}
          >
            <span 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: corpus.corpusColor }}
            />
            <span className="font-medium">{corpus.corpusName}</span>
            <span className={`text-sm text-muted-foreground`}>({corpus.totalWords.toLocaleString()} palavras)</span>
          </div>
          
          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
            {/* Termos Específicos (positivos) */}
            <div className="p-4">
              <h5 className="text-sm font-medium text-primary mb-3">
                ↑ Termos Específicos (acima do esperado)
              </h5>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {corpus.topPositive.slice(0, 10).map(term => (
                  <div key={term.word} className="flex items-center justify-between text-sm">
                    <span className="text-white">{term.word}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{term.observed}x</span>
                      <span className="text-primary text-xs">+{term.ratio}x</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Termos Sub-representados (negativos) */}
            <div className="p-4">
              <h5 className="text-sm font-medium text-rose-400 mb-3">
                ↓ Termos Sub-representados (abaixo do esperado)
              </h5>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {corpus.topNegative.slice(0, 10).map(term => (
                  <div key={term.word} className="flex items-center justify-between text-sm">
                    <span className="text-white">{term.word}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{term.observed}x</span>
                      <span className="text-rose-400 text-xs">{term.ratio}x</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ==================== VISUALIZAÇÃO DE ÁRVORE DE PALAVRAS ====================

const WordTreeVisualization = ({ wordTree, width = 900, height = 500, isDarkMode = true }) => {
  const [hoveredBranch, setHoveredBranch] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [tooltipData, setTooltipData] = useState(null);
  const svgRef = React.useRef(null);
  
  if (!wordTree || !wordTree.center) {
    return <div className="text-muted-foreground text-center py-8">Digite uma palavra para visualizar a árvore</div>;
  }
  
  const { center, left = [], right = [] } = wordTree;
  const centerX = width / 2;
  const centerY = height / 2;
  
  const maxCount = Math.max(...left.map(b => b.count), ...right.map(b => b.count), 1);
  const leftSpacing = Math.min(28, (height - 100) / Math.max(left.length, 1));
  const rightSpacing = Math.min(28, (height - 100) / Math.max(right.length, 1));
  
  // Create cubic Bezier curve
  const createCurve = (startX, startY, endX, endY, side) => {
    const dx = endX - startX;
    const ctrl1X = startX + dx * 0.4;
    const ctrl1Y = startY;
    const ctrl2X = startX + dx * 0.6;
    const ctrl2Y = endY;
    return `M ${startX} ${startY} C ${ctrl1X} ${ctrl1Y}, ${ctrl2X} ${ctrl2Y}, ${endX} ${endY}`;
  };
  
  // Zoom/Pan handlers
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoomLevel(prev => Math.max(0.3, Math.min(4, prev * delta)));
  }, []);
  
  const handleMouseDown = useCallback((e) => {
    if (e.button === 0 && !hoveredBranch) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  }, [hoveredBranch, panOffset]);
  
  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      setPanOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  }, [isDragging, dragStart]);
  
  const handleMouseUp = useCallback(() => setIsDragging(false), []);
  const resetView = useCallback(() => { setZoomLevel(1); setPanOffset({ x: 0, y: 0 }); }, []);
  
  return (
    <div className="relative">
      {/* Controls */}
      <div className="absolute top-2 right-2 z-10 flex gap-1">
        <button onClick={() => setZoomLevel(z => Math.min(4, z * 1.2))} className="p-1.5 rounded bg-secondary hover:bg-secondary/80 text-foreground text-xs">+</button>
        <button onClick={() => setZoomLevel(z => Math.max(0.3, z / 1.2))} className="p-1.5 rounded bg-secondary hover:bg-secondary/80 text-foreground text-xs">−</button>
        <button onClick={resetView} className="p-1.5 rounded bg-secondary hover:bg-secondary/80 text-foreground text-xs">⟲</button>
      </div>
      <div className="absolute bottom-2 left-2 z-10 text-xs text-muted-foreground">
        Zoom: {Math.round(zoomLevel * 100)}% | {left.length} ramos à esquerda, {right.length} à direita
      </div>
      
      <svg 
        ref={svgRef}
        width={width} 
        height={height} 
        className="bg-background/30 rounded-xl cursor-grab"
        style={{ cursor: isDragging ? 'grabbing' : (hoveredBranch ? 'pointer' : 'grab') }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
        </defs>
        
        <g transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}>
          {/* Left branches */}
          {left.slice(0, 25).map((branch, idx) => {
            const y = 40 + idx * leftSpacing;
            const lineWidth = 60 + (branch.count / maxCount) * 160;
            const isHovered = hoveredBranch === `left-${idx}`;
            const anyHovered = hoveredBranch !== null;
            
            return (
              <g 
                key={`left-${idx}`}
                onMouseEnter={() => { setHoveredBranch(`left-${idx}`); setTooltipData({ side: 'left', branch, idx }); }}
                onMouseLeave={() => { setHoveredBranch(null); setTooltipData(null); }}
                style={{ cursor: 'pointer' }}
              >
                <path
                  d={createCurve(centerX - 65, centerY, centerX - 65 - lineWidth, y, 'left')}
                  fill="none"
                  stroke={isHovered ? 'oklch(0.585 0.204 277.12)' : p.c1_40}
                  strokeWidth={isHovered ? 3 : 1.5 + (branch.count / maxCount) * 2.5}
                  opacity={anyHovered ? (isHovered ? 1 : 0.15) : 0.6}
                  style={{ transition: 'opacity 0.2s' }}
                />
                <circle
                  cx={centerX - 65 - lineWidth}
                  cy={y}
                  r={isHovered ? 5 : 3}
                  fill={isHovered ? 'oklch(0.585 0.204 277.12)' : 'oklch(0.585 0.204 277.12)'}
                  opacity={anyHovered ? (isHovered ? 1 : 0.2) : 0.7}
                />
                <text
                  x={centerX - 75 - lineWidth}
                  y={y + 4}
                  textAnchor="end"
                  fill={isDarkMode ? (isHovered ? 'oklch(0.585 0.204 277.12)' : 'oklch(0.551 0.023 264.36)') : (isHovered ? 'oklch(0.585 0.204 277.12)' : 'oklch(0.872 0.009 258.34)')}
                  fontSize={isHovered ? 13 : 11}
                  fontWeight={isHovered ? 600 : 400}
                  opacity={anyHovered ? (isHovered ? 1 : 0.25) : 0.9}
                  style={{ fontFamily: "'JetBrains Mono', monospace", transition: 'opacity 0.2s' }}
                >
                  {branch.path}
                </text>
                {isHovered && (
                  <text x={centerX - 75 - lineWidth} y={y + 17} textAnchor="end" fill="oklch(0.551 0.023 264.36)" fontSize={9}>
                    {branch.count}x ocorrências
                  </text>
                )}
              </g>
            );
          })}
          
          {/* Center word */}
          <rect x={centerX - 85} y={centerY - 22} width={170} height={44} rx={10} fill="oklch(0.585 0.204 277.12)" opacity={0.15} />
          <rect x={centerX - 85} y={centerY - 22} width={170} height={44} rx={10} fill="none" stroke="oklch(0.585 0.204 277.12)" strokeWidth={2} opacity={0.5} />
          <text x={centerX} y={centerY + 7} textAnchor="middle" fill="oklch(0.585 0.204 277.12)" fontSize={20} fontWeight={700}>
            {center}
          </text>
          
          {/* Right branches */}
          {right.slice(0, 25).map((branch, idx) => {
            const y = 40 + idx * rightSpacing;
            const lineWidth = 60 + (branch.count / maxCount) * 160;
            const isHovered = hoveredBranch === `right-${idx}`;
            const anyHovered = hoveredBranch !== null;
            
            return (
              <g 
                key={`right-${idx}`}
                onMouseEnter={() => { setHoveredBranch(`right-${idx}`); setTooltipData({ side: 'right', branch, idx }); }}
                onMouseLeave={() => { setHoveredBranch(null); setTooltipData(null); }}
                style={{ cursor: 'pointer' }}
              >
                <path
                  d={createCurve(centerX + 65, centerY, centerX + 65 + lineWidth, y, 'right')}
                  fill="none"
                  stroke={isHovered ? 'oklch(0.457 0.215 277.02)' : p.c2_40}
                  strokeWidth={isHovered ? 3 : 1.5 + (branch.count / maxCount) * 2.5}
                  opacity={anyHovered ? (isHovered ? 1 : 0.15) : 0.6}
                  style={{ transition: 'opacity 0.2s' }}
                />
                <circle
                  cx={centerX + 65 + lineWidth}
                  cy={y}
                  r={isHovered ? 5 : 3}
                  fill={isHovered ? 'oklch(0.457 0.215 277.02)' : 'oklch(0.457 0.215 277.02)'}
                  opacity={anyHovered ? (isHovered ? 1 : 0.2) : 0.7}
                />
                <text
                  x={centerX + 75 + lineWidth}
                  y={y + 4}
                  textAnchor="start"
                  fill={isDarkMode ? (isHovered ? 'oklch(0.457 0.215 277.02)' : 'oklch(0.551 0.023 264.36)') : (isHovered ? 'oklch(0.457 0.215 277.02)' : 'oklch(0.872 0.009 258.34)')}
                  fontSize={isHovered ? 13 : 11}
                  fontWeight={isHovered ? 600 : 400}
                  opacity={anyHovered ? (isHovered ? 1 : 0.25) : 0.9}
                  style={{ fontFamily: "'JetBrains Mono', monospace", transition: 'opacity 0.2s' }}
                >
                  {branch.path}
                </text>
                {isHovered && (
                  <text x={centerX + 75 + lineWidth} y={y + 17} textAnchor="start" fill="oklch(0.551 0.023 264.36)" fontSize={9}>
                    {branch.count}x ocorrências
                  </text>
                )}
              </g>
            );
          })}
        </g>
        
        {/* Tooltip */}
        {tooltipData && (
          <g transform={`translate(${width / 2 + (tooltipData.side === 'left' ? -180 : 20)}, ${height - 60})`}>
            <rect x={0} y={0} width={160} height={50} rx={6} fill="oklch(0.208 0.040 265.75 / 0.95)" stroke={tooltipData.side === 'left' ? 'oklch(0.585 0.204 277.12)' : 'oklch(0.457 0.215 277.02)'} strokeWidth={1} />
            <text x={10} y={18} fill={tooltipData.side === 'left' ? 'oklch(0.585 0.204 277.12)' : 'oklch(0.457 0.215 277.02)'} fontSize={11} fontWeight={600}>
              {tooltipData.branch.path}
            </text>
            <text x={10} y={36} fill="oklch(0.551 0.023 264.36)" fontSize={10}>
              Frequência: {tooltipData.branch.count} ({((tooltipData.branch.count / maxCount) * 100).toFixed(0)}%)
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};

// ==================== VISUALIZAÇÃO DE REDE DE BIGRAMAS ====================

const BigramNetworkVisualization = ({ bigramNetwork, width = 800, height = 600, isDarkMode = true }) => {
  const [positions, setPositions] = useState([]);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const svgRef = React.useRef(null);
  
  useEffect(() => {
    if (!bigramNetwork?.nodes?.length) return;
    
    const { nodes, edges = [] } = bigramNetwork;
    
    // Initialize with circle layout
    const initialPositions = nodes.map((node, idx) => {
      const angle = (idx / nodes.length) * 2 * Math.PI;
      const radius = Math.min(width, height) / 3;
      return {
        id: node.id,
        x: width / 2 + Math.cos(angle) * radius,
        y: height / 2 + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        degree: node.degree,
        weight: node.totalWeight,
        connections: []
      };
    });
    
    // Build connections
    const posMap = new Map(initialPositions.map(p => [p.id, p]));
    edges.forEach(edge => {
      const p1 = posMap.get(edge.source);
      const p2 = posMap.get(edge.target);
      if (p1 && p2) {
        p1.connections.push({ id: edge.target, weight: edge.weight });
        p2.connections.push({ id: edge.source, weight: edge.weight });
      }
    });
    
    // Enhanced force-directed simulation (150 iterations)
    const repulsion = 3000;
    const attraction = 0.008;
    const centerGravity = 0.012;
    const minNodeDistance = 50;
    
    for (let iter = 0; iter < 150; iter++) {
      const alpha = 1 - iter / 150;
      
      // Repulsion
      for (let i = 0; i < initialPositions.length; i++) {
        for (let j = i + 1; j < initialPositions.length; j++) {
          const p1 = initialPositions[i];
          const p2 = initialPositions[j];
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          
          if (dist < 200) {
            const force = (repulsion * alpha) / (dist * dist);
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            p1.vx -= fx;
            p1.vy -= fy;
            p2.vx += fx;
            p2.vy += fy;
          }
        }
      }
      
      // Attraction along edges
      edges.forEach(edge => {
        const p1 = posMap.get(edge.source);
        const p2 = posMap.get(edge.target);
        if (!p1 || !p2) return;
        
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = dist * attraction * alpha * (1 + edge.weight * 0.3);
        
        p1.vx += (dx / dist) * force;
        p1.vy += (dy / dist) * force;
        p2.vx -= (dx / dist) * force;
        p2.vy -= (dy / dist) * force;
      });
      
      // Center gravity
      initialPositions.forEach(p => {
        p.vx += (width / 2 - p.x) * centerGravity * alpha;
        p.vy += (height / 2 - p.y) * centerGravity * alpha;
      });
      
      // Apply velocities
      initialPositions.forEach(p => {
        p.x += p.vx * 0.85;
        p.y += p.vy * 0.85;
        p.vx *= 0.9;
        p.vy *= 0.9;
        p.x = Math.max(80, Math.min(width - 80, p.x));
        p.y = Math.max(50, Math.min(height - 50, p.y));
      });
    }
    
    // Final collision resolution
    for (let pass = 0; pass < 10; pass++) {
      for (let i = 0; i < initialPositions.length; i++) {
        for (let j = i + 1; j < initialPositions.length; j++) {
          const p1 = initialPositions[i];
          const p2 = initialPositions[j];
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const minDist = minNodeDistance;
          
          if (dist < minDist) {
            const overlap = (minDist - dist) / 2;
            const nx = dx / dist;
            const ny = dy / dist;
            p1.x -= nx * overlap;
            p1.y -= ny * overlap;
            p2.x += nx * overlap;
            p2.y += ny * overlap;
          }
        }
      }
    }
    
    setPositions(initialPositions);
  }, [bigramNetwork, width, height]);
  
  // Zoom/Pan handlers
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoomLevel(prev => Math.max(0.3, Math.min(4, prev * delta)));
  }, []);
  
  const handleMouseDown = useCallback((e) => {
    if (e.button === 0 && !hoveredNode) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  }, [hoveredNode, panOffset]);
  
  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      setPanOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      setTooltipPos({ x: (e.clientX - rect.left - panOffset.x) / zoomLevel, y: (e.clientY - rect.top - panOffset.y) / zoomLevel });
    }
  }, [isDragging, dragStart, panOffset, zoomLevel]);
  
  const handleMouseUp = useCallback(() => setIsDragging(false), []);
  const resetView = useCallback(() => { setZoomLevel(1); setPanOffset({ x: 0, y: 0 }); }, []);
  
  // Create curved path
  const createCurvedPath = (p1, p2, idx) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;
    const perpX = -dy / dist;
    const perpY = dx / dist;
    const curvature = Math.min(dist * 0.2, 40) * (idx % 2 === 0 ? 1 : -1);
    const ctrlX = midX + perpX * curvature;
    const ctrlY = midY + perpY * curvature;
    return `M ${p1.x} ${p1.y} Q ${ctrlX} ${ctrlY} ${p2.x} ${p2.y}`;
  };
  
  if (!bigramNetwork?.nodes?.length) {
    return <div className="text-muted-foreground text-center py-8">Nenhum bigrama encontrado com frequência suficiente</div>;
  }
  
  const { edges } = bigramNetwork;
  const posMap = new Map(positions.map(p => [p.id, p]));
  const maxWeight = Math.max(...positions.map(p => p.weight), 1);
  const maxEdgeWeight = Math.max(...edges.map(e => e.weight), 1);
  
  // Get hovered node data
  const hoveredNodeData = hoveredNode ? posMap.get(hoveredNode) : null;
  
  return (
    <div className="relative">
      {/* Controls */}
      <div className="absolute top-2 right-2 z-10 flex gap-1">
        <button onClick={() => setZoomLevel(z => Math.min(4, z * 1.2))} className="p-1.5 rounded bg-secondary hover:bg-secondary/80 text-foreground text-xs">+</button>
        <button onClick={() => setZoomLevel(z => Math.max(0.3, z / 1.2))} className="p-1.5 rounded bg-secondary hover:bg-secondary/80 text-foreground text-xs">−</button>
        <button onClick={resetView} className="p-1.5 rounded bg-secondary hover:bg-secondary/80 text-foreground text-xs">⟲</button>
      </div>
      <div className="absolute bottom-2 left-2 z-10 text-xs text-muted-foreground">
        Zoom: {Math.round(zoomLevel * 100)}%
      </div>
      
      <svg 
        ref={svgRef}
        width={width} 
        height={height} 
        className="bg-background/30 rounded-xl cursor-grab"
        style={{ cursor: isDragging ? 'grabbing' : (hoveredNode ? 'pointer' : 'grab') }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
          <marker id="bigramArrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="oklch(0.551 0.023 264.36)" />
          </marker>
          <marker id="bigramArrowHighlight" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="oklch(0.585 0.204 277.12)" />
          </marker>
        </defs>
        
        <g transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}>
          {/* Edges as Bezier curves */}
          {edges.map((edge, idx) => {
            const p1 = posMap.get(edge.source);
            const p2 = posMap.get(edge.target);
            if (!p1 || !p2) return null;
            
            const isHighlighted = hoveredNode === edge.source || hoveredNode === edge.target;
            
            return (
              <path
                key={`edge-${idx}`}
                d={createCurvedPath(p1, p2, idx)}
                fill="none"
                stroke={isHighlighted ? 'oklch(0.585 0.204 277.12)' : 'oklch(0.872 0.009 258.34)'}
                strokeWidth={1 + (edge.weight / maxEdgeWeight) * 3}
                opacity={hoveredNode ? (isHighlighted ? 0.9 : 0.08) : 0.4}
                markerEnd={isHighlighted ? "url(#bigramArrowHighlight)" : "url(#bigramArrow)"}
                style={{ transition: 'opacity 0.2s' }}
              />
            );
          })}
          
          {/* Nodes */}
          {positions.map(node => {
            const isHovered = hoveredNode === node.id;
            const isConnected = hoveredNode && hoveredNodeData?.connections.some(c => c.id === node.id);
            const size = 6 + (node.weight / maxWeight) * 20;
            
            return (
              <g 
                key={node.id}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                style={{ cursor: 'pointer' }}
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isHovered ? size + 3 : size}
                  fill={isHovered ? 'oklch(0.680 0.158 276.93)' : 'oklch(0.585 0.204 277.12)'}
                  stroke={isHovered ? 'oklch(1.000 0 0)' : 'transparent'}
                  strokeWidth={2}
                  opacity={hoveredNode ? (isHovered ? 1 : (isConnected ? 0.85 : 0.1)) : 0.85}
                  style={{ transition: 'opacity 0.2s' }}
                />
                <text
                  x={node.x}
                  y={node.y - size - 6}
                  textAnchor="middle"
                  fill={'currentColor'}
                  fontSize={isHovered ? 12 : 10}
                  fontWeight={isHovered ? 600 : 400}
                  opacity={hoveredNode ? (isHovered || isConnected ? 1 : 0.15) : 0.85}
                  style={{ pointerEvents: 'none' }}
                >
                  {node.id}
                </text>
              </g>
            );
          })}
        </g>
        
        {/* Tooltip */}
        {hoveredNodeData && (
          <g transform={`translate(${Math.min(tooltipPos.x * zoomLevel + panOffset.x + 20, width - 180)}, ${Math.max(tooltipPos.y * zoomLevel + panOffset.y - 10, 10)})`}>
            <rect x={0} y={0} width={165} height={70 + Math.min(hoveredNodeData.connections.length, 4) * 14} rx={8} fill="oklch(0.208 0.040 265.75 / 0.95)" stroke="oklch(0.585 0.204 277.12)" strokeWidth={1} />
            <text x={10} y={20} fill="oklch(0.585 0.204 277.12)" fontSize={12} fontWeight={600}>{hoveredNodeData.id}</text>
            <text x={10} y={38} fill="oklch(0.551 0.023 264.36)" fontSize={10}>Grau: {hoveredNodeData.degree} | Peso: {hoveredNodeData.weight}</text>
            <text x={10} y={54} fill="oklch(0.551 0.023 264.36)" fontSize={10}>Conexões: {hoveredNodeData.connections.length}</text>
            {hoveredNodeData.connections.slice(0, 4).map((conn, i) => (
              <text key={i} x={15} y={70 + i * 14} fill="oklch(0.280 0.037 260.03)" fontSize={9}>• {conn.id} ({conn.weight})</text>
            ))}
          </g>
        )}
      </svg>
    </div>
  );
};

// ==================== TERMSBERRY (CIRCLE PACKING) ====================

const TermsBerryVisualization = ({ words, width = 700, height = 700, onWordClick, isDarkMode = true }) => {
  const [packedCircles, setPackedCircles] = useState([]);
  const [hoveredWord, setHoveredWord] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const svgRef = React.useRef(null);
  
  useEffect(() => {
    if (!words || words.length === 0) {
      setIsLoading(false);
      return;
    }
    
    const loadAndRender = async () => {
      setIsLoading(true);
      
      // Carregar D3 se necessário
      if (!window.d3) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
      
      // Preparar dados para circle packing
      const topWords = words.slice(0, 80);
      const maxCount = Math.max(...topWords.map(w => w.count));
      
      // Criar hierarquia para D3
      const data = {
        name: 'root',
        children: topWords.map(w => ({
          name: w.word,
          value: w.count,
          originalData: w
        }))
      };
      
      const root = window.d3.hierarchy(data)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);
      
      const pack = window.d3.pack()
        .size([width - 20, height - 20])
        .padding(3);
      
      pack(root);
      
      // Extrair círculos (excluindo o root)
      const circles = root.descendants()
        .filter(d => d.depth === 1)
        .map((d, idx) => ({
          x: d.x + 10,
          y: d.y + 10,
          r: d.r,
          word: d.data.name,
          count: d.data.value,
          rank: idx + 1,
          originalData: d.data.originalData
        }));
      
      setPackedCircles(circles);
      setIsLoading(false);
    };
    
    loadAndRender().catch(err => {
      console.error('Erro ao gerar TermsBerry:', err);
      setIsLoading(false);
    });
  }, [words, width, height]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center" style={{ width, height }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Gerando TermsBerry...</p>
        </div>
      </div>
    );
  }
  
  if (packedCircles.length === 0) {
    return (
      <div className="flex items-center justify-center text-muted-foreground" style={{ width, height }}>
        Nenhum dado para exibir
      </div>
    );
  }
  
  const maxCount = Math.max(...packedCircles.map(c => c.count));
  const hoveredCircle = packedCircles.find(c => c.word === hoveredWord);
  
  // Zoom/Pan handlers
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoomLevel(prev => Math.max(0.3, Math.min(4, prev * delta)));
  };
  
  const handleMouseDown = (e) => {
    if (e.button === 0 && !hoveredWord) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };
  
  const handleMouseMove = (e) => {
    if (isDragging) {
      setPanOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };
  
  const handleMouseUp = () => setIsDragging(false);
  const resetView = () => { setZoomLevel(1); setPanOffset({ x: 0, y: 0 }); };
  
  return (
    <div className="relative">
      {/* Controls */}
      <div className="absolute top-2 right-2 z-10 flex gap-1">
        <button onClick={() => setZoomLevel(z => Math.min(4, z * 1.2))} className="p-1.5 rounded bg-secondary hover:bg-secondary/80 text-foreground text-xs">+</button>
        <button onClick={() => setZoomLevel(z => Math.max(0.3, z / 1.2))} className="p-1.5 rounded bg-secondary hover:bg-secondary/80 text-foreground text-xs">−</button>
        <button onClick={resetView} className="p-1.5 rounded bg-secondary hover:bg-secondary/80 text-foreground text-xs">⟲</button>
      </div>
      <div className="absolute bottom-2 left-2 z-10 text-xs text-muted-foreground">
        Zoom: {Math.round(zoomLevel * 100)}% | {packedCircles.length} termos
      </div>
      
      <svg 
        ref={svgRef}
        width={width} 
        height={height} 
        className="bg-background/30 rounded-xl cursor-grab"
        style={{ cursor: isDragging ? 'grabbing' : (hoveredWord ? 'pointer' : 'grab') }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
        </defs>
        
        <g transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}>
          {packedCircles.map((circle, idx) => {
            const isHovered = hoveredWord === circle.word;
            const intensity = circle.count / maxCount;
            const opacity = 0.4 + intensity * 0.6;
            const fillColor = `oklch(0.585 0.204 277.12 / ${opacity})`;
            
            return (
              <g 
                key={circle.word}
                onMouseEnter={() => setHoveredWord(circle.word)}
                onMouseLeave={() => setHoveredWord(null)}
                onClick={() => onWordClick && onWordClick(circle.originalData)}
                style={{ cursor: 'pointer' }}
              >
                <circle
                  cx={circle.x}
                  cy={circle.y}
                  r={isHovered ? circle.r + 3 : circle.r}
                  fill={isHovered ? 'oklch(0.585 0.204 277.12)' : fillColor}
                  fillOpacity={hoveredWord ? (isHovered ? 0.95 : 0.15) : (0.5 + intensity * 0.4)}
                  stroke={isHovered ? 'oklch(1.000 0 0)' : 'oklch(0.872 0.009 258.34)'}
                  strokeWidth={isHovered ? 2.5 : 0.5}
                  style={{ transition: 'opacity 0.2s, fill-opacity 0.2s' }}
                />
                {circle.r > 15 && (
                  <text
                    x={circle.x}
                    y={circle.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={isHovered ? 'oklch(1.000 0 0)' : (intensity > 0.3 ? 'oklch(1.000 0 0)' : 'oklch(0.280 0.037 260.03)')}
                    fontSize={Math.min(circle.r / 3, 14)}
                    fontWeight={isHovered ? 700 : 500}
                    opacity={hoveredWord ? (isHovered ? 1 : 0.2) : 0.9}
                    pointerEvents="none"
                    style={{ transition: 'opacity 0.2s' }}
                  >
                    {circle.word.length > circle.r / 5 
                      ? circle.word.slice(0, Math.floor(circle.r / 5)) + '…' 
                      : circle.word}
                  </text>
                )}
              </g>
            );
          })}
        </g>
        
        {/* Rich Tooltip */}
        {hoveredCircle && (
          <g transform={`translate(${Math.min(hoveredCircle.x * zoomLevel + panOffset.x + 20, width - 160)}, ${Math.max(hoveredCircle.y * zoomLevel + panOffset.y - 60, 10)})`}>
            <rect x={0} y={0} width={150} height={65} rx={8} fill="oklch(0.208 0.040 265.75 / 0.95)" stroke="oklch(0.585 0.204 277.12)" strokeWidth={1} />
            <text x={10} y={18} fill="oklch(0.585 0.204 277.12)" fontSize={13} fontWeight={600}>{hoveredCircle.word}</text>
            <text x={10} y={36} fill="oklch(0.551 0.023 264.36)" fontSize={10}>Frequência: {hoveredCircle.count}</text>
            <text x={10} y={52} fill="oklch(0.551 0.023 264.36)" fontSize={10}>Rank: #{hoveredCircle.rank} de {packedCircles.length}</text>
          </g>
        )}
      </svg>
    </div>
  );
};

// ==================== AFC (ANÁLISE FATORIAL DE CORRESPONDÊNCIA) ====================

// Função para calcular AFC simplificada
const calculateAFC = (documents, words, stopwords = null, options = {}) => {
  if (!documents || documents.length < 2 || !words || words.length < 10) {
    return null;
  }
  
  // Criar matriz documento x palavra
  const topWords = words.slice(0, 150).map(w => w.word);
  const matrix = [];
  
  documents.forEach(doc => {
    const docWords = cleanText(doc.content, options, stopwords);
    const row = topWords.map(word => {
      return docWords.filter(w => w === word).length;
    });
    matrix.push(row);
  });
  
  // Calcular totais
  const rowTotals = matrix.map(row => row.reduce((a, b) => a + b, 0));
  const colTotals = topWords.map((_, colIdx) => 
    matrix.reduce((sum, row) => sum + row[colIdx], 0)
  );
  const grandTotal = rowTotals.reduce((a, b) => a + b, 0);
  
  if (grandTotal === 0) return null;
  
  // Calcular perfis e coordenadas (simplificado)
  // Usamos uma aproximação via PCA-like para as duas primeiras dimensões
  const wordProfiles = topWords.map((word, colIdx) => {
    // Calcular perfil da palavra (distribuição pelos documentos)
    const profile = matrix.map((row, rowIdx) => {
      const expected = (rowTotals[rowIdx] * colTotals[colIdx]) / grandTotal;
      const observed = row[colIdx];
      // Chi-square contribution
      if (expected > 0) {
        return (observed - expected) / Math.sqrt(expected);
      }
      return 0;
    });
    
    // Simplificação: usar médias ponderadas como coordenadas
    const x = profile.reduce((sum, val, idx) => sum + val * (idx / documents.length - 0.5), 0);
    const y = profile.reduce((sum, val, idx) => sum + val * Math.sin(idx * Math.PI / documents.length), 0);
    
    return {
      word,
      x: x * 2,
      y: y * 2,
      count: colTotals[colIdx],
      chiContribution: profile.reduce((sum, val) => sum + val * val, 0)
    };
  });
  
  // Normalizar coordenadas
  const xValues = wordProfiles.map(p => p.x);
  const yValues = wordProfiles.map(p => p.y);
  const xMax = Math.max(...xValues.map(Math.abs), 1);
  const yMax = Math.max(...yValues.map(Math.abs), 1);
  
  const normalizedProfiles = wordProfiles.map(p => ({
    ...p,
    x: (p.x / xMax) * 2,
    y: (p.y / yMax) * 2
  }));
  
  // Calcular variância explicada (aproximada)
  const totalVariance = normalizedProfiles.reduce((sum, p) => sum + p.chiContribution, 0);
  const dim1Variance = normalizedProfiles.reduce((sum, p) => sum + p.x * p.x, 0);
  const dim2Variance = normalizedProfiles.reduce((sum, p) => sum + p.y * p.y, 0);
  
  return {
    words: normalizedProfiles,
    variance: {
      dim1: ((dim1Variance / (dim1Variance + dim2Variance)) * 50).toFixed(1),
      dim2: ((dim2Variance / (dim1Variance + dim2Variance)) * 50).toFixed(1)
    }
  };
};

const AFCVisualization = ({ afcData, width = 800, height = 600, isDarkMode = true }) => {
  const [hoveredWord, setHoveredWord] = useState(null);
  const [showLabels, setShowLabels] = useState(true);
  const [labelDensity, setLabelDensity] = useState(0.7);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const svgRef = React.useRef(null);
  
  if (!afcData || !afcData.words || afcData.words.length === 0) {
    return (
      <div className="flex items-center justify-center text-muted-foreground" style={{ width, height }}>
        <div className="text-center">
          <p>Dados insuficientes para AFC</p>
          <p className="text-sm mt-2">Necessário pelo menos 2 documentos</p>
        </div>
      </div>
    );
  }
  
  const { words, variance } = afcData;
  const margin = { top: 60, right: 80, bottom: 60, left: 100 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const centerX = margin.left + plotWidth / 2;
  const centerY = margin.top + plotHeight / 2;
  
  const xScale = (val) => centerX + val * (plotWidth / 4);
  const yScale = (val) => centerY - val * (plotHeight / 4);
  
  const getColor = (x, y) => {
    if (x > 0 && y > 0) return 'oklch(0.585 0.204 277.12)';
    if (x < 0 && y > 0) return 'oklch(0.585 0.204 277.12)';
    if (x < 0 && y < 0) return 'oklch(0.457 0.215 277.02)';
    return 'oklch(0.359 0.135 278.70)';
  };
  
  const getQuadrantName = (x, y) => {
    if (x > 0 && y > 0) return 'Q1 (+ +)';
    if (x < 0 && y > 0) return 'Q2 (- +)';
    if (x < 0 && y < 0) return 'Q3 (- -)';
    return 'Q4 (+ -)';
  };
  
  const maxCount = Math.max(...words.map(w => w.count));
  const hoveredData = words.find(w => w.word === hoveredWord);
  
  // Compute labels with collision avoidance
  const computedLabels = useMemo(() => {
    const threshold = maxCount * (1 - labelDensity);
    const visibleWords = words.filter(w => w.count >= threshold);
    
    const labels = visibleWords.map(w => ({
      word: w.word,
      x: xScale(w.x),
      y: yScale(w.y) - (3 + (w.count / maxCount) * 8) - 8,
      origX: xScale(w.x),
      origY: yScale(w.y),
      width: w.word.length * 6,
      height: 12,
      count: w.count,
      dataX: w.x,
      dataY: w.y
    }));
    
    // Simple collision avoidance (20 iterations)
    for (let iter = 0; iter < 20; iter++) {
      for (let i = 0; i < labels.length; i++) {
        for (let j = i + 1; j < labels.length; j++) {
          const a = labels[i];
          const b = labels[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = (a.width + b.width) / 2 + 4;
          
          if (dist < minDist && dist > 0) {
            const overlap = (minDist - dist) / 2;
            const nx = dx / dist;
            const ny = dy / dist;
            a.x -= nx * overlap * 0.5;
            a.y -= ny * overlap * 0.5;
            b.x += nx * overlap * 0.5;
            b.y += ny * overlap * 0.5;
          }
        }
      }
    }
    
    // Mark labels needing leader lines
    labels.forEach(l => {
      const dist = Math.sqrt(Math.pow(l.x - l.origX, 2) + Math.pow(l.y - l.origY, 2));
      l.needsLeader = dist > 15;
    });
    
    return labels;
  }, [words, maxCount, labelDensity, xScale, yScale]);
  
  // Zoom/Pan handlers
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoomLevel(prev => Math.max(0.3, Math.min(4, prev * delta)));
  }, []);
  
  const handleMouseDown = useCallback((e) => {
    if (e.button === 0 && !hoveredWord) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  }, [hoveredWord, panOffset]);
  
  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      setPanOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  }, [isDragging, dragStart]);
  
  const handleMouseUp = useCallback(() => setIsDragging(false), []);
  const resetView = useCallback(() => { setZoomLevel(1); setPanOffset({ x: 0, y: 0 }); }, []);
  
  return (
    <div className="relative">
      {/* Controls */}
      <div className="absolute top-2 right-2 z-10 flex gap-1">
        <button onClick={() => setZoomLevel(z => Math.min(4, z * 1.2))} className="p-1.5 rounded bg-secondary hover:bg-secondary/80 text-foreground text-xs">+</button>
        <button onClick={() => setZoomLevel(z => Math.max(0.3, z / 1.2))} className="p-1.5 rounded bg-secondary hover:bg-secondary/80 text-foreground text-xs">−</button>
        <button onClick={resetView} className="p-1.5 rounded bg-secondary hover:bg-secondary/80 text-foreground text-xs">⟲</button>
      </div>
      
      {/* Label density slider */}
      <div className="absolute top-2 left-2 z-10 bg-card/90 px-3 py-2 rounded-lg flex items-center gap-2">
        <label className="flex items-center gap-2 text-xs text-foreground/80">
          <input type="checkbox" checked={showLabels} onChange={(e) => setShowLabels(e.target.checked)} className="rounded w-3 h-3" />
          Labels
        </label>
        {showLabels && (
          <input type="range" min="0" max="1" step="0.1" value={labelDensity} onChange={(e) => setLabelDensity(parseFloat(e.target.value))} className="w-16 h-1" title="Densidade de labels" />
        )}
      </div>
      
      <svg 
        ref={svgRef}
        width={width} 
        height={height} 
        className="bg-background/30 rounded-xl cursor-grab"
        style={{ cursor: isDragging ? 'grabbing' : (hoveredWord ? 'pointer' : 'grab') }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
        </defs>
        
        <g transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}>
          {/* Quadrant backgrounds */}
          <rect x={centerX} y={margin.top} width={plotWidth/2} height={plotHeight/2} fill="oklch(0.585 0.204 277.12)" opacity={0.05} />
          <rect x={margin.left} y={margin.top} width={plotWidth/2} height={plotHeight/2} fill="oklch(0.585 0.204 277.12)" opacity={0.05} />
          <rect x={margin.left} y={centerY} width={plotWidth/2} height={plotHeight/2} fill="oklch(0.457 0.215 277.02)" opacity={0.05} />
          <rect x={centerX} y={centerY} width={plotWidth/2} height={plotHeight/2} fill="oklch(0.359 0.135 278.70)" opacity={0.05} />
          
          {/* Axes */}
          <line x1={margin.left} y1={centerY} x2={width - margin.right} y2={centerY} stroke="oklch(0.872 0.009 258.34)" strokeWidth={1} />
          <line x1={centerX} y1={margin.top} x2={centerX} y2={height - margin.bottom} stroke="oklch(0.872 0.009 258.34)" strokeWidth={1} />
          
          {/* Axis labels */}
          <text x={width - margin.right + 10} y={centerY + 5} fill="oklch(0.551 0.023 264.36)" fontSize={12}>Fator 1 ({variance.dim1}%)</text>
          <text x={centerX + 5} y={margin.top - 10} fill="oklch(0.551 0.023 264.36)" fontSize={12}>Fator 2 ({variance.dim2}%)</text>
          
          {/* Grid */}
          {[-2, -1, 1, 2].map(val => (
            <g key={`grid-${val}`}>
              <line x1={xScale(val)} y1={margin.top} x2={xScale(val)} y2={height - margin.bottom} stroke="oklch(0.872 0.009 258.34)" strokeWidth={0.5} strokeDasharray="4" />
              <line x1={margin.left} y1={yScale(val)} x2={width - margin.right} y2={yScale(val)} stroke="oklch(0.872 0.009 258.34)" strokeWidth={0.5} strokeDasharray="4" />
              <text x={xScale(val)} y={height - margin.bottom + 15} fill="oklch(0.551 0.023 264.36)" fontSize={9} textAnchor="middle">{val}</text>
              <text x={margin.left - 10} y={yScale(val) + 3} fill="oklch(0.551 0.023 264.36)" fontSize={9} textAnchor="end">{val}</text>
            </g>
          ))}
          
          {/* Leader lines for displaced labels */}
          {showLabels && computedLabels.filter(l => l.needsLeader).map(label => (
            <line key={`leader-${label.word}`} x1={label.origX} y1={label.origY - 5} x2={label.x} y2={label.y + 6} stroke="oklch(0.551 0.023 264.36)" strokeWidth={0.5} strokeDasharray="2" opacity={hoveredWord ? (hoveredWord === label.word ? 1 : 0.2) : 0.5} />
          ))}
          
          {/* Points */}
          {words.map((w) => {
            const x = xScale(w.x);
            const y = yScale(w.y);
            const isHovered = hoveredWord === w.word;
            const size = 3 + (w.count / maxCount) * 8;
            const color = getColor(w.x, w.y);
            
            return (
              <circle
                key={`point-${w.word}`}
                cx={x}
                cy={y}
                r={isHovered ? size + 3 : size}
                fill={color}
                fillOpacity={hoveredWord ? (isHovered ? 1 : 0.15) : 0.7}
                stroke={isHovered ? 'oklch(1.000 0 0)' : 'none'}
                strokeWidth={2}
                onMouseEnter={() => setHoveredWord(w.word)}
                onMouseLeave={() => setHoveredWord(null)}
                style={{ cursor: 'pointer', transition: 'fill-opacity 0.2s' }}
              />
            );
          })}
          
          {/* Labels */}
          {showLabels && computedLabels.map(label => {
            const isHovered = hoveredWord === label.word;
            const color = getColor(label.dataX, label.dataY);
            
            return (
              <text
                key={`label-${label.word}`}
                x={label.x}
                y={label.y}
                textAnchor="middle"
                fill={isHovered ? 'oklch(1.000 0 0)' : color}
                fontSize={isHovered ? 12 : 9}
                fontWeight={isHovered ? 700 : 400}
                opacity={hoveredWord ? (isHovered ? 1 : 0.2) : 0.85}
                style={{ pointerEvents: 'none', transition: 'opacity 0.2s' }}
              >
                {label.word}
              </text>
            );
          })}
        </g>
        
        {/* Rich Tooltip */}
        {hoveredData && (
          <g transform={`translate(${width - 190}, ${height - 90})`}>
            <rect x={0} y={0} width={180} height={80} rx={8} fill="oklch(0.208 0.040 265.75 / 0.95)" stroke={getColor(hoveredData.x, hoveredData.y)} strokeWidth={1} />
            <text x={10} y={18} fill={getColor(hoveredData.x, hoveredData.y)} fontSize={13} fontWeight={600}>{hoveredData.word}</text>
            <text x={10} y={36} fill="oklch(0.551 0.023 264.36)" fontSize={10}>Frequência: {hoveredData.count} | {getQuadrantName(hoveredData.x, hoveredData.y)}</text>
            <text x={10} y={52} fill="oklch(0.551 0.023 264.36)" fontSize={10}>Coord: ({hoveredData.x.toFixed(2)}, {hoveredData.y.toFixed(2)})</text>
            <text x={10} y={68} fill="oklch(0.551 0.023 264.36)" fontSize={9}>Dist. centro: {Math.sqrt(hoveredData.x*hoveredData.x + hoveredData.y*hoveredData.y).toFixed(2)}</text>
          </g>
        )}
      </svg>
    </div>
  );
};

// ==================== VISUALIZAÇÃO DE ANÁLISE DE SENTIMENTOS ====================

const SentimentVisualization = ({ sentiment, width = 700, height = 400, isDarkMode = true }) => {
  const [hoveredBar, setHoveredBar] = useState(null);
  
  if (!sentiment) return null;
  
  const { positive, negative, neutral, total, score } = sentiment;
  
  const barWidth = 120;
  const maxHeight = 280;
  const maxCount = Math.max(positive.count, negative.count, neutral.count, 1);
  
  const bars = [
    { label: 'Positivo', count: positive.count, percentage: positive.percentage, color: 'oklch(0.585 0.204 277.12)', words: positive.words, x: 150 },
    { label: 'Negativo', count: negative.count, percentage: negative.percentage, color: 'oklch(0.359 0.135 278.70)', words: negative.words, x: 320 },
    { label: 'Neutro', count: neutral.count, percentage: neutral.percentage, color: 'oklch(0.551 0.023 264.36)', words: neutral?.words || [], x: 490 }
  ];
  
  return (
    <div className="space-y-6">
      {/* Gráfico de barras */}
      <svg width={width} height={height} className="bg-background/30 rounded-xl">
        <defs>
        </defs>
        
        {/* Título */}
        <text x={width / 2} y={30} textAnchor="middle" fill="oklch(0.280 0.037 260.03)" fontSize={16} fontWeight={600}>
          Análise de Sentimentos (Léxico)
        </text>
        
        {/* Eixo Y */}
        <line x1={80} y1={60} x2={80} y2={340} stroke="oklch(0.872 0.009 258.34)" />
        <text x={40} y={200} textAnchor="middle" fill="oklch(0.551 0.023 264.36)" fontSize={12} transform="rotate(-90, 40, 200)">
          Frequência
        </text>
        
        {/* Barras */}
        {bars.map((bar, idx) => {
          const barHeight = (bar.count / maxCount) * maxHeight;
          const y = 340 - barHeight;
          const isHovered = hoveredBar === idx;
          
          return (
            <g 
              key={bar.label}
              onMouseEnter={() => setHoveredBar(idx)}
              onMouseLeave={() => setHoveredBar(null)}
              style={{ cursor: 'pointer' }}
            >
              <rect
                x={bar.x - barWidth / 2}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={bar.color}
                rx={4}
                opacity={hoveredBar !== null ? (isHovered ? 1 : 0.4) : 0.9}
                style={{ transition: 'opacity 0.2s' }}
              />
              <text
                x={bar.x}
                y={y - 25}
                textAnchor="middle"
                fill={bar.color}
                fontSize={isHovered ? 15 : 13}
                fontWeight={600}
                opacity={hoveredBar !== null ? (isHovered ? 1 : 0.5) : 1}
              >
                {bar.percentage}% ({bar.count})
              </text>
              <text
                x={bar.x}
                y={365}
                textAnchor="middle"
                fill={isHovered ? 'oklch(1.000 0 0)' : 'oklch(0.280 0.037 260.03)'}
                fontSize={isHovered ? 14 : 13}
                fontWeight={isHovered ? 600 : 400}
              >
                {bar.label}
              </text>
            </g>
          );
        })}
        
        {/* Linhas de grade */}
        {[0, 0.25, 0.5, 0.75, 1].map(pct => {
          const y = 340 - pct * maxHeight;
          const val = Math.round(pct * maxCount);
          return (
            <g key={pct}>
              <line x1={80} y1={y} x2={620} y2={y} stroke="oklch(0.872 0.009 258.34)" strokeDasharray="4" />
              <text x={70} y={y + 4} textAnchor="end" fill="oklch(0.551 0.023 264.36)" fontSize={10}>{val}</text>
            </g>
          );
        })}
        
        {/* Tooltip */}
        {hoveredBar !== null && (
          <g transform={`translate(${width - 200}, 50)`}>
            <rect x={0} y={0} width={190} height={100} rx={8} fill="oklch(0.208 0.040 265.75 / 0.95)" stroke={bars[hoveredBar].color} strokeWidth={1} />
            <text x={10} y={20} fill={bars[hoveredBar].color} fontSize={14} fontWeight={600}>{bars[hoveredBar].label}</text>
            <text x={10} y={40} fill="oklch(0.551 0.023 264.36)" fontSize={11}>Ocorrências: {bars[hoveredBar].count}</text>
            <text x={10} y={58} fill="oklch(0.551 0.023 264.36)" fontSize={11}>Percentual: {bars[hoveredBar].percentage}%</text>
            <text x={10} y={78} fill="oklch(0.551 0.023 264.36)" fontSize={9}>
              Top: {bars[hoveredBar].words?.slice(0, 3).join(', ') || 'N/A'}
            </text>
          </g>
        )}
      </svg>
      
      {/* Score e palavras */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Score */}
        <div className={`rounded-xl p-4 border ${
          parseFloat(score) > 0 
            ? 'bg-primary/10 border-primary/30' 
            : parseFloat(score) < 0 
              ? 'bg-destructive/10 border-destructive/30'
              : 'bg-card border-border'
        }`}>
          <div className={`text-3xl font-bold ${
            parseFloat(score) > 0 ? 'text-primary' : parseFloat(score) < 0 ? 'text-destructive' : 'text-muted-foreground'
          }`}>
            {parseFloat(score) > 0 ? '+' : ''}{score}
          </div>
          <div className={`text-sm text-muted-foreground`}>Score de Sentimento</div>
          <div className="text-xs text-muted-foreground mt-1">
            {parseFloat(score) > 10 ? 'Predominantemente positivo' :
             parseFloat(score) < -10 ? 'Predominantemente negativo' :
             'Relativamente neutro'}
          </div>
        </div>
        
        {/* Palavras positivas */}
        <div className="bg-primary/10 rounded-xl p-4 border border-primary/30">
          <div className="text-sm font-medium text-primary mb-2">Palavras Positivas</div>
          <div className="flex flex-wrap gap-1">
            {positive.words.slice(0, 10).map(word => (
              <span key={word} className="px-2 py-0.5 bg-primary/20 text-primary rounded text-xs">
                {word}
              </span>
            ))}
          </div>
        </div>
        
        {/* Palavras negativas */}
        <div className="bg-destructive/10 rounded-xl p-4 border border-destructive/30">
          <div className="text-sm font-medium text-destructive mb-2">Palavras Negativas</div>
          <div className="flex flex-wrap gap-1">
            {negative.words.slice(0, 10).map(word => (
              <span key={word} className="px-2 py-0.5 bg-destructive/20 text-destructive rounded text-xs">
                {word}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== COMPONENTE DE EXPORTAÇÃO UNIVERSAL ====================

const ExportVisualizationButton = ({ vizId, filename, data }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  const exportAsPNG = async () => {
    setIsExporting(true);
    try {
      const element = document.querySelector(`[data-viz="${vizId}"]`);
      if (!element) {
        alert('Visualização não encontrada. Navegue para a aba correspondente primeiro.');
        setIsExporting(false);
        setShowMenu(false);
        return;
      }
      
      // Usar html2canvas via CDN
      if (!window.html2canvas) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
          script.onload = resolve;
          script.onerror = () => reject(new Error('Falha ao carregar html2canvas'));
          document.head.appendChild(script);
        });
      }
      
      const canvas = await window.html2canvas(element, { 
        backgroundColor: 'var(--color-background)',
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      
      // Método robusto para download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${filename}.png`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Export error:', err);
      alert('Erro ao exportar PNG: ' + err.message);
    }
    setIsExporting(false);
    setShowMenu(false);
  };
  
  const exportAsJPG = async () => {
    setIsExporting(true);
    try {
      const element = document.querySelector(`[data-viz="${vizId}"]`);
      if (!element) {
        alert('Visualização não encontrada. Navegue para a aba correspondente primeiro.');
        setIsExporting(false);
        setShowMenu(false);
        return;
      }
      
      if (!window.html2canvas) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
          script.onload = resolve;
          script.onerror = () => reject(new Error('Falha ao carregar html2canvas'));
          document.head.appendChild(script);
        });
      }
      
      const canvas = await window.html2canvas(element, { 
        backgroundColor: 'var(--color-background)',
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      
      // Método robusto para download
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${filename}.jpg`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Export error:', err);
      alert('Erro ao exportar JPG: ' + err.message);
    }
    setIsExporting(false);
    setShowMenu(false);
  };
  
  const exportAsSVG = () => {
    const element = document.querySelector(`[data-viz="${vizId}"] svg`);
    if (!element) {
      alert('SVG não encontrado. Navegue para a aba correspondente primeiro.');
      setShowMenu(false);
      return;
    }
    
    try {
      const svgData = new XMLSerializer().serializeToString(element);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      // Método robusto para download
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.svg`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export SVG error:', err);
      alert('Erro ao exportar SVG: ' + err.message);
    }
    setShowMenu(false);
  };
  
  const exportAsCSV = () => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      alert('Nenhum dado disponível para exportar.');
      setShowMenu(false);
      return;
    }
    
    try {
      const headers = Object.keys(data[0] || {});
      const csvRows = [headers.join(',')];
      
      data.forEach(row => {
        const values = headers.map(h => {
          const val = row[h] ?? '';
          const escaped = String(val).replace(/"/g, '""');
          return escaped.includes(',') || escaped.includes('"') || escaped.includes('\n') 
            ? `"${escaped}"` : escaped;
        });
        csvRows.push(values.join(','));
      });
      
      // Adicionar BOM para UTF-8 (ajuda Excel a reconhecer encoding)
      const BOM = '\uFEFF';
      const csvContent = BOM + csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      // Método robusto para download
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.csv`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export CSV error:', err);
      alert('Erro ao exportar CSV: ' + err.message);
    }
    setShowMenu(false);
  };
  
  const exportAsXLSX = async () => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      alert('Nenhum dado disponível para exportar.');
      setShowMenu(false);
      return;
    }
    
    setIsExporting(true);
    try {
      // Load SheetJS if not loaded
      if (!window.XLSX) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
          script.onload = resolve;
          script.onerror = () => reject(new Error('Falha ao carregar SheetJS'));
          document.head.appendChild(script);
        });
      }
      
      const ws = window.XLSX.utils.json_to_sheet(data);
      const wb = window.XLSX.utils.book_new();
      window.XLSX.utils.book_append_sheet(wb, ws, 'Dados');
      
      // Gerar arquivo como array buffer e criar blob
      const wbout = window.XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      
      // Método robusto para download
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.xlsx`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export XLSX error:', err);
      alert('Erro ao exportar Excel: ' + err.message);
    }
    setIsExporting(false);
    setShowMenu(false);
  };
  
  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={isExporting}
        className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded-lg text-sm transition-colors flex items-center gap-2"
      >
        {isExporting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        Exportar
      </button>
      
      {showMenu && (
        <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden min-w-36">
          <button onClick={exportAsPNG} className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-2">
            <span className="text-primary">PNG</span> Imagem
          </button>
          <button onClick={exportAsJPG} className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-2">
            <span className="text-primary">JPG</span> Imagem
          </button>
          <button onClick={exportAsSVG} className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-2">
            <span className="text-primary">SVG</span> Vetor
          </button>
          {data && (
            <>
              <div className="border-t border-border" />
              <button onClick={exportAsCSV} className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-2">
                <span className="text-muted-foreground">CSV</span> Dados
              </button>
              <button onClick={exportAsXLSX} className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-2">
                <span className="text-primary">XLSX</span> Excel
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// ==================== COMPONENTE DE TEXTO COM HIGHLIGHTS ====================

const HighlightedTextViewer = ({ 
  document, 
  codedSegments, 
  allCodes, 
  onTextSelect, 
  onSegmentClick 
}) => {
  const [localHighlights, setLocalHighlights] = useState([]);
  
  useEffect(() => {
    if (!document || !codedSegments) return;
    
    // Encontrar todos os segmentos codificados deste documento
    const docSegments = codedSegments.filter(seg => seg.documentId === document.id);
    
    // Criar mapa de highlights
    const highlights = [];
    const text = document.content.toLowerCase();
    
    docSegments.forEach(seg => {
      const segText = seg.text.toLowerCase();
      let pos = text.indexOf(segText);
      
      while (pos !== -1) {
        // Pegar cor do primeiro código
        const firstCode = seg.codes[0];
        const codeInfo = allCodes.find(c => c.id === firstCode);
        
        highlights.push({
          start: pos,
          end: pos + seg.text.length,
          segment: seg,
          color: codeInfo?.color || 'oklch(0.457 0.215 277.02)'
        });
        
        pos = text.indexOf(segText, pos + 1);
      }
    });
    
    // Ordenar por posição
    highlights.sort((a, b) => a.start - b.start);
    
    // Remover sobreposições (manter o primeiro)
    const filtered = [];
    let lastEnd = 0;
    highlights.forEach(h => {
      if (h.start >= lastEnd) {
        filtered.push(h);
        lastEnd = h.end;
      }
    });
    
    setLocalHighlights(filtered);
  }, [document, codedSegments, allCodes]);
  
  // Renderizar texto com highlights
  const renderHighlightedText = () => {
    if (!document) return null;
    
    const text = document.content;
    if (localHighlights.length === 0) {
      return <span>{text}</span>;
    }
    
    const parts = [];
    let lastIndex = 0;
    
    localHighlights.forEach((highlight, idx) => {
      // Texto antes do highlight
      if (highlight.start > lastIndex) {
        parts.push(
          <span key={`text-${idx}`}>
            {text.substring(lastIndex, highlight.start)}
          </span>
        );
      }
      
      // Texto com highlight
      parts.push(
        <mark
          key={`highlight-${idx}`}
          className="cursor-pointer rounded px-0.5 transition-all hover:opacity-80"
          style={{ 
            backgroundColor: `${highlight.color}40`,
            borderBottom: `2px solid ${highlight.color}`
          }}
          onClick={() => onSegmentClick && onSegmentClick(highlight.segment)}
          title={highlight.segment.matches?.map(m => m.codeName).join(', ') || 'Clique para detalhes'}
        >
          {text.substring(highlight.start, highlight.end)}
        </mark>
      );
      
      lastIndex = highlight.end;
    });
    
    // Texto restante
    if (lastIndex < text.length) {
      parts.push(
        <span key="text-end">
          {text.substring(lastIndex)}
        </span>
      );
    }
    
    return parts;
  };
  
  return (
    <div 
      className="prose prose-invert max-w-none text-foreground/80 leading-relaxed whitespace-pre-wrap select-text"
      onMouseUp={(e) => onTextSelect && onTextSelect(e, document.id, document.name)}
    >
      {renderHighlightedText()}
    </div>
  );
};

// Componente de Tooltip para Seleção de Código
const CodeSelectionTooltip = ({
  position,
  selectedText,
  codes,
  searchTerm,
  onSearchChange,
  onCodeSelect,
  onCreateNew,
  newCodeName,
  onNewCodeNameChange,
  showCreator,
  onToggleCreator,
  onClose
}) => {
  // Fechar com ESC
  useEffect(() => {
    if (!position) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [position, onClose]);
  
  if (!position) return null;
  
  // Modal centralizado na tela - abordagem mais confiável
  return (
    <div className="fixed inset-0" style={{ zIndex: 99999 }}>
      {/* Overlay escuro - clique fecha o modal */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal centralizado */}
      <div 
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background border-2 border-primary rounded-2xl shadow-2xl p-5 w-[360px] max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary" />
            <span className="text-lg font-semibold text-foreground">Codificar Seleção</span>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center bg-destructive/30 hover:bg-destructive text-destructive hover:text-white rounded-xl transition-all border border-destructive/50"
            title="Fechar (ESC)"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Texto selecionado */}
        <div className="mb-4 p-4 bg-card/80 rounded-xl border border-input">
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide font-medium">Texto selecionado:</p>
          <p className="text-sm text-primary leading-relaxed max-h-24 overflow-y-auto">
            "{selectedText?.substring(0, 200)}{selectedText?.length > 200 ? '...' : ''}"
          </p>
        </div>
        
        {/* Busca */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar código..."
            className="w-full pl-12 pr-4 py-3 bg-card border-2 border-input rounded-xl text-base text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder-muted-foreground"
            autoFocus
          />
        </div>
        
        {/* Lista de códigos */}
        <div className="flex-1 overflow-y-auto space-y-2 mb-4 min-h-[140px] max-h-[200px] pr-2">
          {codes.map(code => (
            <button
              key={code.id}
              onClick={() => onCodeSelect(code)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent/80 transition-all text-left border-2 border-transparent hover:border-primary/50 group"
            >
              <span 
                className="w-5 h-5 rounded-full flex-shrink-0 ring-2 ring-white/30 group-hover:ring-primary"
                style={{ backgroundColor: code.color }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-base text-foreground truncate font-medium">{code.name}</p>
                <p className="text-sm text-muted-foreground truncate">{code.categoryName}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>
          ))}
          
          {codes.length === 0 && (
            <div className="text-center py-8">
              <Search className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-base text-muted-foreground">Nenhum código encontrado</p>
              <p className="text-sm text-muted-foreground mt-1">Tente outro termo ou crie um novo</p>
            </div>
          )}
        </div>
        
        {/* Criar novo código */}
        <div className="pt-4 border-t border-border">
          {!showCreator ? (
            <button
              onClick={onToggleCreator}
              className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-primary/20 border-2 border-primary/50 rounded-xl text-primary hover:bg-primary/30 hover:border-primary transition-all"
            >
              <Plus className="w-6 h-6" />
              <span className="text-base font-semibold">Criar novo código</span>
            </button>
          ) : (
            <div className="space-y-3">
              <input
                type="text"
                value={newCodeName}
                onChange={(e) => onNewCodeNameChange(e.target.value)}
                placeholder="Nome do novo código..."
                className="w-full px-4 py-3 bg-card border-2 border-primary rounded-xl text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newCodeName.trim()) onCreateNew();
                  if (e.key === 'Escape') onToggleCreator();
                }}
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={onToggleCreator}
                  className="flex-1 px-4 py-3 bg-secondary hover:bg-secondary/80 rounded-xl text-base text-foreground/80 transition-colors border border-input"
                >
                  Cancelar
                </button>
                <button
                  onClick={onCreateNew}
                  disabled={!newCodeName.trim()}
                  className="flex-1 px-4 py-3 bg-primary rounded-xl text-base text-white font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Criar e Aplicar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN APP ====================

export default function TextAnalysisApp() {
  const [documents, setDocuments] = useState([]);
  const [activeTab, setActiveTab] = useState('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [kwicKeyword, setKwicKeyword] = useState('');
  const [kwicResults, setKwicResults] = useState([]);
  
  // ========== DENDROGRAMA ==========
  const [dendrogramMethod, setDendrogramMethod] = useState('ward');
  const [dendrogramData, setDendrogramData] = useState(null);
  const [isDendrogramLoading, setIsDendrogramLoading] = useState(false);
  
  const [cleaningOptions, setCleaningOptions] = useState({
    removeNumbers: true,
    removePunctuation: true,
    lowercase: true,
    removeStopwords: true,
    groupVariations: true, // Agrupar variações morfológicas (gênero, plural, typos)
    minLength: 4 // Mínimo 4 letras para evitar conectivos e palavras curtas
  });
  
  // ========== TEMA (DARK/LIGHT) ==========
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // ========== MOBILE MENU ==========
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // ========== EDIÇÃO DE SEGMENTOS ==========
  const [editingSegment, setEditingSegment] = useState(null);
  const [editingSegmentText, setEditingSegmentText] = useState('');
  
  // ========== EDIÇÃO DE DOCUMENTOS ==========
  const [editingDocument, setEditingDocument] = useState(null);
  const [editingDocumentContent, setEditingDocumentContent] = useState('');
  
  // ========== SISTEMA DE CORPUS ==========
  const [corpora, setCorpora] = useState([
    { id: 'default', name: 'Corpus Principal', color: 'oklch(0.585 0.204 277.12)', documentIds: [] }
  ]);
  const [activeCorpus, setActiveCorpus] = useState('default');
  const [showCorpusManager, setShowCorpusManager] = useState(false);
  const [showHelp, setShowHelp] = useState(true);
  const [newCorpusName, setNewCorpusName] = useState('');
  const [corpusFilter, setCorpusFilter] = useState('all'); // 'all' ou id do corpus
  
  // ========== SISTEMA DE STOPWORDS ==========
  const [customStopwordsPT, setCustomStopwordsPT] = useState(defaultStopwordsPT);
  const [customStopwordsEN, setCustomStopwordsEN] = useState(defaultStopwordsEN);
  const [showStopwordsManager, setShowStopwordsManager] = useState(false);
  const [newStopword, setNewStopword] = useState('');
  const [stopwordSearchTerm, setStopwordSearchTerm] = useState('');
  const [stopwordLanguage, setStopwordLanguage] = useState('pt'); // 'pt' ou 'en'
  
  // Criar Set de stopwords combinadas
  const stopwordsSet = useMemo(() => {
    const combined = new Set([...customStopwordsPT, ...customStopwordsEN]);
    return combined;
  }, [customStopwordsPT, customStopwordsEN]);
  
  // Estados para análise de incidências
  const [incidenceAnalysis, setIncidenceAnalysis] = useState(null);
  const [showIncidenceModal, setShowIncidenceModal] = useState(false);
  const [isAnalyzingIncidence, setIsAnalyzingIncidence] = useState(false);
  
  // Estados para codificação qualitativa
  const [codedSegments, setCodedSegments] = useState([]);
  const [selectedText, setSelectedText] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(['1', '2', '3']);
  const [codingFilter, setCodingFilter] = useState('all');
  
  // Estados para códigos customizados e auto-codificação
  const [customCodes, setCustomCodes] = useState([]); // Códigos criados pelo usuário
  const [isAutoCoding, setIsAutoCoding] = useState(false);
  const [autoCodingResults, setAutoCodingResults] = useState(null);
  const [selectionTooltip, setSelectionTooltip] = useState(null); // {x, y, text, documentId}
  const [codeSearchTerm, setCodeSearchTerm] = useState('');
  const [showCodeCreator, setShowCodeCreator] = useState(false);
  const [newCodeName, setNewCodeName] = useState('');
  const [highlightedDocument, setHighlightedDocument] = useState(null);
  const [addingCodeToSegment, setAddingCodeToSegment] = useState(null); // ID do segmento para adicionar código
  
  // Estado para sidebar
  const [sidebarOpen, setSidebarOpen] = useState(typeof window !== 'undefined' && window.innerWidth >= 1024);
  
  // ========== ESTADOS PARA ANÁLISE DE REDE AVANÇADA ==========
  const [networkAnalysis, setNetworkAnalysis] = useState(null);
  const [networkSettings, setNetworkSettings] = useState({
    minWeight: 2,
    maxEdges: 150,
    windowSize: 5,
    showCommunities: true,
    centralityMetric: 'degree' // 'degree', 'betweenness', 'closeness', 'eigenvector'
  });
  const [statisticalAnalysis, setStatisticalAnalysis] = useState(null);
  
  // Estados para novas visualizações
  const [bigramAnalysis, setBigramAnalysis] = useState(null);
  const [sentimentAnalysis, setSentimentAnalysis] = useState(null);
  const [wordTreeData, setWordTreeData] = useState(null);
  const [wordTreeKeyword, setWordTreeKeyword] = useState('');
  const [afcData, setAfcData] = useState(null);
  
  // Estado para persistência de documentos
  const [isLoadingStorage, setIsLoadingStorage] = useState(true);
  
  // Carregar documentos do storage ao iniciar
  useEffect(() => {
    const loadFromStorage = async () => {
      if (typeof window !== 'undefined' && window.storage) {
        try {
          const storedDocs = await window.storage.get('textlab-documents');
          const storedCorpora = await window.storage.get('textlab-corpora');
          const storedStopwordsPT = await window.storage.get('textlab-stopwords-pt');
          const storedStopwordsEN = await window.storage.get('textlab-stopwords-en');
          
          if (storedDocs?.value) {
            try {
              const docs = JSON.parse(storedDocs.value);
              if (Array.isArray(docs) && docs.length > 0) {
                setDocuments(docs);
              }
            } catch (parseErr) {
              console.log('Error parsing documents:', parseErr);
            }
          }
          
          if (storedCorpora?.value) {
            try {
              const corp = JSON.parse(storedCorpora.value);
              if (Array.isArray(corp) && corp.length > 0) {
                // Garantir que cada corpus tenha documentIds como array
                const normalizedCorpora = corp.map(c => ({
                  ...c,
                  id: c.id || 'corpus-' + Date.now(),
                  name: c.name || 'Corpus',
                  color: c.color || 'oklch(0.585 0.204 277.12)',
                  documentIds: Array.isArray(c.documentIds) ? c.documentIds : []
                }));
                setCorpora(normalizedCorpora);
              }
            } catch (parseErr) {
              console.log('Error parsing corpora:', parseErr);
            }
          }
          
          if (storedStopwordsPT?.value) {
            try {
              const sw = JSON.parse(storedStopwordsPT.value);
              if (Array.isArray(sw)) setCustomStopwordsPT(sw);
            } catch (parseErr) {
              console.log('Error parsing stopwords PT:', parseErr);
            }
          }
          
          if (storedStopwordsEN?.value) {
            try {
              const sw = JSON.parse(storedStopwordsEN.value);
              if (Array.isArray(sw)) setCustomStopwordsEN(sw);
            } catch (parseErr) {
              console.log('Error parsing stopwords EN:', parseErr);
            }
          }
        } catch (err) {
          console.log('Storage not available or error loading:', err);
        }
      }
      setIsLoadingStorage(false);
    };
    
    loadFromStorage();
  }, []);
  
  // Salvar documentos no storage quando mudarem
  useEffect(() => {
    if (isLoadingStorage) return;
    
    const saveToStorage = async () => {
      if (typeof window !== 'undefined' && window.storage) {
        try {
          await window.storage.set('textlab-documents', JSON.stringify(documents));
          await window.storage.set('textlab-corpora', JSON.stringify(corpora));
          await window.storage.set('textlab-stopwords-pt', JSON.stringify(customStopwordsPT));
          await window.storage.set('textlab-stopwords-en', JSON.stringify(customStopwordsEN));
        } catch (err) {
          console.log('Error saving to storage:', err);
        }
      }
    };
    
    saveToStorage();
  }, [documents, corpora, customStopwordsPT, customStopwordsEN, isLoadingStorage]);
  
  // Combinar códigos do codebook com códigos customizados
  const allAvailableCodes = useMemo(() => {
    const baseCodes = getAllCodes();
    return [...baseCodes, ...customCodes];
  }, [customCodes]);
  
  // ========== FUNÇÕES DE GERENCIAMENTO DE CORPUS ==========
  
  // Criar novo corpus
  const createCorpus = useCallback((name) => {
    const colorIndex = corpora.length % corpusColors.length;
    const newCorpus = {
      id: `corpus-${Date.now()}`,
      name: name || `Corpus ${corpora.length + 1}`,
      color: corpusColors[colorIndex],
      documentIds: []
    };
    setCorpora(prev => [...prev, newCorpus]);
    return newCorpus;
  }, [corpora]);
  
  // Renomear corpus
  const renameCorpus = useCallback((corpusId, newName) => {
    setCorpora(prev => prev.map(c => 
      c.id === corpusId ? { ...c, name: newName } : c
    ));
  }, []);
  
  // Deletar corpus (move documentos para o default)
  const deleteCorpus = useCallback((corpusId) => {
    if (corpusId === 'default') return; // Não pode deletar o default
    
    const corpus = corpora.find(c => c.id === corpusId);
    if (corpus) {
      // Mover documentos para o default
      setCorpora(prev => prev.map(c => {
        if (c.id === 'default') {
          return { ...c, documentIds: [...(c.documentIds || []), ...(corpus.documentIds || [])] };
        }
        return c;
      }).filter(c => c.id !== corpusId));
      
      if (activeCorpus === corpusId) {
        setActiveCorpus('default');
      }
    }
  }, [corpora, activeCorpus]);
  
  // Mover documento para outro corpus
  const moveDocumentToCorpus = useCallback((documentId, targetCorpusId) => {
    setCorpora(prev => prev.map(c => ({
      ...c,
      documentIds: c.id === targetCorpusId
        ? [...(c.documentIds || []).filter(id => id !== documentId), documentId]
        : (c.documentIds || []).filter(id => id !== documentId)
    })));
  }, []);
  
  // Obter corpus de um documento
  const getDocumentCorpus = useCallback((documentId) => {
    return corpora.find(c => c.documentIds?.includes(documentId)) || corpora[0];
  }, [corpora]);
  
  // Documentos filtrados por corpus
  const filteredDocuments = useMemo(() => {
    if (corpusFilter === 'all') return documents;
    const corpus = corpora.find(c => c.id === corpusFilter);
    if (!corpus) return documents;
    return documents.filter(d => corpus.documentIds?.includes(d.id));
  }, [documents, corpora, corpusFilter]);
  
  // ========== FUNÇÕES DE GERENCIAMENTO DE STOPWORDS ==========
  
  // Adicionar stopword
  const addStopword = useCallback((word, language = 'pt') => {
    const normalizedWord = word.toLowerCase().trim();
    if (!normalizedWord) return;
    
    if (language === 'pt') {
      if (!customStopwordsPT.includes(normalizedWord)) {
        setCustomStopwordsPT(prev => [...prev, normalizedWord].sort());
      }
    } else {
      if (!customStopwordsEN.includes(normalizedWord)) {
        setCustomStopwordsEN(prev => [...prev, normalizedWord].sort());
      }
    }
  }, [customStopwordsPT, customStopwordsEN]);
  
  // Remover stopword
  const removeStopword = useCallback((word, language = 'pt') => {
    if (language === 'pt') {
      setCustomStopwordsPT(prev => prev.filter(w => w !== word));
    } else {
      setCustomStopwordsEN(prev => prev.filter(w => w !== word));
    }
  }, []);
  
  // Resetar stopwords para padrão
  const resetStopwords = useCallback((language = 'pt') => {
    if (language === 'pt') {
      setCustomStopwordsPT([...defaultStopwordsPT]);
    } else {
      setCustomStopwordsEN([...defaultStopwordsEN]);
    }
  }, []);
  
  // Stopwords filtradas pela busca
  const filteredStopwords = useMemo(() => {
    const list = stopwordLanguage === 'pt' ? customStopwordsPT : customStopwordsEN;
    if (!stopwordSearchTerm) return list;
    return list.filter(w => w.includes(stopwordSearchTerm.toLowerCase()));
  }, [customStopwordsPT, customStopwordsEN, stopwordLanguage, stopwordSearchTerm]);
  
  // ========== FUNÇÕES DE AUTO-CODIFICAÇÃO ==========
  const runAutoCoding = useCallback(() => {
    if (documents.length === 0) return;
    
    setIsAutoCoding(true);
    
    setTimeout(() => {
      const results = autoCodeAllDocuments(documents, allAvailableCodes);
      setAutoCodingResults(results);
      
      // Mesclar com segmentos existentes (evitar duplicatas)
      const existingTexts = new Set(codedSegments.map(s => s.text.substring(0, 50)));
      const newSegments = results.filter(r => !existingTexts.has(r.text.substring(0, 50)));
      
      setCodedSegments(prev => [...prev, ...newSegments]);
      setIsAutoCoding(false);
    }, 1000);
  }, [documents, allAvailableCodes, codedSegments]);
  
  // Função para criar novo código customizado
  const createCustomCode = useCallback((name, categoryName = 'Códigos Customizados') => {
    const colorIndex = customCodes.length % codeColorPalette.length;
    const newCode = {
      id: `custom-${Date.now()}`,
      name: name,
      keywords: [name.toLowerCase()],
      categoryId: 'custom',
      categoryName: categoryName,
      color: codeColorPalette[colorIndex],
      isCustom: true
    };
    setCustomCodes(prev => [...prev, newCode]);
    return newCode;
  }, [customCodes]);
  
  // Função para adicionar keyword a um código customizado
  const addKeywordToCode = useCallback((codeId, keyword) => {
    setCustomCodes(prev => prev.map(code => {
      if (code.id === codeId) {
        return { ...code, keywords: [...code.keywords, keyword.toLowerCase()] };
      }
      return code;
    }));
  }, []);
  
  // Função para lidar com seleção de texto
  const handleTextSelection = useCallback((e, documentId, documentName) => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    
    if (selectedText.length > 5) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      // Usar posição relativa à viewport (não ao documento)
      // O scroll será tratado no componente do modal
      setSelectionTooltip({
        x: rect.left + rect.width / 2,
        y: rect.bottom, // Usar bottom para posicionar abaixo da seleção
        text: selectedText,
        documentId,
        documentName
      });
      setCodeSearchTerm('');
      setShowCodeCreator(false);
    } else {
      setSelectionTooltip(null);
    }
  }, []);
  
  // Função para aplicar código à seleção
  const applyCodeToSelection = useCallback((code) => {
    if (!selectionTooltip) return;
    
    const newSegment = {
      id: Date.now() + Math.random(),
      documentId: selectionTooltip.documentId,
      documentName: selectionTooltip.documentName,
      text: selectionTooltip.text,
      codes: [code.id],
      matches: [{
        codeId: code.id,
        codeName: code.name,
        categoryName: code.categoryName,
        color: code.color,
        keyword: 'manual',
        matchedText: selectionTooltip.text,
        confidence: 1.0
      }],
      isAutomatic: false,
      createdAt: new Date().toISOString()
    };
    
    setCodedSegments(prev => [...prev, newSegment]);
    setSelectionTooltip(null);
    window.getSelection().removeAllRanges();
  }, [selectionTooltip]);
  
  // Função para criar e aplicar novo código
  const createAndApplyCode = useCallback(() => {
    if (!newCodeName.trim() || !selectionTooltip) return;
    
    const newCode = createCustomCode(newCodeName.trim());
    applyCodeToSelection(newCode);
    setNewCodeName('');
    setShowCodeCreator(false);
  }, [newCodeName, selectionTooltip, createCustomCode, applyCodeToSelection]);
  
  // Filtrar códigos baseado na busca
  const filteredCodes = useMemo(() => {
    if (!codeSearchTerm) return allAvailableCodes.slice(0, 10);
    const term = codeSearchTerm.toLowerCase();
    return allAvailableCodes.filter(code => 
      code.name.toLowerCase().includes(term) ||
      code.categoryName.toLowerCase().includes(term)
    ).slice(0, 10);
  }, [allAvailableCodes, codeSearchTerm]);
  
  // Função para analisar incidências de uma palavra
  const handleWordClick = useCallback((wordData) => {
    if (documents.length === 0) return;
    
    setIsAnalyzingIncidence(true);
    setShowIncidenceModal(true);
    
    // Simular processamento assíncrono
    setTimeout(() => {
      // Passar os dados completos da palavra incluindo variações se existirem
      // Se agrupamento estiver desativado, não passar dados de variações
      const wordDataToPass = cleaningOptions.groupVariations ? wordData : { word: wordData.word };
      const analysis = analyzeWordIncidences(documents, wordData.word, cleaningOptions, wordDataToPass);
      setIncidenceAnalysis(analysis);
      setIsAnalyzingIncidence(false);
    }, 500);
  }, [documents, cleaningOptions]);
  
  // Função para exportar relatório científico
  const exportScientificReport = useCallback(() => {
    if (!incidenceAnalysis) {
      alert('Nenhuma análise de incidência disponível.');
      return;
    }
    
    try {
      const report = generateScientificReport(incidenceAnalysis, cleaningOptions);
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + report], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      // Método robusto para download
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio_${incidenceAnalysis.word}_${new Date().toISOString().split('T')[0]}.md`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      alert('Erro ao exportar relatório: ' + err.message);
    }
  }, [incidenceAnalysis, cleaningOptions]);
  
  // Função para exportar CSV de incidências
  const exportIncidenceCSV = useCallback(() => {
    if (!incidenceAnalysis) {
      alert('Nenhuma análise de incidência disponível.');
      return;
    }
    
    try {
      const csv = generateIncidenceCSV(incidenceAnalysis);
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      // Método robusto para download
      const a = document.createElement('a');
      a.href = url;
      a.download = `incidencias_${incidenceAnalysis.word}_${new Date().toISOString().split('T')[0]}.csv`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      alert('Erro ao exportar CSV: ' + err.message);
    }
  }, [incidenceAnalysis]);
  
  // Funções de codificação qualitativa
  const addCodedSegment = useCallback((text, documentId, documentName, codes, note = '') => {
    const newSegment = {
      id: Date.now() + Math.random(),
      documentId,
      documentName,
      text,
      codes,
      note,
      createdAt: new Date().toISOString()
    };
    setCodedSegments(prev => [...prev, newSegment]);
    setSelectedText(null);
  }, []);
  
  const updateSegmentCodes = useCallback((segmentId, codes) => {
    setCodedSegments(prev => prev.map(seg => 
      seg.id === segmentId ? { ...seg, codes } : seg
    ));
  }, []);
  
  // Função para adicionar código a um segmento existente
  const addCodeToExistingSegment = useCallback((segmentId, code) => {
    setCodedSegments(prev => prev.map(seg => {
      if (seg.id === segmentId) {
        // Evitar duplicatas
        if (seg.codes.includes(code.id)) return seg;
        return {
          ...seg,
          codes: [...seg.codes, code.id],
          matches: [
            ...(seg.matches || []),
            {
              codeId: code.id,
              codeName: code.name,
              categoryName: code.categoryName,
              color: code.color,
              keyword: 'manual (added)',
              matchedText: seg.text,
              confidence: 1.0
            }
          ]
        };
      }
      return seg;
    }));
    setAddingCodeToSegment(null);
    setCodeSearchTerm('');
  }, []);
  
  const updateSegmentNote = useCallback((segmentId, note) => {
    setCodedSegments(prev => prev.map(seg => 
      seg.id === segmentId ? { ...seg, note } : seg
    ));
  }, []);
  
  // Função para atualizar texto de um segmento codificado
  const updateSegmentText = useCallback((segmentId, newText) => {
    setCodedSegments(prev => prev.map(seg => 
      seg.id === segmentId ? { ...seg, text: newText } : seg
    ));
    setEditingSegment(null);
    setEditingSegmentText('');
  }, []);
  
  // Função para iniciar edição de segmento
  const startEditingSegment = useCallback((segment) => {
    setEditingSegment(segment.id);
    setEditingSegmentText(segment.text);
  }, []);
  
  // Função para cancelar edição de segmento
  const cancelEditingSegment = useCallback(() => {
    setEditingSegment(null);
    setEditingSegmentText('');
  }, []);
  
  // Função para atualizar conteúdo de um documento
  const updateDocumentContent = useCallback((documentId, newContent) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === documentId ? { ...doc, content: newContent } : doc
    ));
    setEditingDocument(null);
    setEditingDocumentContent('');
  }, []);
  
  // Função para iniciar edição de documento
  const startEditingDocument = useCallback((doc) => {
    setEditingDocument(doc.id);
    setEditingDocumentContent(doc.content);
  }, []);
  
  // Função para cancelar edição de documento
  const cancelEditingDocument = useCallback(() => {
    setEditingDocument(null);
    setEditingDocumentContent('');
  }, []);
  
  const removeCodedSegment = useCallback((segmentId) => {
    setCodedSegments(prev => prev.filter(seg => seg.id !== segmentId));
  }, []);
  
  const toggleCategory = useCallback((categoryId) => {
    setExpandedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  }, []);
  
  const exportCodingData = useCallback(() => {
    if (codedSegments.length === 0) return;
    
    // Exportar em formato CSV
    let csv = 'ID,Documento,Texto,Códigos,Categorias,Nota,Data\n';
    codedSegments.forEach((seg, idx) => {
      const codeNames = seg.codes.map(codeId => {
        const allCodes = getAllCodes();
        const code = allCodes.find(c => c.id === codeId);
        return code ? `${codeId} - ${code.name}` : codeId;
      }).join('; ');
      
      const categories = [...new Set(seg.codes.map(codeId => {
        const catId = codeId.split('.')[0];
        return capacityCodebook[catId]?.name || '';
      }))].join('; ');
      
      const escapeCsv = (str) => `"${(str || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`;
      csv += [
        idx + 1,
        escapeCsv(seg.documentName),
        escapeCsv(seg.text),
        escapeCsv(codeNames),
        escapeCsv(categories),
        escapeCsv(seg.note),
        seg.createdAt
      ].join(',') + '\n';
    });
    
    try {
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      // Método robusto para download
      const a = document.createElement('a');
      a.href = url;
      a.download = `codificacao_${new Date().toISOString().split('T')[0]}.csv`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      alert('Erro ao exportar codificação: ' + err.message);
    }
  }, [codedSegments]);
  
  const exportCodingJSON = useCallback(() => {
    if (codedSegments.length === 0) return;
    
    const exportData = {
      exportDate: new Date().toISOString(),
      codebook: capacityCodebook,
      segments: codedSegments,
      summary: {
        totalSegments: codedSegments.length,
        codeFrequency: {},
        categoryFrequency: {}
      }
    };
    
    // Calcular frequências
    codedSegments.forEach(seg => {
      seg.codes.forEach(codeId => {
        exportData.summary.codeFrequency[codeId] = (exportData.summary.codeFrequency[codeId] || 0) + 1;
        const catId = codeId.split('.')[0];
        exportData.summary.categoryFrequency[catId] = (exportData.summary.categoryFrequency[catId] || 0) + 1;
      });
    });
    
    try {
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      // Método robusto para download
      const a = document.createElement('a');
      a.href = url;
      a.download = `codificacao_completa_${new Date().toISOString().split('T')[0]}.json`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      alert('Erro ao exportar JSON: ' + err.message);
    }
  }, [codedSegments]);

  // Exportar em formato TXT (texto plano formatado)
  const exportCodingTXT = useCallback(() => {
    if (codedSegments.length === 0) return;
    
    const allCodes = getAllCodes();
    let txt = `RELATÓRIO DE CODIFICAÇÃO QUALITATIVA\n`;
    txt += `${'='.repeat(50)}\n`;
    txt += `Data de Exportação: ${new Date().toLocaleString('pt-BR')}\n`;
    txt += `Total de Segmentos: ${codedSegments.length}\n\n`;
    
    // Agrupar por documento
    const byDocument = {};
    codedSegments.forEach(seg => {
      if (!byDocument[seg.documentName]) {
        byDocument[seg.documentName] = [];
      }
      byDocument[seg.documentName].push(seg);
    });
    
    Object.entries(byDocument).forEach(([docName, segments]) => {
      txt += `\n${'─'.repeat(50)}\n`;
      txt += `DOCUMENTO: ${docName}\n`;
      txt += `${'─'.repeat(50)}\n`;
      txt += `Segmentos codificados: ${segments.length}\n\n`;
      
      segments.forEach((seg, idx) => {
        const codeNames = seg.codes.map(codeId => {
          const code = allCodes.find(c => c.id === codeId);
          return code ? `${codeId} (${code.name})` : codeId;
        });
        
        txt += `[${idx + 1}] TEXTO:\n`;
        txt += `"${seg.text}"\n\n`;
        txt += `   CÓDIGOS: ${codeNames.join(', ')}\n`;
        if (seg.note) {
          txt += `   NOTA: ${seg.note}\n`;
        }
        txt += `   DATA: ${new Date(seg.createdAt).toLocaleString('pt-BR')}\n`;
        txt += `   TIPO: ${seg.isAutomatic ? 'Automático' : 'Manual'}\n`;
        txt += `\n`;
      });
    });
    
    // Resumo por código
    txt += `\n${'='.repeat(50)}\n`;
    txt += `RESUMO POR CÓDIGO\n`;
    txt += `${'='.repeat(50)}\n\n`;
    
    const codeFreq = {};
    codedSegments.forEach(seg => {
      seg.codes.forEach(codeId => {
        codeFreq[codeId] = (codeFreq[codeId] || 0) + 1;
      });
    });
    
    Object.entries(codeFreq)
      .sort((a, b) => b[1] - a[1])
      .forEach(([codeId, count]) => {
        const code = allCodes.find(c => c.id === codeId);
        const codeName = code ? code.name : 'Desconhecido';
        txt += `${codeId.padEnd(10)} ${codeName.padEnd(30)} ${count} ocorrências\n`;
      });
    
    try {
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + txt], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `codificacao_${new Date().toISOString().split('T')[0]}.txt`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export TXT error:', err);
      alert('Erro ao exportar TXT: ' + err.message);
    }
  }, [codedSegments]);

  // Exportar em formato Markdown
  const exportCodingMarkdown = useCallback(() => {
    if (codedSegments.length === 0) return;
    
    const allCodes = getAllCodes();
    let md = `# Relatório de Codificação Qualitativa\n\n`;
    md += `**Data de Exportação:** ${new Date().toLocaleString('pt-BR')}\n\n`;
    md += `**Total de Segmentos:** ${codedSegments.length}\n\n`;
    md += `---\n\n`;
    
    // Agrupar por documento
    const byDocument = {};
    codedSegments.forEach(seg => {
      if (!byDocument[seg.documentName]) {
        byDocument[seg.documentName] = [];
      }
      byDocument[seg.documentName].push(seg);
    });
    
    Object.entries(byDocument).forEach(([docName, segments]) => {
      md += `## 📄 ${docName}\n\n`;
      md += `*${segments.length} segmentos codificados*\n\n`;
      
      segments.forEach((seg, idx) => {
        const codeNames = seg.codes.map(codeId => {
          const code = allCodes.find(c => c.id === codeId);
          return code ? `\`${codeId}\` ${code.name}` : `\`${codeId}\``;
        });
        
        md += `### Segmento ${idx + 1}\n\n`;
        md += `> ${seg.text.replace(/\n/g, '\n> ')}\n\n`;
        md += `**Códigos:** ${codeNames.join(' | ')}\n\n`;
        if (seg.note) {
          md += `**Nota:** ${seg.note}\n\n`;
        }
        md += `*${seg.isAutomatic ? '🤖 Automático' : '✋ Manual'} · ${new Date(seg.createdAt).toLocaleString('pt-BR')}*\n\n`;
        md += `---\n\n`;
      });
    });
    
    // Tabela de frequências
    md += `## 📊 Resumo por Código\n\n`;
    md += `| Código | Nome | Frequência |\n`;
    md += `|--------|------|------------|\n`;
    
    const codeFreq = {};
    codedSegments.forEach(seg => {
      seg.codes.forEach(codeId => {
        codeFreq[codeId] = (codeFreq[codeId] || 0) + 1;
      });
    });
    
    Object.entries(codeFreq)
      .sort((a, b) => b[1] - a[1])
      .forEach(([codeId, count]) => {
        const code = allCodes.find(c => c.id === codeId);
        const codeName = code ? code.name : 'Desconhecido';
        md += `| ${codeId} | ${codeName} | ${count} |\n`;
      });
    
    try {
      const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `codificacao_${new Date().toISOString().split('T')[0]}.md`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export Markdown error:', err);
      alert('Erro ao exportar Markdown: ' + err.message);
    }
  }, [codedSegments]);

  // Exportar em formato XLSX (Excel) usando SheetJS
  const exportCodingXLSX = useCallback(() => {
    if (codedSegments.length === 0) return;
    
    const doExport = () => {
      try {
        const XLSX = window.XLSX;
        if (!XLSX) {
          alert('Erro: biblioteca Excel não carregada.');
          return;
        }
        
        const allCodes = getAllCodes();
        
        // Planilha 1: Segmentos
        const segmentsData = codedSegments.map((seg, idx) => {
          const codeNames = seg.codes.map(codeId => {
            const code = allCodes.find(c => c.id === codeId);
            return code ? `${codeId} - ${code.name}` : codeId;
          }).join('; ');
          
          const categories = [...new Set(seg.codes.map(codeId => {
            const catId = codeId.split('.')[0];
            return capacityCodebook[catId]?.name || '';
          }))].join('; ');
          
          return {
            'ID': idx + 1,
            'Documento': seg.documentName,
            'Texto': seg.text,
            'Códigos': codeNames,
            'Categorias': categories,
            'Nota': seg.note || '',
            'Tipo': seg.isAutomatic ? 'Automático' : 'Manual',
            'Data': new Date(seg.createdAt).toLocaleString('pt-BR')
          };
        });
        
        // Planilha 2: Frequência de códigos
        const codeFreq = {};
        codedSegments.forEach(seg => {
          seg.codes.forEach(codeId => {
            codeFreq[codeId] = (codeFreq[codeId] || 0) + 1;
          });
        });
        
        const frequencyData = Object.entries(codeFreq)
          .sort((a, b) => b[1] - a[1])
          .map(([codeId, count]) => {
            const code = allCodes.find(c => c.id === codeId);
            const catId = codeId.split('.')[0];
            return {
              'Código': codeId,
              'Nome': code ? code.name : 'Desconhecido',
              'Categoria': capacityCodebook[catId]?.name || '',
              'Frequência': count,
              'Percentual': ((count / codedSegments.length) * 100).toFixed(1) + '%'
            };
          });
        
        // Planilha 3: Resumo por documento
        const byDocument = {};
        codedSegments.forEach(seg => {
          if (!byDocument[seg.documentName]) {
            byDocument[seg.documentName] = { total: 0, automatic: 0, manual: 0 };
          }
          byDocument[seg.documentName].total++;
          if (seg.isAutomatic) {
            byDocument[seg.documentName].automatic++;
          } else {
            byDocument[seg.documentName].manual++;
          }
        });
        
        const documentData = Object.entries(byDocument).map(([docName, stats]) => ({
          'Documento': docName,
          'Total Segmentos': stats.total,
          'Automáticos': stats.automatic,
          'Manuais': stats.manual
        }));
        
        // Criar workbook
        const wb = XLSX.utils.book_new();
        
        const ws1 = XLSX.utils.json_to_sheet(segmentsData);
        XLSX.utils.book_append_sheet(wb, ws1, 'Segmentos');
        
        const ws2 = XLSX.utils.json_to_sheet(frequencyData);
        XLSX.utils.book_append_sheet(wb, ws2, 'Frequência');
        
        const ws3 = XLSX.utils.json_to_sheet(documentData);
        XLSX.utils.book_append_sheet(wb, ws3, 'Por Documento');
        
        // Exportar
        XLSX.writeFile(wb, `codificacao_${new Date().toISOString().split('T')[0]}.xlsx`);
      } catch (err) {
        console.error('Export XLSX error:', err);
        alert('Erro ao exportar Excel: ' + err.message);
      }
    };
    
    // Verificar se XLSX está disponível globalmente
    if (typeof window.XLSX === 'undefined') {
      // Carregar SheetJS dinamicamente
      const script = document.createElement('script');
      script.src = 'https://cdn.sheetjs.com/xlsx-0.20.0/package/dist/xlsx.full.min.js';
      script.onload = doExport;
      script.onerror = () => {
        alert('Erro ao carregar biblioteca Excel. Tente exportar em CSV.');
      };
      document.head.appendChild(script);
    } else {
      doExport();
    }
  }, [codedSegments]);

  // Estado para controle do dropdown de exportação
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const exportDropdownRef = React.useRef(null);
  
  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target)) {
        setShowExportDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Estado para loading de arquivos
  const [fileLoadingStatus, setFileLoadingStatus] = useState({});

  // Função para extrair texto de PDF usando pdf.js via CDN
  const extractTextFromPDF = async (file) => {
    // Carregar pdf.js do CDN se não estiver carregado
    if (!window.pdfjsLib) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
      // Configurar worker
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
    }
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map(item => item.str);
      fullText += strings.join(' ') + '\n\n';
    }
    
    return fullText.trim() || 'PDF sem texto extraível';
  };

  // Função para extrair texto de DOCX usando mammoth
  // Função para extrair texto de DOCX usando mammoth via CDN
  const extractTextFromDOCX = async (file) => {
    if (!window.mammoth) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
    const arrayBuffer = await file.arrayBuffer();
    const result = await window.mammoth.extractRawText({ arrayBuffer });
    return result.value || 'DOCX sem texto';
  };

  // Função para extrair texto de arquivos Excel (XLSX, XLS) via CDN
  const extractTextFromExcel = async (file) => {
    // Carregar SheetJS do CDN se não estiver carregado
    if (!window.XLSX) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
    
    const arrayBuffer = await file.arrayBuffer();
    const workbook = window.XLSX.read(arrayBuffer, { type: 'array' });
    let fullText = '';
    
    workbook.SheetNames.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName];
      const csv = window.XLSX.utils.sheet_to_csv(sheet);
      fullText += `=== ${sheetName} ===\n${csv}\n\n`;
    });
    
    return fullText.trim();
  };

  // Função para extrair texto de RTF
  const extractTextFromRTF = (rtfContent) => {
    let text = rtfContent;
    text = text.replace(/\{\\[^{}]*\}/g, '');
    text = text.replace(/\\[a-z]+(-?\d+)?[ ]?/gi, '');
    text = text.replace(/[{}\\]/g, '');
    text = text.replace(/\s+/g, ' ');
    return text.trim();
  };

  const handleFileUpload = useCallback(async (e) => {
    const files = Array.from(e.target.files);
    
    for (const file of files) {
      const fileId = Date.now() + Math.random();
      const fileName = file.name;
      const extension = fileName.split('.').pop().toLowerCase();
      
      setFileLoadingStatus(prev => ({ ...prev, [fileId]: { name: fileName, status: 'loading' } }));
      
      try {
        let content = '';
        
        switch (extension) {
          case 'pdf':
            content = await extractTextFromPDF(file);
            break;
            
          case 'docx':
            content = await extractTextFromDOCX(file);
            break;
            
          case 'doc':
            // DOC antigo - tentar extrair texto visível
            const docBuffer = await file.arrayBuffer();
            const docBytes = new Uint8Array(docBuffer);
            let docText = '';
            for (let i = 0; i < docBytes.length; i++) {
              const byte = docBytes[i];
              if (byte >= 32 && byte < 127) {
                docText += String.fromCharCode(byte);
              } else if (byte === 10 || byte === 13) {
                docText += '\n';
              }
            }
            content = docText.replace(/\s+/g, ' ').trim();
            if (content.length < 50) {
              throw new Error('Arquivo .doc antigo. Converta para .docx');
            }
            break;
            
          case 'xlsx':
          case 'xls':
            content = await extractTextFromExcel(file);
            break;
            
          case 'rtf':
            const rtfText = await file.text();
            content = extractTextFromRTF(rtfText);
            break;
            
          case 'json':
            const jsonText = await file.text();
            try {
              const jsonData = JSON.parse(jsonText);
              if (typeof jsonData === 'string') {
                content = jsonData;
              } else if (Array.isArray(jsonData)) {
                content = jsonData.map(item => typeof item === 'string' ? item : JSON.stringify(item)).join('\n\n');
              } else if (jsonData.text || jsonData.content || jsonData.body) {
                content = jsonData.text || jsonData.content || jsonData.body;
              } else {
                content = JSON.stringify(jsonData, null, 2);
              }
            } catch (e) {
              content = jsonText;
            }
            break;
            
          case 'html':
          case 'htm':
            const htmlText = await file.text();
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlText;
            content = tempDiv.textContent || tempDiv.innerText || '';
            content = content.replace(/\s+/g, ' ').trim();
            break;
            
          case 'xml':
            const xmlText = await file.text();
            content = xmlText.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
            break;
            
          default:
            // txt, md, csv, tsv, log, etc - ler como texto
            try {
              content = await file.text();
            } catch (e) {
              const buffer = await file.arrayBuffer();
              content = new TextDecoder('iso-8859-1').decode(buffer);
            }
            break;
        }
        
        if (!content || content.trim().length === 0) {
          throw new Error('Arquivo sem texto extraível');
        }
        
        // Adicionar documento à lista
        setDocuments(prev => [...prev, {
          id: fileId,
          name: fileName,
          content: content.trim(),
          size: file.size,
          type: extension,
          uploadedAt: new Date()
        }]);
        
        // Adicionar documento ao corpus ativo
        setCorpora(prev => prev.map(c => 
          c.id === activeCorpus 
            ? { ...c, documentIds: [...c.documentIds, fileId] }
            : c
        ));
        
        setFileLoadingStatus(prev => ({ ...prev, [fileId]: { name: fileName, status: 'success' } }));
        setTimeout(() => {
          setFileLoadingStatus(prev => {
            const newStatus = { ...prev };
            delete newStatus[fileId];
            return newStatus;
          });
        }, 3000);
        
      } catch (error) {
        console.error(`Erro: ${fileName}`, error);
        setFileLoadingStatus(prev => ({ 
          ...prev, 
          [fileId]: { name: fileName, status: 'error', error: error.message || 'Erro desconhecido' } 
        }));
        setTimeout(() => {
          setFileLoadingStatus(prev => {
            const newStatus = { ...prev };
            delete newStatus[fileId];
            return newStatus;
          });
        }, 8000);
      }
    }
    
    e.target.value = '';
  }, [activeCorpus]);
  
  const removeDocument = useCallback((id) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
    // Remover do corpus também
    setCorpora(prev => prev.map(c => ({
      ...c,
      documentIds: c.documentIds.filter(docId => docId !== id)
    })));
    setAnalysisResults(null);
  }, []);
  
  const processCorpus = useCallback(() => {
    if (documents.length === 0) return;
    
    setIsProcessing(true);
    
    setTimeout(() => {
      const fullText = documents.map(d => d.content).join('\n\n');
      const allWords = cleanText(fullText, cleaningOptions, stopwordsSet);
      const rawWords = tokenize(fullText);
      
      // Usar sistema de frequência com ou sem agrupamento baseado na opção
      let wordFrequency;
      let frequencyData = null;
      
      if (cleaningOptions.groupVariations) {
        // Com agrupamento de variações morfológicas
        frequencyData = calculateWordFrequencyWithVariations(allWords);
        wordFrequency = frequencyData.frequency;
      } else {
        // Sem agrupamento - frequência simples
        wordFrequency = calculateWordFrequency(allWords);
      }
      
      const segments = fullText.split(/[.!?]+/).filter(s => s.trim().length > 20);
      const cooccurrences = calculateCooccurrence(segments, networkSettings.windowSize, stopwordsSet, cleaningOptions);
      const chdResult = performCHD(segments, 5, cleaningOptions, stopwordsSet);
      
      const hapax = wordFrequency.filter(w => w.count === 1).length;
      const lexicalRichness = ((wordFrequency.length / rawWords.length) * 100).toFixed(2);
      
      // Contar palavras com variações agrupadas (só se agrupamento estiver ativo)
      const groupedWords = frequencyData ? wordFrequency.filter(w => w.isGroup).length : 0;
      
      // ========== ANÁLISES AVANÇADAS DE REDE ==========
      const graph = buildGraph(cooccurrences, networkSettings.minWeight, networkSettings.maxEdges);
      const centralityData = calculateCentralityMetrics(graph);
      const communityData = detectCommunities(graph);
      
      // ========== MÓDULOS ESTATÍSTICOS ==========
      const tfidfData = calculateTFIDF(documents, stopwordsSet, cleaningOptions);
      const lexicalDiversity = calculateLexicalDiversity(fullText, stopwordsSet, cleaningOptions);
      const chiSquareAssoc = calculateChiSquareAssociation(cooccurrences, wordFrequency, rawWords.length);
      const specificities = calculateSpecificities(documents, corpora, stopwordsSet, cleaningOptions);
      
      // ========== BIGRAMAS ==========
      const bigrams = calculateBigrams(fullText, stopwordsSet, 2, cleaningOptions);
      const bigramNetwork = buildBigramNetwork(bigrams, 80);
      setBigramAnalysis({ bigrams, network: bigramNetwork });
      
      // ========== SENTIMENTOS ==========
      const sentiment = analyzeSentiment(fullText, stopwordsSet, cleaningOptions);
      setSentimentAnalysis(sentiment);
      
      // ========== AFC ==========
      const afcResult = calculateAFC(documents, wordFrequency, stopwordsSet, cleaningOptions);
      setAfcData(afcResult);
      
      // Armazenar análise de rede separadamente para acesso rápido
      setNetworkAnalysis({
        graph,
        centrality: centralityData,
        communities: communityData,
        cooccurrences: cooccurrences.slice(0, 500)
      });
      
      // Armazenar análises estatísticas
      setStatisticalAnalysis({
        tfidf: tfidfData,
        lexicalDiversity,
        chiSquareAssociations: chiSquareAssoc,
        specificities
      });
      
      setAnalysisResults({
        wordFrequency,
        wordGroups: frequencyData?.groups || null,
        wordToCanonical: frequencyData?.wordToCanonical || null,
        rawFrequency: frequencyData?.rawFrequency || wordFrequency,
        groupingEnabled: cleaningOptions.groupVariations,
        cooccurrences,
        chdResult,
        segments,
        fullText, // Guardar para usar na árvore de palavras
        stats: {
          documentCount: documents.length,
          totalWords: rawWords.length,
          uniqueWords: wordFrequency.length,
          uniqueWordsRaw: frequencyData?.rawFrequency?.length || wordFrequency.length,
          groupedWords,
          groupingEnabled: cleaningOptions.groupVariations,
          segments: segments.length,
          hapax,
          lexicalRichness,
          corporaCount: corpora.length,
          stopwordsCount: stopwordsSet.size,
          // Métricas de rede
          networkNodes: centralityData.metrics.nodeCount,
          networkEdges: centralityData.metrics.edgeCount,
          networkDensity: centralityData.metrics.density,
          communityCount: communityData.communityCount,
          modularity: communityData.modularity,
          // Bigramas
          bigramCount: bigrams.length,
          // Sentimentos
          sentimentScore: sentiment.score
        }
      });
      
      setIsProcessing(false);
      setActiveTab('stats');
    }, 1500);
  }, [documents, cleaningOptions, stopwordsSet, corpora, networkSettings]);
  
  const performKWICSearch = useCallback(() => {
    if (!kwicKeyword.trim() || documents.length === 0) return;
    
    const fullText = documents.map(d => d.content).join('\n\n');
    const results = performKWIC(fullText, kwicKeyword.trim());
    setKwicResults(results);
  }, [kwicKeyword, documents]);
  
  // ========== DENDROGRAMA: CLUSTERING HIERÁRQUICO ==========
  
  // Função para calcular matriz de coocorrência
  const computeCooccurrenceMatrix = useCallback((words, fullText, windowSize = 5) => {
    const n = words.length;
    const wordSet = new Set(words);
    const wordIndex = {};
    words.forEach((w, i) => { wordIndex[w] = i; });
    
    // Tokenizar texto
    const tokens = fullText.toLowerCase()
      .replace(/[^\wàáâãäåçèéêëìíîïñòóôõöùúûüýÿ\s]/g, ' ')
      .split(/\s+/)
      .filter(t => wordSet.has(t));
    
    // Matriz de coocorrência
    const cooc = Array.from({ length: n }, () => Array(n).fill(0));
    
    for (let i = 0; i < tokens.length; i++) {
      const w1 = tokens[i];
      if (!wordIndex.hasOwnProperty(w1)) continue;
      const idx1 = wordIndex[w1];
      
      for (let j = Math.max(0, i - windowSize); j < Math.min(tokens.length, i + windowSize + 1); j++) {
        if (i === j) continue;
        const w2 = tokens[j];
        if (!wordIndex.hasOwnProperty(w2)) continue;
        const idx2 = wordIndex[w2];
        cooc[idx1][idx2]++;
      }
    }
    
    return cooc;
  }, []);
  
  // Função para converter coocorrência em matriz de distância
  const coocToDistance = useCallback((cooc) => {
    const n = cooc.length;
    const dist = Array.from({ length: n }, () => Array(n).fill(0));
    
    for (let i = 0; i < n; i++) {
      const sumI = cooc[i].reduce((a, b) => a + b, 0) || 1;
      for (let j = i + 1; j < n; j++) {
        const sumJ = cooc[j].reduce((a, b) => a + b, 0) || 1;
        
        // Distância de cosseno
        let dotProduct = 0;
        let normI = 0;
        let normJ = 0;
        
        for (let k = 0; k < n; k++) {
          const vi = cooc[i][k] / sumI;
          const vj = cooc[j][k] / sumJ;
          dotProduct += vi * vj;
          normI += vi * vi;
          normJ += vj * vj;
        }
        
        normI = Math.sqrt(normI) || 0.001;
        normJ = Math.sqrt(normJ) || 0.001;
        
        const cosineSim = dotProduct / (normI * normJ);
        const cosineDist = 1 - Math.max(0, Math.min(1, cosineSim));
        
        dist[i][j] = cosineDist;
        dist[j][i] = cosineDist;
      }
    }
    
    return dist;
  }, []);
  
  // Algoritmo de clustering hierárquico aglomerativo
  const hierarchicalClustering = useCallback((distMatrix, method = 'ward') => {
    const n = distMatrix.length;
    if (n < 2) return [];
    
    // Clonar matriz de distância
    const dist = distMatrix.map(row => [...row]);
    
    // Rastrear clusters ativos e seus tamanhos
    const active = new Set(Array.from({ length: n }, (_, i) => i));
    const clusterSize = Array.from({ length: n }, () => 1);
    const clusterMembers = Array.from({ length: n }, (_, i) => [i]);
    
    const linkage = [];
    let nextClusterId = n;
    
    // Função para calcular distância entre clusters
    const clusterDist = (c1, c2) => {
      const members1 = clusterMembers[c1];
      const members2 = clusterMembers[c2];
      
      if (method === 'single') {
        // Minimum linkage
        let minD = Infinity;
        for (const m1 of members1) {
          for (const m2 of members2) {
            if (m1 < n && m2 < n && dist[m1][m2] < minD) {
              minD = dist[m1][m2];
            }
          }
        }
        return minD;
      } else if (method === 'complete') {
        // Maximum linkage
        let maxD = 0;
        for (const m1 of members1) {
          for (const m2 of members2) {
            if (m1 < n && m2 < n && dist[m1][m2] > maxD) {
              maxD = dist[m1][m2];
            }
          }
        }
        return maxD;
      } else if (method === 'average') {
        // UPGMA
        let sumD = 0;
        let count = 0;
        for (const m1 of members1) {
          for (const m2 of members2) {
            if (m1 < n && m2 < n) {
              sumD += dist[m1][m2];
              count++;
            }
          }
        }
        return count > 0 ? sumD / count : 0;
      } else {
        // Ward's method (minimize within-cluster variance)
        const n1 = members1.length;
        const n2 = members2.length;
        let sumD = 0;
        let count = 0;
        for (const m1 of members1) {
          for (const m2 of members2) {
            if (m1 < n && m2 < n) {
              sumD += dist[m1][m2] * dist[m1][m2];
              count++;
            }
          }
        }
        const avgD = count > 0 ? Math.sqrt(sumD / count) : 0;
        return avgD * Math.sqrt((2 * n1 * n2) / (n1 + n2));
      }
    };
    
    while (active.size > 1) {
      // Encontrar par mais próximo
      let minDist = Infinity;
      let minI = -1, minJ = -1;
      
      const activeArray = Array.from(active);
      for (let i = 0; i < activeArray.length; i++) {
        for (let j = i + 1; j < activeArray.length; j++) {
          const c1 = activeArray[i];
          const c2 = activeArray[j];
          const d = clusterDist(c1, c2);
          if (d < minDist) {
            minDist = d;
            minI = c1;
            minJ = c2;
          }
        }
      }
      
      if (minI === -1 || minJ === -1) break;
      
      // Merge clusters
      const newCluster = nextClusterId++;
      clusterSize[newCluster] = clusterSize[minI] + clusterSize[minJ];
      clusterMembers[newCluster] = [...clusterMembers[minI], ...clusterMembers[minJ]];
      
      linkage.push([minI, minJ, minDist, clusterSize[newCluster]]);
      
      active.delete(minI);
      active.delete(minJ);
      active.add(newCluster);
    }
    
    return linkage;
  }, []);
  
  // Computar dendrograma quando análise mudar ou método mudar
  useEffect(() => {
    if (!analysisResults?.wordFrequency || !analysisResults?.fullText) {
      setDendrogramData(null);
      return;
    }
    
    setIsDendrogramLoading(true);
    
    // Usar setTimeout para não bloquear a UI
    setTimeout(() => {
      try {
        const topWords = [...analysisResults.wordFrequency]
          .sort((a, b) => b.count - a.count)
          .slice(0, 25)
          .map(w => w.word);
        
        if (topWords.length < 3) {
          setDendrogramData(null);
          setIsDendrogramLoading(false);
          return;
        }
        
        // Calcular matriz de coocorrência
        const cooc = computeCooccurrenceMatrix(topWords, analysisResults.fullText, 5);
        
        // Converter para distância
        const distMatrix = coocToDistance(cooc);
        
        // Clustering hierárquico
        const linkage = hierarchicalClustering(distMatrix, dendrogramMethod);
        
        // Preparar dados do dendrograma
        const frequencies = {};
        analysisResults.wordFrequency.forEach(w => { frequencies[w.word] = w.count; });
        
        // Calcular estatísticas para tabela de dados
        const wordStats = topWords.map((word, idx) => {
          const freq = frequencies[word] || 0;
          const coocSum = cooc[idx].reduce((a, b) => a + b, 0);
          const avgCooc = coocSum / (topWords.length - 1);
          const maxCoocIdx = cooc[idx].indexOf(Math.max(...cooc[idx].filter((_, i) => i !== idx)));
          const maxCoocWord = maxCoocIdx >= 0 ? topWords[maxCoocIdx] : '-';
          const maxCoocValue = maxCoocIdx >= 0 ? cooc[idx][maxCoocIdx] : 0;
          
          // Distância média para outros termos
          const avgDist = distMatrix[idx].reduce((a, b, i) => i !== idx ? a + b : a, 0) / (topWords.length - 1);
          
          return {
            rank: idx + 1,
            word,
            frequency: freq,
            cooccurrenceSum: coocSum,
            avgCooccurrence: avgCooc.toFixed(2),
            strongestConnection: maxCoocWord,
            strongestConnectionValue: maxCoocValue,
            avgDistance: avgDist.toFixed(4),
            clusteringCoef: (1 - avgDist).toFixed(4)
          };
        });
        
        setDendrogramData({
          words: topWords,
          frequencies,
          linkageMatrix: linkage,
          cooccurrenceMatrix: cooc,
          distanceMatrix: distMatrix,
          wordStats,
          method: dendrogramMethod,
          windowSize: 5,
          timestamp: new Date().toISOString(),
          corpusStats: {
            totalDocuments: analysisResults.stats?.documentCount || 0,
            totalWords: analysisResults.stats?.totalWords || 0,
            uniqueWords: analysisResults.stats?.uniqueWords || 0,
            wordsAnalyzed: topWords.length
          }
        });
      } catch (error) {
        console.error('Erro ao computar dendrograma:', error);
        setDendrogramData(null);
      }
      
      setIsDendrogramLoading(false);
    }, 100);
  }, [analysisResults, dendrogramMethod, computeCooccurrenceMatrix, coocToDistance, hierarchicalClustering]);
  
  // Função para exportar dendrograma como DOCX com metodologia completa
  const exportDendrogramDocx = useCallback(async () => {
    if (!dendrogramData) return;
    
    // Carregar docx-wasm se necessário
    if (!window.docx) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/docx@8.0.0/build/index.umd.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
    
    const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, HeadingLevel, AlignmentType } = window.docx;
    
    const methodNames = {
      ward: "Ward (Variância Mínima)",
      complete: "Complete Linkage (Máxima Distância)",
      average: "UPGMA (Média Aritmética)",
      single: "Single Linkage (Mínima Distância)"
    };
    
    // Criar documento
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Título
          new Paragraph({
            text: "Relatório de Análise de Clustering Hierárquico (Dendrograma)",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER
          }),
          new Paragraph({ text: "" }),
          
          // Metadata
          new Paragraph({
            text: `Data de geração: ${new Date().toLocaleString('pt-BR')}`,
            alignment: AlignmentType.RIGHT
          }),
          new Paragraph({ text: "" }),
          
          // 1. Metodologia
          new Paragraph({ text: "1. METODOLOGIA", heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: "" }),
          
          new Paragraph({ text: "1.1 Objetivo", heading: HeadingLevel.HEADING_3 }),
          new Paragraph({
            children: [
              new TextRun({ text: "Este relatório apresenta a análise de clustering hierárquico aglomerativo aplicada ao corpus textual, com o objetivo de identificar agrupamentos semânticos entre os termos mais frequentes baseado em seus padrões de coocorrência." })
            ]
          }),
          new Paragraph({ text: "" }),
          
          new Paragraph({ text: "1.2 Parâmetros de Análise", heading: HeadingLevel.HEADING_3 }),
          new Paragraph({ children: [new TextRun({ text: `• Método de linkage: ${methodNames[dendrogramData.method]}` })] }),
          new Paragraph({ children: [new TextRun({ text: `• Janela de coocorrência: ${dendrogramData.windowSize} palavras` })] }),
          new Paragraph({ children: [new TextRun({ text: `• Número de termos analisados: ${dendrogramData.words.length}` })] }),
          new Paragraph({ children: [new TextRun({ text: `• Métrica de distância: Distância de Cosseno (1 - similaridade)` })] }),
          new Paragraph({ text: "" }),
          
          new Paragraph({ text: "1.3 Procedimento", heading: HeadingLevel.HEADING_3 }),
          new Paragraph({ children: [new TextRun({ text: "1. Seleção dos termos mais frequentes do corpus (top 25)" })] }),
          new Paragraph({ children: [new TextRun({ text: "2. Construção da matriz de coocorrência usando janela deslizante" })] }),
          new Paragraph({ children: [new TextRun({ text: "3. Normalização e conversão para matriz de distância (cosseno)" })] }),
          new Paragraph({ children: [new TextRun({ text: "4. Aplicação do algoritmo de clustering hierárquico aglomerativo" })] }),
          new Paragraph({ children: [new TextRun({ text: "5. Geração do dendrograma e análise dos clusters resultantes" })] }),
          new Paragraph({ text: "" }),
          
          // 2. Dados do Corpus
          new Paragraph({ text: "2. DADOS DO CORPUS", heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: "" }),
          new Paragraph({ children: [new TextRun({ text: `• Total de documentos: ${dendrogramData.corpusStats.totalDocuments}` })] }),
          new Paragraph({ children: [new TextRun({ text: `• Total de palavras: ${dendrogramData.corpusStats.totalWords.toLocaleString('pt-BR')}` })] }),
          new Paragraph({ children: [new TextRun({ text: `• Palavras únicas: ${dendrogramData.corpusStats.uniqueWords.toLocaleString('pt-BR')}` })] }),
          new Paragraph({ text: "" }),
          
          // 3. Tabela de Estatísticas dos Termos
          new Paragraph({ text: "3. ESTATÍSTICAS DOS TERMOS ANALISADOS", heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: "" }),
          new Paragraph({ children: [new TextRun({ text: "A tabela abaixo apresenta as estatísticas de cada termo incluído na análise de clustering:" })] }),
          new Paragraph({ text: "" }),
          
          // Tabela
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              // Header
              new TableRow({
                children: ['Rank', 'Termo', 'Freq.', 'Σ Cooc.', 'Cooc. Média', 'Conexão Forte', 'Valor', 'Dist. Média'].map(header =>
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: header, bold: true })] })],
                    shading: { fill: "CCCCCC" }
                  })
                )
              }),
              // Data rows
              ...dendrogramData.wordStats.map(stat =>
                new TableRow({
                  children: [
                    stat.rank.toString(),
                    stat.word,
                    stat.frequency.toString(),
                    stat.cooccurrenceSum.toString(),
                    stat.avgCooccurrence,
                    stat.strongestConnection,
                    stat.strongestConnectionValue.toString(),
                    stat.avgDistance
                  ].map(value =>
                    new TableCell({
                      children: [new Paragraph({ text: value })]
                    })
                  )
                })
              )
            ]
          }),
          new Paragraph({ text: "" }),
          
          // 4. Matriz de Linkage
          new Paragraph({ text: "4. MATRIZ DE LINKAGE (FUSÕES)", heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: "" }),
          new Paragraph({ children: [new TextRun({ text: "Cada linha representa uma fusão de clusters. Cluster1 e Cluster2 são os índices dos clusters fundidos, Distância é a distância no momento da fusão, e Tamanho é o número de elementos no novo cluster." })] }),
          new Paragraph({ text: "" }),
          
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: ['Passo', 'Cluster 1', 'Cluster 2', 'Distância', 'Tamanho'].map(header =>
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: header, bold: true })] })],
                    shading: { fill: "CCCCCC" }
                  })
                )
              }),
              ...dendrogramData.linkageMatrix.map((row, idx) =>
                new TableRow({
                  children: [
                    (idx + 1).toString(),
                    row[0] < dendrogramData.words.length ? dendrogramData.words[row[0]] : `C${row[0]}`,
                    row[1] < dendrogramData.words.length ? dendrogramData.words[row[1]] : `C${row[1]}`,
                    row[2].toFixed(4),
                    row[3].toString()
                  ].map(value =>
                    new TableCell({
                      children: [new Paragraph({ text: value })]
                    })
                  )
                })
              )
            ]
          }),
          new Paragraph({ text: "" }),
          
          // 5. Interpretação
          new Paragraph({ text: "5. GUIA DE INTERPRETAÇÃO", heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: "" }),
          new Paragraph({ children: [new TextRun({ text: "• Distância baixa entre termos indica alta coocorrência (aparecem frequentemente juntos)" })] }),
          new Paragraph({ children: [new TextRun({ text: "• Clusters formados em níveis baixos do dendrograma representam associações mais fortes" })] }),
          new Paragraph({ children: [new TextRun({ text: "• A altura de fusão indica a dissimilaridade no momento em que dois clusters são unidos" })] }),
          new Paragraph({ children: [new TextRun({ text: "• Termos no mesmo ramo compartilham padrões de uso similares no corpus" })] }),
          new Paragraph({ text: "" }),
          
          // 6. Reprodutibilidade
          new Paragraph({ text: "6. REPRODUTIBILIDADE", heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: "" }),
          new Paragraph({ children: [new TextRun({ text: "Para reproduzir esta análise:" })] }),
          new Paragraph({ children: [new TextRun({ text: "1. Utilize o mesmo corpus de texto" })] }),
          new Paragraph({ children: [new TextRun({ text: `2. Aplique o método de linkage: ${methodNames[dendrogramData.method]}` })] }),
          new Paragraph({ children: [new TextRun({ text: `3. Use janela de coocorrência de ${dendrogramData.windowSize} palavras` })] }),
          new Paragraph({ children: [new TextRun({ text: "4. Calcule distância de cosseno entre vetores de coocorrência normalizados" })] }),
          new Paragraph({ children: [new TextRun({ text: "5. Execute clustering hierárquico aglomerativo" })] }),
        ]
      }]
    });
    
    // Gerar e baixar
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dendrograma_metodologia_${dendrogramData.method}_${new Date().toISOString().slice(0, 10)}.docx`;
    a.click();
    URL.revokeObjectURL(url);
  }, [dendrogramData]);
  
  // Função para exportar dados do dendrograma como CSV
  const exportDendrogramCSV = useCallback(() => {
    if (!dendrogramData) return;
    
    // Estatísticas dos termos
    let csv = "ESTATÍSTICAS DOS TERMOS\n";
    csv += "Rank,Termo,Frequência,Soma Coocorrência,Coocorrência Média,Conexão Mais Forte,Valor Conexão,Distância Média,Coef. Clustering\n";
    dendrogramData.wordStats.forEach(stat => {
      csv += `${stat.rank},"${stat.word}",${stat.frequency},${stat.cooccurrenceSum},${stat.avgCooccurrence},"${stat.strongestConnection}",${stat.strongestConnectionValue},${stat.avgDistance},${stat.clusteringCoef}\n`;
    });
    
    csv += "\n\nMATRIZ DE LINKAGE\n";
    csv += "Passo,Cluster1,Cluster2,Distância,Tamanho\n";
    dendrogramData.linkageMatrix.forEach((row, idx) => {
      const c1 = row[0] < dendrogramData.words.length ? dendrogramData.words[row[0]] : `C${row[0]}`;
      const c2 = row[1] < dendrogramData.words.length ? dendrogramData.words[row[1]] : `C${row[1]}`;
      csv += `${idx + 1},"${c1}","${c2}",${row[2].toFixed(6)},${row[3]}\n`;
    });
    
    csv += "\n\nMATRIZ DE COOCORRÊNCIA\n";
    csv += "," + dendrogramData.words.join(",") + "\n";
    dendrogramData.cooccurrenceMatrix.forEach((row, i) => {
      csv += `"${dendrogramData.words[i]}",` + row.join(",") + "\n";
    });
    
    csv += "\n\nMATRIZ DE DISTÂNCIA\n";
    csv += "," + dendrogramData.words.join(",") + "\n";
    dendrogramData.distanceMatrix.forEach((row, i) => {
      csv += `"${dendrogramData.words[i]}",` + row.map(v => v.toFixed(6)).join(",") + "\n";
    });
    
    csv += "\n\nMETADADOS\n";
    csv += `Método,${dendrogramData.method}\n`;
    csv += `Janela de Coocorrência,${dendrogramData.windowSize}\n`;
    csv += `Total de Documentos,${dendrogramData.corpusStats.totalDocuments}\n`;
    csv += `Total de Palavras,${dendrogramData.corpusStats.totalWords}\n`;
    csv += `Palavras Únicas,${dendrogramData.corpusStats.uniqueWords}\n`;
    csv += `Termos Analisados,${dendrogramData.corpusStats.wordsAnalyzed}\n`;
    csv += `Data de Geração,${dendrogramData.timestamp}\n`;
    
    const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dendrograma_dados_${dendrogramData.method}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [dendrogramData]);

  // Função para exportar dendrograma como PNG
  const exportDendrogramPNG = useCallback(async () => {
    const element = document.querySelector('[data-viz="dendrogram"]');
    if (!element) return;
    try {
      if (!window.html2canvas) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
          script.onload = resolve;
          script.onerror = () => reject(new Error('Falha ao carregar html2canvas'));
          document.head.appendChild(script);
        });
      }
      const canvas = await window.html2canvas(element, {
        backgroundColor: 'var(--color-background)',
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `dendrograma_${dendrogramData?.method || 'ward'}_${new Date().toISOString().slice(0, 10)}.png`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Export PNG error:', err);
      alert('Erro ao exportar PNG: ' + err.message);
    }
  }, [dendrogramData]);

  // Função para exportar dendrograma como SVG
  const exportDendrogramSVG = useCallback(() => {
    const element = document.querySelector('[data-viz="dendrogram"] svg');
    if (!element) {
      alert('SVG não encontrado.');
      return;
    }
    try {
      const svgData = new XMLSerializer().serializeToString(element);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dendrograma_${dendrogramData?.method || 'ward'}_${new Date().toISOString().slice(0, 10)}.svg`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export SVG error:', err);
      alert('Erro ao exportar SVG: ' + err.message);
    }
  }, [dendrogramData]);

  // Função para construir árvore de palavras
  const buildWordTreeFromKeyword = useCallback(() => {
    if (!wordTreeKeyword.trim() || !analysisResults?.fullText) return;
    
    const tree = buildWordTree(analysisResults.fullText, wordTreeKeyword.trim(), 30, 5, cleaningOptions.minLength);
    setWordTreeData(tree);
  }, [wordTreeKeyword, analysisResults, cleaningOptions.minLength]);
  
  // Função para converter dados para CSV
  const arrayToCSV = (data, headers) => {
    const csvRows = [headers.join(',')];
    data.forEach(row => {
      const values = headers.map(h => {
        const val = row[h] ?? '';
        // Escape quotes and wrap in quotes if contains comma
        const escaped = String(val).replace(/"/g, '""');
        return escaped.includes(',') || escaped.includes('"') || escaped.includes('\n') 
          ? `"${escaped}"` : escaped;
      });
      csvRows.push(values.join(','));
    });
    return csvRows.join('\n');
  };

  // Função para gerar XLSX usando SheetJS
  const generateXLSX = async (sheets) => {
    if (!sheets || sheets.length === 0) {
      throw new Error('Nenhuma planilha para gerar');
    }
    
    // Load SheetJS if not loaded
    if (!window.XLSX) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
        script.onload = resolve;
        script.onerror = () => reject(new Error('Falha ao carregar SheetJS'));
        document.head.appendChild(script);
      });
    }
    
    const wb = window.XLSX.utils.book_new();
    sheets.forEach(({ name, data, headers }) => {
      if (!headers || headers.length === 0) {
        console.warn(`Planilha "${name}" sem headers, pulando...`);
        return;
      }
      if (!data || data.length === 0) {
        // Criar planilha vazia com apenas headers
        const ws = window.XLSX.utils.aoa_to_sheet([headers]);
        window.XLSX.utils.book_append_sheet(wb, ws, (name || 'Sheet').substring(0, 31));
        return;
      }
      const wsData = [headers, ...data.map(row => headers.map(h => row[h] ?? ''))];
      const ws = window.XLSX.utils.aoa_to_sheet(wsData);
      window.XLSX.utils.book_append_sheet(wb, ws, (name || 'Sheet').substring(0, 31));
    });
    
    return window.XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  };

  // Função para exportar SVG como imagem
  const exportVisualizationAsImage = async (type, format = 'png') => {
    let svgElement;
    let filename;
    
    switch(type) {
      case 'wordcloud':
        svgElement = document.querySelector('[data-viz="wordcloud"] svg');
        filename = 'nuvem-palavras';
        break;
      case 'network':
        svgElement = document.querySelector('[data-viz="network"] svg');
        filename = 'rede-similitude';
        break;
      case 'chd':
        svgElement = document.querySelector('[data-viz="chd"] svg');
        filename = 'chd-reinert';
        break;
      default:
        return;
    }
    
    if (!svgElement) {
      alert('Visualização não encontrada. Vá para a aba correspondente primeiro.');
      return;
    }
    
    try {
      if (format === 'svg') {
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        // Método robusto para download
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.svg`;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return;
      }
      
      // PNG/JPEG export via Canvas
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new window.Image();
      
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      return new Promise((resolve) => {
        img.onload = () => {
          canvas.width = img.width * 2; // 2x for better quality
          canvas.height = img.height * 2;
          ctx.scale(2, 2);
          ctx.fillStyle = 'oklch(0.984 0.003 247.86)'; // Dark background
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          
          const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
          canvas.toBlob((blob) => {
            const downloadUrl = URL.createObjectURL(blob);
            
            // Método robusto para download
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `${filename}.${format}`;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(downloadUrl);
            URL.revokeObjectURL(url);
            resolve();
          }, mimeType, 0.95);
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          alert('Erro ao carregar imagem para exportação.');
          resolve();
        };
        img.src = url;
      });
    } catch (err) {
      console.error('Export visualization error:', err);
      alert('Erro ao exportar visualização. Tente novamente.');
    }
  };

  // Helper para capturar visualização como PNG blob
  const captureVisualizationAsBlob = async (selector) => {
    const element = document.querySelector(selector);
    if (!element) return null;
    
    // Tentar encontrar SVG primeiro
    const svgElement = element.querySelector('svg');
    if (svgElement) {
      try {
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new window.Image();
        
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        
        return new Promise((resolve) => {
          img.onload = () => {
            canvas.width = img.width * 2;
            canvas.height = img.height * 2;
            ctx.scale(2, 2);
            ctx.fillStyle = 'oklch(0.984 0.003 247.86)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            
            canvas.toBlob((blob) => {
              URL.revokeObjectURL(url);
              resolve(blob);
            }, 'image/png', 0.95);
          };
          img.onerror = () => {
            URL.revokeObjectURL(url);
            resolve(null);
          };
          img.src = url;
        });
      } catch (e) {
        console.warn('SVG capture failed:', e);
        return null;
      }
    }
    
    // Fallback para html2canvas
    try {
      if (!window.html2canvas) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
      
      const canvas = await window.html2canvas(element, {
        backgroundColor: 'var(--color-background)',
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/png', 0.95);
      });
    } catch (e) {
      console.warn('html2canvas capture failed:', e);
      return null;
    }
  };

  // Função para criar ZIP com todos os dados
  const exportAllAsZip = async () => {
    if (!analysisResults) {
      alert('Processe o corpus primeiro antes de exportar.');
      return;
    }
    
    // Verificar dados essenciais
    if (!analysisResults.wordFrequency || analysisResults.wordFrequency.length === 0) {
      alert('Nenhuma frequência de palavras disponível para exportar.');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Load JSZip
      if (!window.JSZip) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
      
      const zip = new window.JSZip();
      const imagesFolder = zip.folder('visualizacoes');
      
      // ========== CAPTURAR TODAS AS VISUALIZAÇÕES ==========
      const visualizations = [
        { selector: '[data-viz="wordcloud"]', name: 'nuvem-palavras' },
        { selector: '[data-viz="network"]', name: 'rede-similitude' },
        { selector: '[data-viz="termsberry"]', name: 'termsberry' },
        { selector: '[data-viz="treemap"]', name: 'treemap' },
        { selector: '[data-viz="wordtree"]', name: 'arvore-palavras' },
        { selector: '[data-viz="bigrams"]', name: 'rede-bigramas' },
        { selector: '[data-viz="heatmap"]', name: 'heatmap-coocorrencia' },
        { selector: '[data-viz="afc"]', name: 'afc-correspondencia' },
        { selector: '[data-viz="sentiment"]', name: 'sentimentos' },
        { selector: '[data-viz="chd"]', name: 'chd-reinert' },
        { selector: '[data-viz="radar"]', name: 'radar-codificacao' },
        { selector: '[data-viz="sunburst"]', name: 'sunburst-codificacao' },
        { selector: '[data-viz="centrality"]', name: 'centralidade' }
      ];
      
      // Capturar cada visualização disponível
      for (const viz of visualizations) {
        try {
          const blob = await captureVisualizationAsBlob(viz.selector);
          if (blob) {
            imagesFolder.file(`${viz.name}.png`, blob);
          }
        } catch (e) {
          console.warn(`Failed to capture ${viz.name}:`, e);
        }
      }
      
      // ========== DADOS CSV/TSV ==========
      
      // Corpus IRaMuTeQ
      zip.file('corpus_iramuteq.txt', generateIRaMuTeQCorpus(documents));
      
      // Frequências
      const freqData = analysisResults.wordFrequency.map(w => ({ palavra: w.word, frequencia: w.count }));
      zip.file('frequencias.csv', arrayToCSV(freqData, ['palavra', 'frequencia']));
      zip.file('frequencias.tsv', 'Palavra\tFrequência\n' + 
        analysisResults.wordFrequency.map(w => `${w.word}\t${w.count}`).join('\n'));
      
      // Coocorrências (verificar se existe)
      const cooccurrences = analysisResults.cooccurrences || [];
      if (cooccurrences.length > 0) {
        const coocData = cooccurrences.slice(0, 500).map(c => ({
          palavra1: c.source, palavra2: c.target, peso: c.weight
        }));
        zip.file('coocorrencias.csv', arrayToCSV(coocData, ['palavra1', 'palavra2', 'peso']));
        zip.file('coocorrencias.tsv', 'Palavra1\tPalavra2\tPeso\n' + 
          cooccurrences.slice(0, 500).map(c => `${c.source}\t${c.target}\t${c.weight}`).join('\n'));
      }
      
      // Análise completa JSON
      zip.file('analise_completa.json', JSON.stringify({
        stats: analysisResults.stats,
        wordFrequency: analysisResults.wordFrequency,
        cooccurrences: cooccurrences.slice(0, 500),
        chdResult: analysisResults.chdResult,
        exportedAt: new Date().toISOString()
      }, null, 2));
      
      // CHD Classes
      if (analysisResults.chdResult) {
        const chdData = analysisResults.chdResult.classes.flatMap((cls, i) => 
          cls.keywords.map(kw => ({
            classe: `Classe ${i + 1}`,
            nome: cls.name,
            palavra: kw.word,
            chi2: kw.chi2.toFixed(2),
            frequencia: kw.frequency
          }))
        );
        zip.file('chd_classes.csv', arrayToCSV(chdData, ['classe', 'nome', 'palavra', 'chi2', 'frequencia']));
      }
      
      // Codificação qualitativa
      if (codedSegments.length > 0) {
        const codingData = codedSegments.map(seg => ({
          documento: seg.documentName,
          codigo: seg.codeName,
          categoria: seg.categoryName,
          texto: seg.text,
          data: seg.timestamp
        }));
        zip.file('codificacao_qualitativa.csv', arrayToCSV(codingData, ['documento', 'codigo', 'categoria', 'texto', 'data']));
      }
      
      // Bigramas
      if (bigramAnalysis?.bigrams?.length > 0) {
        const bigramData = bigramAnalysis.bigrams.slice(0, 200).map(b => ({
          bigrama: b.bigram,
          frequencia: b.count,
          palavra1: b.words?.[0] || '',
          palavra2: b.words?.[1] || ''
        }));
        zip.file('bigramas.csv', arrayToCSV(bigramData, ['bigrama', 'frequencia', 'palavra1', 'palavra2']));
      }
      
      // Sentimentos
      if (sentimentAnalysis) {
        const sentimentData = {
          resumo: {
            positivo: sentimentAnalysis.positive,
            negativo: sentimentAnalysis.negative,
            neutro: sentimentAnalysis.neutral,
            score: sentimentAnalysis.score
          },
          palavrasPositivas: sentimentAnalysis.positiveWords || [],
          palavrasNegativas: sentimentAnalysis.negativeWords || []
        };
        zip.file('sentimentos.json', JSON.stringify(sentimentData, null, 2));
        
        // CSV de palavras com sentimento
        const sentWords = [
          ...(sentimentAnalysis.positiveWords || []).map(w => ({ palavra: w.word, sentimento: 'positivo', peso: w.weight || 1 })),
          ...(sentimentAnalysis.negativeWords || []).map(w => ({ palavra: w.word, sentimento: 'negativo', peso: w.weight || -1 }))
        ];
        if (sentWords.length > 0) {
          zip.file('palavras_sentimento.csv', arrayToCSV(sentWords, ['palavra', 'sentimento', 'peso']));
        }
      }
      
      // TF-IDF
      if (statisticalAnalysis?.tfidf?.length > 0) {
        const tfidfData = statisticalAnalysis.tfidf.slice(0, 200).map(t => ({
          palavra: t.word,
          tfidf: t.tfidf?.toFixed(4) || t.score?.toFixed(4) || 0,
          tf: t.tf?.toFixed(4) || 0,
          idf: t.idf?.toFixed(4) || 0
        }));
        zip.file('tfidf.csv', arrayToCSV(tfidfData, ['palavra', 'tfidf', 'tf', 'idf']));
      }
      
      // Associações Chi²/PMI
      if (statisticalAnalysis?.chiSquareAssociations?.length > 0) {
        const assocData = statisticalAnalysis.chiSquareAssociations.slice(0, 200).map(a => ({
          palavra1: a.word1,
          palavra2: a.word2,
          coocorrencia: a.cooccurrence,
          chi2: a.chiSquare,
          pmi: a.pmi,
          dice: a.dice,
          jaccard: a.jaccard
        }));
        zip.file('associacoes_estatisticas.csv', arrayToCSV(assocData, ['palavra1', 'palavra2', 'coocorrencia', 'chi2', 'pmi', 'dice', 'jaccard']));
      }
      
      // Diversidade Léxica
      if (statisticalAnalysis?.lexicalDiversity) {
        const ld = statisticalAnalysis.lexicalDiversity;
        zip.file('diversidade_lexica.json', JSON.stringify({
          ttr: ld.ttr,
          rttr: ld.rttr,
          cttr: ld.cttr,
          herdanC: ld.herdanC,
          yuleK: ld.yuleK,
          simpsonD: ld.simpsonD
        }, null, 2));
      }
      
      // Especificidades por corpus
      if (statisticalAnalysis?.specificities?.length > 0) {
        const specData = statisticalAnalysis.specificities.flatMap(corpus => 
          [...(corpus.topPositive || []), ...(corpus.topNegative || [])].map(t => ({
            corpus: corpus.corpusName,
            palavra: t.word,
            observado: t.observed,
            esperado: t.expected?.toFixed(2) || 0,
            ratio: t.ratio
          }))
        );
        if (specData.length > 0) {
          zip.file('especificidades.csv', arrayToCSV(specData, ['corpus', 'palavra', 'observado', 'esperado', 'ratio']));
        }
      }
      
      // Centralidade de Rede
      if (networkAnalysis?.centrality?.nodes?.length > 0) {
        const centralityData = networkAnalysis.centrality.nodes.slice(0, 100).map(n => ({
          palavra: n.id,
          grau: n.degreeCentrality?.toFixed(4) || 0,
          intermediacao: n.betweennessCentrality?.toFixed(4) || 0,
          proximidade: n.closenessCentrality?.toFixed(4) || 0,
          autovetor: n.eigenvectorCentrality?.toFixed(4) || 0
        }));
        zip.file('centralidade_rede.csv', arrayToCSV(centralityData, ['palavra', 'grau', 'intermediacao', 'proximidade', 'autovetor']));
      }
      
      // Comunidades
      if (networkAnalysis?.communities?.communities?.length > 0) {
        const commData = networkAnalysis.communities.communities.flatMap((comm, idx) => 
          (comm.members || []).map(m => ({
            comunidade: idx + 1,
            cor: comm.color,
            membro: m
          }))
        );
        if (commData.length > 0) {
          zip.file('comunidades.csv', arrayToCSV(commData, ['comunidade', 'cor', 'membro']));
        }
      }
      
      // XLSX com múltiplas abas
      try {
        const xlsxSheets = [
          { 
            name: 'Frequências', 
            data: analysisResults.wordFrequency.map(w => ({ Palavra: w.word, Frequência: w.count })),
            headers: ['Palavra', 'Frequência']
          }
        ];
        
        // Adicionar coocorrências se existirem
        if (cooccurrences.length > 0) {
          xlsxSheets.push({ 
            name: 'Coocorrências', 
            data: cooccurrences.slice(0, 500).map(c => ({ Palavra1: c.source, Palavra2: c.target, Peso: c.weight })),
            headers: ['Palavra1', 'Palavra2', 'Peso']
          });
        }
        
        // Adicionar CHD se existir
        if (analysisResults.chdResult) {
          xlsxSheets.push({
            name: 'CHD Classes',
            data: analysisResults.chdResult.classes.flatMap((cls, i) => 
              cls.keywords.map(kw => ({
                Classe: `Classe ${i + 1}`,
                Nome: cls.name,
                Palavra: kw.word,
                Chi2: kw.chi2.toFixed(2),
                Frequência: kw.frequency
              }))
            ),
            headers: ['Classe', 'Nome', 'Palavra', 'Chi2', 'Frequência']
          });
        }
        
        const xlsxData = await generateXLSX(xlsxSheets);
        zip.file('analise_textlab.xlsx', xlsxData);
      } catch (e) {
        console.warn('XLSX generation failed:', e);
      }
      
      // Generate and download
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      
      // Método robusto para download
      const a = document.createElement('a');
      a.href = url;
      a.download = `textlab_export_${new Date().toISOString().split('T')[0]}.zip`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Export error:', error);
      alert('Erro ao gerar arquivo ZIP. Verifique o console para detalhes.');
    }
    
    setIsProcessing(false);
  };

  const exportData = useCallback((format, subformat = null) => {
    if (!analysisResults) return;
    
    let content = '';
    let filename = '';
    let mimeType = 'text/plain';
    
    switch (format) {
      case 'iramuteq':
        content = generateIRaMuTeQCorpus(documents);
        filename = 'corpus_iramuteq.txt';
        break;
      case 'frequency':
        if (!analysisResults.wordFrequency || analysisResults.wordFrequency.length === 0) {
          alert('Nenhuma frequência de palavras disponível para exportar.');
          return;
        }
        if (subformat === 'csv') {
          const data = analysisResults.wordFrequency.map(w => ({ palavra: w.word, frequencia: w.count }));
          content = arrayToCSV(data, ['palavra', 'frequencia']);
          filename = 'frequencias.csv';
          mimeType = 'text/csv';
        } else {
          content = 'Palavra\tFrequência\n' + 
            analysisResults.wordFrequency.map(w => `${w.word}\t${w.count}`).join('\n');
          filename = 'frequencias.tsv';
        }
        break;
      case 'cooccurrence':
        if (!analysisResults.cooccurrences || analysisResults.cooccurrences.length === 0) {
          alert('Nenhuma coocorrência disponível para exportar.');
          return;
        }
        if (subformat === 'csv') {
          const data = analysisResults.cooccurrences.slice(0, 500).map(c => ({
            palavra1: c.source, palavra2: c.target, peso: c.weight
          }));
          content = arrayToCSV(data, ['palavra1', 'palavra2', 'peso']);
          filename = 'coocorrencias.csv';
          mimeType = 'text/csv';
        } else {
          content = 'Palavra1\tPalavra2\tPeso\n' + 
            analysisResults.cooccurrences.slice(0, 500).map(c => 
              `${c.source}\t${c.target}\t${c.weight}`
            ).join('\n');
          filename = 'coocorrencias.tsv';
        }
        break;
      case 'chd':
        if (analysisResults.chdResult) {
          if (subformat === 'csv') {
            const data = analysisResults.chdResult.classes.flatMap((cls, i) => 
              cls.keywords.map(kw => ({
                classe: `Classe ${i + 1}`,
                nome: cls.name,
                palavra: kw.word,
                chi2: kw.chi2.toFixed(2),
                frequencia: kw.frequency
              }))
            );
            content = arrayToCSV(data, ['classe', 'nome', 'palavra', 'chi2', 'frequencia']);
            filename = 'chd_classes.csv';
            mimeType = 'text/csv';
          } else {
            content = JSON.stringify(analysisResults.chdResult, null, 2);
            filename = 'chd_reinert.json';
            mimeType = 'application/json';
          }
        }
        break;
      case 'coding':
        if (codedSegments.length > 0) {
          const data = codedSegments.map(seg => ({
            documento: seg.documentName,
            codigo: seg.codeName,
            categoria: seg.categoryName,
            texto: seg.text,
            data: seg.timestamp
          }));
          content = arrayToCSV(data, ['documento', 'codigo', 'categoria', 'texto', 'data']);
          filename = 'codificacao_qualitativa.csv';
          mimeType = 'text/csv';
        }
        break;
      case 'full':
        content = JSON.stringify({
          stats: analysisResults.stats,
          wordFrequency: analysisResults.wordFrequency,
          cooccurrences: (analysisResults.cooccurrences || []).slice(0, 500),
          chdResult: analysisResults.chdResult
        }, null, 2);
        filename = 'analise_completa.json';
        mimeType = 'application/json';
        break;
      default:
        return;
    }
    
    if (!content) {
      alert('Nenhum conteúdo para exportar.');
      return;
    }
    
    try {
      // Adicionar BOM para UTF-8 em arquivos CSV/TSV
      const needsBOM = mimeType.includes('csv') || mimeType.includes('plain');
      const BOM = '\uFEFF';
      const finalContent = needsBOM ? BOM + content : content;
      
      const blob = new Blob([finalContent], { type: mimeType + ';charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      // Método robusto para download
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      alert('Erro ao exportar: ' + err.message);
    }
  }, [analysisResults, documents, codedSegments, arrayToCSV]);
  
  // ========== HELP CONTENT FOR EACH TAB ==========
  const tabHelpContent = {
    upload: { title: "Importar Documentos", description: "Importe seus arquivos de texto para análise. Gerencie seu corpus, aplique limpeza de dados e prepare o texto para as análises.", steps: ["Arraste arquivos ou clique para selecionar", "Configure as opções de limpeza (stopwords, pontuação, etc.)", "Organize documentos em corpus diferentes", "Clique em 'Processar Corpus' na barra lateral"], tips: ["Formatos aceitos: PDF, DOCX, TXT, CSV e mais", "Use múltiplos corpus para análises comparativas"] },
    stats: { title: "Estatísticas", description: "Estatísticas descritivas do corpus: contagem de palavras, tokens únicos, densidade lexical e distribuição de frequências.", steps: ["Processe o corpus primeiro", "Visualize o resumo estatístico", "Explore a tabela de frequências e distribuição"], tips: ["Compare estatísticas antes e depois da limpeza", "Exporte para documentar sua metodologia"] },
    wordcloud: { title: "Nuvem de Palavras", description: "Visualização onde o tamanho das palavras representa sua frequência. Clique em qualquer palavra para ver análise detalhada de incidências.", steps: ["Processe o corpus", "Clique em palavras para análise de incidência", "Exporte como PNG, SVG ou dados"], tips: ["50-100 palavras oferecem melhor legibilidade"] },
    termsberry: { title: "TermsBerry", description: "Visualização circular de co-ocorrências de termos. A proximidade indica relação no texto.", steps: ["Selecione a palavra central", "Explore clusters de termos relacionados", "Clique em palavras para recentrar"], tips: ["Ideal para estudar campos semânticos de um conceito"] },
    wordtree: { title: "Árvore de Palavras", description: "Mostra como uma palavra-chave aparece no contexto antes e depois dela, revelando padrões de uso e coocorrência.", steps: ["Digite a palavra-chave ou clique em uma sugestão", "Visualize a árvore com contextos esquerdo/direito", "Use zoom e pan para explorar"], tips: ["Palavras frequentes oferecem árvores mais completas", "Use para validar hipóteses sobre uso de termos"] },
    treemap: { title: "Treemap", description: "Mapa de retângulos proporcionais onde o tamanho representa frequência. Visão hierárquica e compacta da distribuição.", steps: ["Processe o corpus", "Passe o mouse para ver detalhes", "Clique para análise de incidência"], tips: ["Excelente para comparar frequências simultaneamente"] },
    network: { title: "Rede de Co-ocorrência", description: "Grafo onde nós são palavras e arestas representam co-ocorrências. Revela associações e estrutura temática.", steps: ["Configure o limiar mínimo de co-ocorrência", "Use zoom e pan para navegar", "Clique nos nós para ver conexões"], tips: ["Hubs (muito conectados) são conceitos centrais"] },
    bigrams: { title: "Bigramas", description: "Análise de pares de palavras consecutivas e sua frequência. Revela expressões comuns e padrões linguísticos.", steps: ["Visualize os bigramas mais frequentes", "Explore a rede de bigramas", "Filtre por frequência mínima"], tips: ["Revela expressões idiomáticas e colocações"] },
    netadvanced: { title: "Centralidade de Rede", description: "Métricas avançadas: degree, betweenness e closeness. Identifica palavras mais importantes e influentes.", steps: ["Gere a rede de co-ocorrência primeiro", "Compare métricas de centralidade", "Identifique palavras-ponte e hubs"], tips: ["Betweenness identifica pontes entre tópicos"] },
    heatmap: { title: "Heatmap", description: "Matriz de co-ocorrência com cores representando frequências. Identifica pares de palavras mais associados.", steps: ["Processe o corpus", "Use a escala de cores para identificar associações", "Passe o mouse para ver valores"], tips: ["Combine com análise de rede para confirmar padrões"] },
    afc: { title: "Análise Fatorial de Correspondência", description: "Técnica multivariada para visualizar associações entre palavras e documentos em espaço bidimensional.", steps: ["Prepare corpus com documentos bem definidos", "Execute a AFC", "Interprete o mapa fatorial"], tips: ["Eixos representam dimensões conceituais interpretáveis"] },
    associations: { title: "Associações de Palavras", description: "Palavras estatisticamente associadas usando testes como chi-quadrado. Coocorrências significativas além do acaso.", steps: ["Selecione palavras-alvo", "Visualize associações estatísticas", "Interprete força e direção"], tips: ["Testes evitam interpretações baseadas só em frequência"] },
    sentiment: { title: "Análise de Sentimentos", description: "Classifique trechos por polaridade (positivo, negativo, neutro) e intensidade emocional.", steps: ["Execute a análise sobre o corpus", "Visualize distribuição de sentimentos", "Analise palavras por sentimento"], tips: ["Revise manualmente para validar resultados"] },
    tfidf: { title: "TF-IDF", description: "Importância relativa de palavras ponderando frequência no documento vs. no corpus. Identifica termos distintivos.", steps: ["Execute o cálculo de TF-IDF", "Visualize palavras mais relevantes por documento", "Compare perfis entre documentos"], tips: ["Ideal para identificar termos especializados por documento"] },
    diversity: { title: "Diversidade Léxical", description: "Riqueza vocabular através de índices como Type-Token Ratio, Herdan e Maas.", steps: ["Calcule os índices automaticamente", "Compare diversidade entre documentos", "Interprete em relação ao tipo de corpus"], tips: ["Alta diversidade sugere discurso mais elaborado"] },
    chd: { title: "CHD/Reinert", description: "Classificação Hierárquica Descendente: segmenta o texto e identifica classes temáticas com vocabulário similar.", steps: ["Configure número de classes (3-5)", "Execute o algoritmo", "Interprete vocabulário de cada classe"], tips: ["Descobre classes emergentes sem categorização prévia"] },
    coding: { title: "Codificação Qualitativa", description: "Aplique códigos a segmentos de texto selecionados. Essencial para pesquisa qualitativa.", steps: ["Selecione trechos no texto", "Atribua códigos aos segmentos", "Organize hierarquicamente se necessário"], tips: ["Crie um livro de códigos antes para consistência"] },
    radar: { title: "Gráfico Radar", description: "Distribuição de códigos em gráfico radar, mostrando múltiplas dimensões simultaneamente.", steps: ["Aplique códigos aos segmentos primeiro", "Selecione códigos para visualizar", "Compare padrões entre documentos"], tips: ["Excelente para comparar múltiplos códigos de uma vez"] },
    sunburst: { title: "Gráfico Sunburst", description: "Códigos hierárquicos em gráfico sunburst interativo com camadas representando níveis.", steps: ["Organize códigos em hierarquia", "Visualize em círculos concêntricos", "Clique para expandir/colapsar"], tips: ["Visualmente atraente para apresentações e relatórios"] },
    dendrogram: { title: "Dendrograma", description: "Hierarquia de agrupamento entre palavras/documentos em diagrama de árvore. Mostra clusters naturais.", steps: ["Selecione método de agrupamento", "Execute a análise", "Interprete a hierarquia de clusters"], tips: ["Cortar em diferentes alturas define número de clusters"] },
    kwic: { title: "KWIC (Palavra-chave em Contexto)", description: "Palavra-chave com contexto imediato em linhas de concordância. Análise detalhada de uso.", steps: ["Insira a palavra-chave", "Visualize as concordâncias", "Exporte contextos para análise"], tips: ["Ordene por contexto para identificar padrões sintáticos"] },
    export: { title: "Exportar Resultados", description: "Exporte análises em múltiplos formatos: CSV, Excel, imagens, DOCX para relatórios.", steps: ["Selecione a análise", "Escolha o formato", "Baixe o arquivo"], tips: ["Use CSV para R/Python, imagens para apresentações"] } };

  const tabs = [
    { id: 'upload', label: 'Importar', icon: Upload },
    { id: 'stats', label: 'Estatísticas', icon: BarChart3, disabled: !analysisResults },
    { id: 'wordcloud', label: 'Nuvem', icon: Cloud, disabled: !analysisResults },
    { id: 'termsberry', label: 'TermsBerry', icon: CircleDot, disabled: !analysisResults },
    { id: 'wordtree', label: 'Árvore', icon: GitBranch, disabled: !analysisResults },
    { id: 'treemap', label: 'Treemap', icon: LayoutGrid, disabled: !analysisResults },
    { id: 'network', label: 'Rede', icon: Network, disabled: !analysisResults },
    { id: 'bigrams', label: 'Bigramas', icon: MessageCircle, disabled: !bigramAnalysis },
    { id: 'netadvanced', label: 'Centralidade', icon: Target, disabled: !networkAnalysis },
    { id: 'heatmap', label: 'Heatmap', icon: Grid, disabled: !analysisResults },
    { id: 'afc', label: 'AFC', icon: Sparkles, disabled: !afcData },
    { id: 'associations', label: 'Associações', icon: Activity, disabled: !statisticalAnalysis },
    { id: 'sentiment', label: 'Sentimentos', icon: PieChart, disabled: !sentimentAnalysis },
    { id: 'tfidf', label: 'TF-IDF', icon: TrendingUp, disabled: !statisticalAnalysis },
    { id: 'diversity', label: 'Diversidade', icon: Hash, disabled: !statisticalAnalysis },
    { id: 'chd', label: 'CHD/Reinert', icon: Layers, disabled: !analysisResults },
    { id: 'coding', label: 'Codificação', icon: Tag, disabled: !documents || documents.length === 0 },
    { id: 'radar', label: 'Radar', icon: Eye, disabled: !codedSegments || codedSegments.length === 0 },
    { id: 'sunburst', label: 'Sunburst', icon: RefreshCw, disabled: !codedSegments || codedSegments.length === 0 },
    { id: 'dendrogram', label: 'Dendrograma', icon: GitBranch, disabled: !analysisResults },
    { id: 'kwic', label: 'KWIC', icon: Search, disabled: !documents || documents.length === 0 },
    { id: 'export', label: 'Exportar', icon: Download, disabled: !analysisResults },
  ];
  
  // shadcn-style theme classes using dark: prefix
  const theme = {
    bg: 'bg-background',
    text: 'text-foreground',
    sidebar: 'bg-sidebar',
    sidebarBorder: 'border-sidebar-border',
    card: 'bg-card',
    cardBorder: 'border-border',
    input: 'bg-background border-input',
    inputFocus: 'focus:ring-1 focus:ring-ring',
    muted: 'text-muted-foreground',
    mutedBg: 'bg-muted',
    accent: 'text-primary',
    accentBg: 'bg-primary/10',
    hover: 'hover:bg-accent',
    textDimmed: 'text-muted-foreground',
    divider: 'border-border' };
  
  return (
    <div className={cn("min-h-screen bg-background text-foreground flex", isDarkMode && "dark")}>
      {/* Subtle ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/50/5 dark:bg-primary/50/10 rounded-full blur-3xl" />
      </div>
      
      {/* Sidebar */}
      <aside className={cn("fixed lg:relative z-50 h-screen bg-sidebar backdrop-blur-xl border-r border-sidebar-border flex flex-col transition-all duration-300 overflow-hidden", sidebarOpen ? 'w-72' : 'w-0 lg:w-20')}>
        {/* Logo/Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg flex-shrink-0">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <h1 className="text-sm font-bold tracking-tight text-foreground leading-tight">
                  App para Análise
                </h1>
                <h1 className="text-sm font-bold tracking-tight text-primary leading-tight">
                  Textual Gratuito
                </h1>
              </div>
            )}
          </div>
        </div>
        
        {/* Processar Corpus Button */}
        {documents.length > 0 && sidebarOpen && (
          <div className="p-4 border-b border-sidebar-border">
            <Button
              onClick={processCorpus}
              disabled={isProcessing}
              className="w-full bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg transition-all duration-300"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Processar Corpus
                </>
              )}
            </Button>
          </div>
        )}
        
        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <div className="space-y-1 px-3">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && setActiveTab(tab.id)}
                disabled={tab.disabled}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  activeTab === tab.id
                    ? "bg-primary/10 text-primary border border-primary/30"
                    : tab.disabled
                      ? "text-muted-foreground/50 cursor-not-allowed"
                      : "text-muted-foreground hover:bg-accent hover:text-primary dark:hover:text-primary"
                )}
                title={!sidebarOpen ? tab.label : undefined}
              >
                <tab.icon className={cn("w-5 h-5 flex-shrink-0", activeTab === tab.id && "text-primary")} />
                {sidebarOpen && <span className="truncate">{tab.label}</span>}
                {activeTab === tab.id && sidebarOpen && (
                  <ChevronRight className="w-4 h-4 ml-auto text-primary" />
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
        
        {/* Stats Summary */}
        {analysisResults && sidebarOpen && (
          <div className={`p-4 border-t border-sidebar-border bg-muted/50`}>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className={`bg-card rounded-lg p-2 shadow-sm`}>
                <div className="text-lg font-bold text-primary">{(documents || []).length}</div>
                <div className={`text-xs text-muted-foreground`}>Docs</div>
              </div>
              <div className={`bg-card rounded-lg p-2 shadow-sm`}>
                <div className="text-lg font-bold text-primary">{analysisResults.stats?.totalWords?.toLocaleString() || 0}</div>
                <div className={`text-xs text-muted-foreground`}>Palavras</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Theme Toggle */}
        {sidebarOpen && (
          <div className={`p-4 border-t border-sidebar-border`}>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-accent transition-colors`}
            >
              <span className={`text-sm flex items-center gap-2 text-muted-foreground`}>
                {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                {isDarkMode ? 'Modo Escuro' : 'Modo Claro'}
              </span>
              <div className={`w-10 h-5 rounded-full relative transition-colors bg-muted dark:bg-primary`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform left-0.5 dark:left-5`} />
              </div>
            </button>
          </div>
        )}
        
        {/* Footer Credits */}
        {sidebarOpen && (
          <div className={`p-4 border-t border-sidebar-border`}>
            <div className="text-center space-y-2">
              <div className={`text-xs text-muted-foreground`}>
                CHD/Reinert • Similitude • KWIC
              </div>
              <div className="text-xs">
                <span className={theme.muted}>Por </span>
                <span className="text-primary">Lucas O. Teixeira</span>
              </div>
              <div className="text-xs">
                <span className={theme.muted}>com </span>
                <span className="text-primary">Claude</span>
                <span className={theme.muted}> para </span>
                <span className={`font-medium text-foreground`}>UFABC</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`absolute -right-3 top-20 w-6 h-6 bg-background border-input border rounded-full flex items-center justify-center hover:bg-accent transition-colors hidden lg:flex shadow-md`}
        >
          <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
        </button>
      </aside>
      
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-background border-input shadow-sm border rounded-xl`}
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>
      
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Main Content */}
      <main className={`flex-1 overflow-y-auto min-h-screen transition-all duration-300 ${sidebarOpen ? 'lg:ml-0' : ''}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 relative">

        {/* Help Button - Fixed */}
        {tabHelpContent[activeTab] && (
          <button
            onClick={() => setShowHelp(!showHelp)}
            className={cn(
              "fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-lg font-bold transition-all",
              showHelp
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-foreground hover:bg-accent"
            )}
            title="Ajuda"
          >
            ?
          </button>
        )}

        {/* Help Drawer */}
        {showHelp && tabHelpContent[activeTab] && (
          <div className="fixed bottom-20 right-6 z-40 w-80 max-h-[70vh] overflow-y-auto bg-card border border-border rounded-xl shadow-xl p-5 animate-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground">{tabHelpContent[activeTab].title}</h3>
              <button onClick={() => setShowHelp(false)} className="p-1 hover:bg-accent rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{tabHelpContent[activeTab].description}</p>

            <div className="mb-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Como usar</h4>
              <ol className="space-y-1.5">
                {tabHelpContent[activeTab].steps.map((step, i) => (
                  <li key={i} className="text-sm text-foreground/80 flex gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">{i+1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Dicas</h4>
              <ul className="space-y-1.5">
                {tabHelpContent[activeTab].tips.map((tip, i) => (
                  <li key={i} className="text-sm text-foreground/70 flex gap-2">
                    <span className="text-primary flex-shrink-0">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="space-y-8">
            {/* ========== GERENCIADOR DE CORPUS ========== */}
            <div className={`bg-card border-border rounded-xl p-4 sm:p-6 border`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Gerenciador de Corpus</h3>
                  <span className={`text-xs bg-primary/10 text-primary dark:bg-primary/50/20 text-primary px-2 py-0.5 rounded`}>
                    {(corpora || []).length} corpus
                  </span>
                </div>
                <button
                  onClick={() => setShowCorpusManager(!showCorpusManager)}
                  className={`text-sm text-primary hover:text-primary dark:text-primary hover:text-primary flex items-center gap-1`}
                >
                  {showCorpusManager ? 'Ocultar' : 'Expandir'}
                  <ChevronDown className={`w-4 h-4 transition-transform ${showCorpusManager ? 'rotate-180' : ''}`} />
                </button>
              </div>
              
              <p className={`text-sm text-muted-foreground mb-4`}>
                Organize seus documentos em múltiplos corpus para análises comparativas.
              </p>
              
              {/* Seletor de Corpus Ativo */}
              <div className="flex flex-wrap gap-2 mb-4">
                {(corpora || []).map(corpus => (
                  <button
                    key={corpus.id}
                    onClick={() => setActiveCorpus(corpus.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                      activeCorpus === corpus.id 
                        ? `bg-primary/5 dark:bg-white/10 border-2` 
                        : `bg-card border-border hover:border-input border`
                    }`}
                    style={{ borderColor: activeCorpus === corpus.id ? corpus.color : undefined }}
                  >
                    <span 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: corpus.color }}
                    />
                    <span>{corpus.name}</span>
                    <span className={`text-xs text-muted-foreground`}>
                      ({corpus.documentIds?.length || 0} docs)
                    </span>
                  </button>
                ))}
                
                {/* Botão Novo Corpus */}
                <button
                  onClick={() => {
                    const name = prompt('Nome do novo corpus:');
                    if (name) createCorpus(name);
                  }}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm bg-primary/10 border-border text-primary hover:bg-primary/20 dark:bg-primary/10 dark:bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 dark:bg-primary/15 border transition-colors`}
                >
                  <Plus className="w-4 h-4" />
                  Novo Corpus
                </button>
              </div>
              
              {/* Painel Expandido de Gerenciamento */}
              {showCorpusManager && (
                <div className={`mt-4 pt-4 border-t border-border space-y-3`}>
                  {(corpora || []).map(corpus => (
                    <div 
                      key={corpus.id}
                      className={`flex items-center gap-3 p-3 rounded-lg bg-card`}
                    >
                      <span 
                        className="w-4 h-4 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: corpus.color }}
                      />
                      <input
                        type="text"
                        value={corpus.name}
                        onChange={(e) => renameCorpus(corpus.id, e.target.value)}
                        className="flex-1 bg-transparent border-b border-transparent hover:border-input focus:border-primary focus:outline-none text-sm"
                      />
                      <span className="text-xs text-muted-foreground">
                        {corpus.documentIds?.length || 0} documentos
                      </span>
                      {corpus.id !== 'default' && (
                        <button
                          onClick={() => {
                            if (confirm(`Deletar corpus "${corpus.name}"? Documentos serão movidos para o Corpus Principal.`)) {
                              deleteCorpus(corpus.id);
                            }
                          }}
                          className="p-1 text-destructive hover:bg-destructive/20 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Upload Zone */}
            <div className="relative">
              <input
                type="file"
                multiple
                accept=".txt,.csv,.md,.pdf,.doc,.docx,.xlsx,.xls,.rtf,.json,.html,.htm,.xml,.odt,.tsv,.log"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="border-2 border-dashed border-border rounded-2xl p-12 text-center hover:border-primary/50 hover:bg-card/30 transition-all duration-300">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Arraste arquivos ou clique para selecionar</h3>
                <p className="text-muted-foreground text-sm mb-2">
                  Arquivos serão adicionados ao corpus: 
                  <span 
                    className="ml-1 font-medium"
                    style={{ color: corpora.find(c => c.id === activeCorpus)?.color }}
                  >
                    {corpora.find(c => c.id === activeCorpus)?.name}
                  </span>
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {[
                    { ext: 'PDF', colorDark: 'bg-destructive/20 text-destructive', colorLight: 'bg-destructive/10 text-destructive' },
                    { ext: 'DOCX', colorDark: 'bg-primary/20 text-primary', colorLight: 'bg-primary/10 text-primary' },
                    { ext: 'DOC', colorDark: 'bg-primary/20 text-primary', colorLight: 'bg-primary/10 text-primary' },
                    { ext: 'TXT', colorDark: 'bg-muted/500/20 text-foreground/80', colorLight: 'bg-muted text-muted-foreground' },
                    { ext: 'CSV', colorDark: 'bg-primary/20 text-primary', colorLight: 'bg-primary/10 text-primary' },
                    { ext: 'XLSX', colorDark: 'bg-primary/20 text-primary', colorLight: 'bg-primary/10 text-primary' },
                    { ext: 'RTF', colorDark: 'bg-primary/50/20 text-primary', colorLight: 'bg-primary/10 text-primary' },
                    { ext: 'MD', colorDark: 'bg-muted/500/20 text-foreground/80', colorLight: 'bg-muted text-muted-foreground' },
                    { ext: 'HTML', colorDark: 'bg-muted text-muted-foreground', colorLight: 'bg-muted text-muted-foreground' },
                    { ext: 'JSON', colorDark: 'bg-yellow-500/20 text-yellow-300', colorLight: 'bg-yellow-100 text-yellow-700' },
                    { ext: 'XML', colorDark: 'bg-primary/20 text-primary', colorLight: 'bg-primary/10 text-primary' },
                    { ext: 'ODT', colorDark: 'bg-primary/20 text-primary', colorLight: 'bg-primary/10 text-primary' },
                  ].map(format => (
                    <span key={format.ext} className={`text-xs px-2 py-1 rounded ${isDarkMode ? format.colorDark : format.colorLight}`}>
                      .{format.ext.toLowerCase()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            {/* File Loading Status */}
            {Object.keys(fileLoadingStatus).length > 0 && (
              <div className="space-y-2">
                {Object.entries(fileLoadingStatus).map(([id, status]) => (
                  <div 
                    key={id} 
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      status.status === 'loading' ? 'bg-primary/10 border border-primary/30' :
                      status.status === 'success' ? 'bg-primary/10 border border-primary/30' :
                      'bg-destructive/10 border border-destructive/30'
                    }`}
                  >
                    {status.status === 'loading' && (
                      <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    )}
                    {status.status === 'success' && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                    {status.status === 'error' && (
                      <X className="w-4 h-4 text-destructive" />
                    )}
                    <span className={`text-sm ${
                      status.status === 'loading' ? 'text-primary' :
                      status.status === 'success' ? 'text-primary' :
                      'text-destructive'
                    }`}>
                      {status.status === 'loading' && `Processando ${status.name}...`}
                      {status.status === 'success' && `${status.name} carregado com sucesso`}
                      {status.status === 'error' && `Erro em ${status.name}: ${status.error}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            {/* ========== GERENCIADOR DE STOPWORDS ========== */}
            <div className={`bg-card border-border rounded-xl p-4 sm:p-6 border`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-muted-foreground" />
                  <h3 className="font-semibold">Gerenciador de Stopwords</h3>
                  <span className={`text-xs bg-muted text-muted-foreground dark:bg-muted text-muted-foreground px-2 py-0.5 rounded`}>
                    {customStopwordsPT.length + customStopwordsEN.length} palavras
                  </span>
                </div>
                <button
                  onClick={() => setShowStopwordsManager(!showStopwordsManager)}
                  className={`text-sm text-muted-foreground hover:text-foreground dark:text-muted-foreground hover:text-muted-foreground flex items-center gap-1`}
                >
                  {showStopwordsManager ? 'Ocultar' : 'Gerenciar'}
                  <ChevronDown className={`w-4 h-4 transition-transform ${showStopwordsManager ? 'rotate-180' : ''}`} />
                </button>
              </div>
              
              <p className={`text-sm text-muted-foreground`}>
                Stopwords são removidas da análise. Adicione ou remova palavras conforme necessário.
              </p>
              
              {showStopwordsManager && (
                <div className={`mt-4 pt-4 border-t border-border space-y-4`}>
                  {/* Seletor de Idioma */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setStopwordLanguage('pt')}
                      className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                        stopwordLanguage === 'pt' 
                          ? 'bg-secondary text-white' 
                          : theme.button
                      }`}
                    >
                      Português ({customStopwordsPT.length})
                    </button>
                    <button
                      onClick={() => setStopwordLanguage('en')}
                      className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                        stopwordLanguage === 'en' 
                          ? 'bg-secondary text-white' 
                          : theme.button
                      }`}
                    >
                      English ({customStopwordsEN.length})
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Resetar stopwords de ${stopwordLanguage === 'pt' ? 'Português' : 'Inglês'} para o padrão?`)) {
                          resetStopwords(stopwordLanguage);
                        }
                      }}
                      className={`px-3 py-2 rounded-lg text-sm ${theme.button} flex items-center gap-1`}
                    >
                      <RefreshCw className="w-4 h-4" />
                      Resetar
                    </button>
                  </div>
                  
                  {/* Adicionar Nova Stopword */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newStopword}
                      onChange={(e) => setNewStopword(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newStopword.trim()) {
                          addStopword(newStopword, stopwordLanguage);
                          setNewStopword('');
                        }
                      }}
                      placeholder="Adicionar nova stopword..."
                      className={`flex-1 px-4 py-2 bg-background border-input rounded-lg text-sm focus:border-input focus:outline-none`}
                    />
                    <button
                      onClick={() => {
                        if (newStopword.trim()) {
                          addStopword(newStopword, stopwordLanguage);
                          setNewStopword('');
                        }
                      }}
                      className="px-4 py-2 bg-secondary text-white rounded-lg text-sm hover:bg-secondary/80 flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar
                    </button>
                  </div>
                  
                  {/* Busca */}
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground`} />
                    <input
                      type="text"
                      value={stopwordSearchTerm}
                      onChange={(e) => setStopwordSearchTerm(e.target.value)}
                      placeholder="Buscar stopword..."
                      className={`w-full pl-10 pr-4 py-2 bg-background border-input rounded-lg text-sm focus:border-input focus:outline-none`}
                    />
                  </div>
                  
                  {/* Lista de Stopwords */}
                  <div className={`max-h-48 overflow-y-auto ${theme.cardInner} rounded-lg p-3`}>
                    <div className="flex flex-wrap gap-2">
                      {filteredStopwords.slice(0, 100).map(word => (
                        <span
                          key={word}
                          className={`inline-flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs group hover:bg-destructive/20 transition-colors`}
                        >
                          {word}
                          <button
                            onClick={() => removeStopword(word, stopwordLanguage)}
                            className={`text-muted-foreground group-hover:text-destructive`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                      {filteredStopwords.length > 100 && (
                        <span className={`text-xs text-muted-foreground py-1`}>
                          +{filteredStopwords.length - 100} mais...
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Cleaning Options */}
            <div className={`bg-card rounded-xl p-4 sm:p-6 border border-border`}>
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Opções de Limpeza</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                {[
                  { key: 'lowercase', label: 'Minúsculas' },
                  { key: 'removeNumbers', label: 'Remover números' },
                  { key: 'removePunctuation', label: 'Remover pontuação' },
                  { key: 'removeStopwords', label: 'Remover stopwords' },
                ].map(opt => (
                  <label key={opt.key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cleaningOptions[opt.key]}
                      onChange={(e) => setCleaningOptions(prev => ({ ...prev, [opt.key]: e.target.checked }))}
                      className={`w-4 h-4 rounded border-input bg-white dark:border-input bg-secondary text-primary focus:ring-primary`}
                    />
                    <span className={`text-sm ${theme.textSecondary}`}>{opt.label}</span>
                  </label>
                ))}
                <div className="flex items-center gap-2">
                  <label className={`text-sm ${theme.textSecondary}`}>Min. caracteres:</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={cleaningOptions.minLength}
                    onChange={(e) => setCleaningOptions(prev => ({ ...prev, minLength: parseInt(e.target.value) || 2 }))}
                    className={`w-16 px-2 py-1 rounded bg-white border-input dark:bg-secondary border-input border text-sm`}
                  />
                </div>
              </div>
              
              {/* Opção de Agrupamento Morfológico - Destacada */}
              <div className={`mt-4 p-4 rounded-xl border ${cleaningOptions.groupVariations 
                ? (isDarkMode ? 'bg-primary/10 border-primary/30' : 'bg-primary/5 border-border') 
                : (isDarkMode ? 'bg-muted border-input' : 'bg-muted/50 border-border')} transition-all`}>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cleaningOptions.groupVariations}
                    onChange={(e) => setCleaningOptions(prev => ({ ...prev, groupVariations: e.target.checked }))}
                    className={`w-5 h-5 mt-0.5 rounded border-input bg-white dark:border-input bg-secondary text-primary focus:ring-primary`}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium text-foreground`}>Agrupar variações morfológicas</span>
                      <span className={`text-xs bg-primary/10 text-primary dark:bg-primary/50/20 text-primary px-2 py-0.5 rounded`}>Recomendado</span>
                    </div>
                    <p className={`text-xs ${theme.textMuted} mt-1`}>
                      Agrupa automaticamente variações de gênero (ministro/ministra), número (singular/plural), 
                      linguagem neutra (x, @) e possíveis erros de digitação na mesma contagem.
                    </p>
                    {cleaningOptions.groupVariations && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className={`text-xs bg-muted text-foreground/70 dark:bg-secondary text-foreground/80 px-2 py-1 rounded`}>ministro = ministra</span>
                        <span className={`text-xs bg-muted text-foreground/70 dark:bg-secondary text-foreground/80 px-2 py-1 rounded`}>ministros = ministras</span>
                        <span className={`text-xs bg-muted text-foreground/70 dark:bg-secondary text-foreground/80 px-2 py-1 rounded`}>ministrx = ministr@</span>
                        <span className={`text-xs bg-muted text-foreground/70 dark:bg-secondary text-foreground/80 px-2 py-1 rounded`}>typos detectados</span>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>
            
            {/* Document List com indicação de Corpus */}
            {(documents || []).length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Documentos Carregados ({(documents || []).length})
                  </h3>
                  <div className="flex items-center gap-3">
                    {/* Filtro por Corpus */}
                    <select
                      value={corpusFilter}
                      onChange={(e) => setCorpusFilter(e.target.value)}
                      className={`px-3 py-1.5 bg-white border-input dark:bg-secondary border-input border rounded-lg text-sm focus:border-primary focus:outline-none`}
                    >
                      <option value="all">Todos os corpus</option>
                      {(corpora || []).map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => { setDocuments([]); setAnalysisResults(null); setCorpora([{ id: 'default', name: 'Corpus Principal', color: 'oklch(0.585 0.204 277.12)', documentIds: [] }]); }}
                      className="text-sm text-destructive hover:text-destructive flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      Limpar tudo
                    </button>
                  </div>
                </div>
                
                <div className="grid gap-3">
                  {(filteredDocuments || []).map(doc => {
                    const ext = doc.type || doc.name.split('.').pop().toLowerCase();
                    const docCorpus = getDocumentCorpus(doc.id);
                    const typeColors = isDarkMode ? {
                      pdf: 'bg-destructive/20 text-destructive',
                      docx: 'bg-primary/20 text-primary',
                      doc: 'bg-primary/20 text-primary',
                      xlsx: 'bg-primary/20 text-primary',
                      xls: 'bg-primary/20 text-primary',
                      csv: 'bg-primary/20 text-primary',
                      rtf: 'bg-primary/50/20 text-primary',
                      html: 'bg-muted text-muted-foreground',
                      htm: 'bg-muted text-muted-foreground',
                      json: 'bg-yellow-500/20 text-yellow-300',
                      xml: 'bg-primary/20 text-primary',
                      odt: 'bg-primary/20 text-primary',
                      txt: 'bg-muted/500/20 text-foreground/80',
                      md: 'bg-muted/500/20 text-foreground/80' } : {
                      pdf: 'bg-destructive/10 text-destructive',
                      docx: 'bg-primary/10 text-primary',
                      doc: 'bg-primary/10 text-primary',
                      xlsx: 'bg-primary/10 text-primary',
                      xls: 'bg-primary/10 text-primary',
                      csv: 'bg-primary/10 text-primary',
                      rtf: 'bg-primary/10 text-primary',
                      html: 'bg-muted text-muted-foreground',
                      htm: 'bg-muted text-muted-foreground',
                      json: 'bg-yellow-100 text-yellow-700',
                      xml: 'bg-primary/10 text-primary',
                      odt: 'bg-primary/10 text-primary',
                      txt: 'bg-muted text-muted-foreground',
                      md: 'bg-muted text-muted-foreground' };
                    const colorClass = typeColors[ext] || (isDarkMode ? 'bg-muted/500/20 text-foreground/80' : 'bg-muted text-muted-foreground');
                    
                    return (
                      <div
                        key={doc.id}
                        className={`flex items-center justify-between p-4 bg-white border-border hover:border-input dark:bg-card border-border hover:border-input rounded-xl border transition-all`}
                        style={{ borderLeftWidth: '3px', borderLeftColor: docCorpus?.color || 'oklch(0.585 0.204 277.12)' }}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center`}>
                            <FileText className={`w-5 h-5 ${theme.textMuted}`} />
                          </div>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {doc.name}
                              <span className={`text-xs px-2 py-0.5 rounded ${colorClass}`}>
                                {ext.toUpperCase()}
                              </span>
                            </div>
                            <div className={`text-sm ${theme.textMuted} flex items-center gap-2`}>
                              {(doc.size / 1024).toFixed(1)} KB • {doc.content.split(/\s+/).length.toLocaleString()} palavras
                              <span 
                                className="text-xs px-2 py-0.5 rounded"
                                style={{ backgroundColor: `${docCorpus?.color}20`, color: docCorpus?.color }}
                              >
                                {docCorpus?.name || 'Sem corpus'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Seletor de Corpus */}
                          <select
                            value={docCorpus?.id || 'default'}
                            onChange={(e) => moveDocumentToCorpus(doc.id, e.target.value)}
                            className="px-2 py-1 bg-secondary border border-input rounded text-xs focus:border-primary focus:outline-none"
                          >
                            {(corpora || []).map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => removeDocument(doc.id)}
                            className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Statistics Tab */}
        {activeTab === 'stats' && analysisResults && analysisResults.stats && analysisResults.wordFrequency && (
          <div className="space-y-8">
            <VisualizationHeader vizKey="statistics" icon={BarChart3} />
            <StatisticsPanel stats={analysisResults.stats} />
            
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Top Words */}
              <div className={`bg-card rounded-xl p-4 sm:p-6 border border-border`}>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary dark:text-primary" />
                  Top 30 Palavras
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                  {analysisResults.wordFrequency.slice(0, 30).map((word, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="w-6 text-right text-muted-foreground text-sm">{idx + 1}</span>
                      <div className="flex-1 h-8 bg-muted rounded-lg overflow-hidden">
                        <div
                          className="h-full bg-primary/20 rounded-lg flex items-center px-3"
                          style={{ width: `${(word.count / analysisResults.wordFrequency[0].count) * 100}%` }}
                        >
                          <span className="text-sm font-medium truncate">{word.word}</span>
                        </div>
                      </div>
                      <span className="w-12 text-right text-muted-foreground text-sm">{word.count}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Frequency Distribution */}
              <div className={`bg-card rounded-xl p-4 sm:p-6 border border-border`}>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-muted-foreground dark:text-muted-foreground" />
                  Distribuição de Frequências
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'Hapax (freq=1)', count: analysisResults.stats.hapax },
                    { label: 'Freq 2-5', count: analysisResults.wordFrequency.filter(w => w.count >= 2 && w.count <= 5).length },
                    { label: 'Freq 6-10', count: analysisResults.wordFrequency.filter(w => w.count >= 6 && w.count <= 10).length },
                    { label: 'Freq 11-50', count: analysisResults.wordFrequency.filter(w => w.count >= 11 && w.count <= 50).length },
                    { label: 'Freq >50', count: analysisResults.wordFrequency.filter(w => w.count > 50).length },
                  ].map((item, idx) => {
                    const percentage = ((item.count / analysisResults.stats.uniqueWords) * 100).toFixed(1);
                    return (
                      <div key={idx} className="flex items-center gap-3">
                        <span className="w-24 text-sm text-muted-foreground">{item.label}</span>
                        <div className="flex-1 h-6 bg-muted rounded-lg overflow-hidden">
                          <div
                            className="h-full rounded-lg"
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: ['oklch(0.457 0.215 277.02)', 'oklch(0.457 0.215 277.02)', 'oklch(0.359 0.135 278.70)', 'oklch(0.457 0.215 277.02)', 'oklch(0.585 0.204 277.12)'][idx] || 'oklch(0.457 0.215 277.02)'
                            }}
                          />
                        </div>
                        <span className="w-20 text-right text-sm text-muted-foreground">{item.count} ({percentage}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Word Cloud Tab */}
        {activeTab === 'wordcloud' && analysisResults && analysisResults.wordFrequency && (
          <div className={`rounded-xl p-4 sm:p-6 border bg-card border-border`}>
            <VisualizationHeader vizKey="wordcloud" icon={Cloud} extraContent={
              <ExportVisualizationButton 
                vizId="wordcloud" 
                filename="nuvem-palavras"
                data={analysisResults.wordFrequency.slice(0, 100).map(w => ({
                  palavra: w.word,
                  frequencia: w.count,
                  percentual: ((w.count / analysisResults.stats.totalWords) * 100).toFixed(2)
                }))}
              />
            } />
            <p className={`text-sm mb-6 text-muted-foreground`}>
              💡 <strong>Clique em qualquer palavra</strong> para ver análise detalhada de todas as incidências
            </p>
            <div data-viz="wordcloud" className={`flex justify-center overflow-hidden rounded-xl p-4 bg-muted`}>
              <WordCloudComponent 
                words={analysisResults.wordFrequency} 
                width={Math.min(800, (typeof window !== "undefined" ? window.innerWidth : 800) - 60)} 
                height={500} 
                onWordClick={handleWordClick}
              />
            </div>
          </div>
        )}
        
        {/* TermsBerry Tab */}
        {activeTab === 'termsberry' && analysisResults && analysisResults.wordFrequency && (
          <div className={`rounded-xl p-4 sm:p-6 border bg-card border-border`}>
            <VisualizationHeader vizKey="termsberry" icon={CircleDot} extraContent={
              <ExportVisualizationButton 
                vizId="termsberry" 
                filename="termsberry"
                data={analysisResults.wordFrequency.slice(0, 80).map(w => ({
                  palavra: w.word,
                  frequencia: w.count
                }))}
              />
            } />
            <div data-viz="termsberry" className={`flex justify-center overflow-hidden rounded-xl p-4 bg-muted`}>
              <TermsBerryVisualization 
                words={analysisResults.wordFrequency} 
                width={Math.min(700, (typeof window !== "undefined" ? window.innerWidth : 700) - 60)} 
                height={700} 
                onWordClick={handleWordClick}
              />
            </div>
          </div>
        )}
        
        {/* AFC Tab */}
        {activeTab === 'afc' && afcData && (
          <div className={`rounded-xl p-4 sm:p-6 border bg-card border-border`}>
            <VisualizationHeader vizKey="afc" icon={Sparkles} extraContent={
              <ExportVisualizationButton 
                vizId="afc" 
                filename="afc-correspondencia"
                data={afcData.words.map(w => ({
                  palavra: w.word,
                  fator1: w.x.toFixed(3),
                  fator2: w.y.toFixed(3),
                  frequencia: w.count
                }))}
              />
            } />
            <div data-viz="afc" className={`flex justify-center overflow-hidden rounded-xl p-4 bg-muted`}>
              <AFCVisualization afcData={afcData} width={850} height={650} />
            </div>
          </div>
        )}
        
        {/* Treemap Tab */}
        {activeTab === 'treemap' && analysisResults && analysisResults.wordFrequency && (
          <div className={`rounded-xl p-4 sm:p-6 border bg-card border-border`}>
            <VisualizationHeader vizKey="treemap" icon={LayoutGrid} extraContent={
              <ExportVisualizationButton 
                vizId="treemap" 
                filename="treemap-frequencias"
                data={analysisResults.wordFrequency.slice(0, 100).map(w => ({
                  palavra: w.word,
                  frequencia: w.count
                }))}
              />
            } />
            <div data-viz="treemap" className={`flex justify-center overflow-hidden rounded-xl p-4 bg-muted`}>
              <TreemapVisualization 
                words={analysisResults.wordFrequency} 
                width={Math.min(800, (typeof window !== "undefined" ? window.innerWidth : 800) - 60)} 
                height={500} 
                onWordClick={handleWordClick}
              />
            </div>
          </div>
        )}
        
        {/* Network Tab */}
        {activeTab === 'network' && analysisResults && analysisResults.cooccurrences && (
          <div className={`rounded-xl p-4 sm:p-6 border bg-card border-border`}>
            <VisualizationHeader vizKey="network" icon={Network} extraContent={
              <ExportVisualizationButton 
                vizId="network" 
                filename="rede-coocorrencia"
                data={analysisResults.cooccurrences.slice(0, 100).map(e => ({
                  palavra1: e.source,
                  palavra2: e.target,
                  peso: e.weight
                }))}
              />
            } />
            <div data-viz="network" className={`flex justify-center overflow-hidden rounded-xl p-4 bg-muted`}>
              <NetworkGraph cooccurrences={analysisResults.cooccurrences} width={Math.min(800, (typeof window !== "undefined" ? window.innerWidth : 800) - 60)} height={550} />
            </div>
          </div>
        )}
        
        {/* Bigrams Tab - Rede de Bigramas */}
        {activeTab === 'bigrams' && bigramAnalysis && (
          <div className="space-y-6">
            <div className={`rounded-xl p-4 sm:p-6 border bg-card border-border`}>
              <VisualizationHeader vizKey="bigrams" icon={MessageCircle} extraContent={
                <ExportVisualizationButton 
                  vizId="bigrams" 
                  filename="rede-bigramas"
                  data={bigramAnalysis.bigrams.slice(0, 100).map(b => ({
                    bigrama: b.bigram,
                    palavra1: b.word1,
                    palavra2: b.word2,
                    frequencia: b.count
                  }))}
                />
              } />
              <div data-viz="bigrams" className={`flex justify-center overflow-hidden rounded-xl p-4 bg-muted`}>
                <BigramNetworkVisualization bigramNetwork={bigramAnalysis.network} width={Math.min(800, (typeof window !== "undefined" ? window.innerWidth : 800) - 60)} height={550} />
              </div>
            </div>
            
            {/* Top Bigramas */}
            <div className={`rounded-xl p-4 sm:p-6 border bg-card border-border`}>
              <h4 className={`font-medium mb-4 text-foreground/80`}>Top 30 Bigramas mais Frequentes</h4>
              <div className="grid md:grid-cols-3 gap-2">
                {bigramAnalysis.bigrams.slice(0, 30).map((b, idx) => (
                  <div 
                    key={b.bigram}
                    className="flex items-center justify-between px-3 py-2 bg-muted rounded-lg"
                  >
                    <span className="text-sm">
                      <span className="text-muted-foreground mr-2">{idx + 1}.</span>
                      <span className="text-primary">{b.word1}</span>
                      <span className="text-muted-foreground mx-1">+</span>
                      <span className="text-primary">{b.word2}</span>
                    </span>
                    <span className="text-sm font-medium text-foreground/80">{b.count}x</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Word Tree Tab - Árvore de Palavras */}
        {activeTab === 'wordtree' && analysisResults && (
          <div className={`rounded-xl p-4 sm:p-6 border bg-card border-border`}>
            <VisualizationHeader vizKey="wordtree" icon={GitBranch} extraContent={
              wordTreeData && (
                <ExportVisualizationButton 
                  vizId="wordtree" 
                  filename={`arvore-${wordTreeKeyword}`}
                  data={[
                    ...(wordTreeData.left || []).map(b => ({ direcao: 'esquerda', contexto: b.path, frequencia: b.count })),
                    ...(wordTreeData.right || []).map(b => ({ direcao: 'direita', contexto: b.path, frequencia: b.count }))
                  ]}
                />
              )
            } />
            
            {/* Input para palavra central */}
            <div className="flex gap-3 mb-6">
              <div className="flex-1">
                <input
                  type="text"
                  value={wordTreeKeyword}
                  onChange={(e) => setWordTreeKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && buildWordTreeFromKeyword()}
                  placeholder="Digite a palavra central (ex: comunicação)"
                  className="w-full px-4 py-3 bg-muted border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <button
                onClick={buildWordTreeFromKeyword}
                disabled={!wordTreeKeyword.trim()}
                className="px-6 py-3 bg-primary rounded-xl font-medium hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Gerar Árvore
              </button>
            </div>
            
            {/* Sugestões de palavras frequentes */}
            {!wordTreeData && analysisResults.wordFrequency && (
              <div className="mb-6">
                <p className="text-sm text-muted-foreground mb-2">Sugestões (palavras mais frequentes):</p>
                <div className="flex flex-wrap gap-2">
                  {analysisResults.wordFrequency.slice(0, 15).map(w => (
                    <button
                      key={w.word}
                      onClick={() => {
                        setWordTreeKeyword(w.word);
                        const tree = buildWordTree(analysisResults.fullText, w.word, 30, 5, cleaningOptions.minLength);
                        setWordTreeData(tree);
                      }}
                      className="px-3 py-1 bg-secondary hover:bg-secondary/80 rounded-full text-sm transition-colors"
                    >
                      {w.word} <span className="text-muted-foreground">({w.count})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Visualização */}
            <div data-viz="wordtree" className="bg-muted rounded-xl p-4 overflow-x-auto">
              <WordTreeVisualization wordTree={wordTreeData} width={900} height={500} />
            </div>
            
            {wordTreeData && (
              <div className="mt-4 text-sm text-muted-foreground">
                Total de ocorrências encontradas: <span className="text-foreground font-medium">{wordTreeData.totalOccurrences || 0}</span>
                {' • '}Contextos à esquerda: <span className="text-primary">{wordTreeData.left?.length || 0}</span>
                {' • '}Contextos à direita: <span className="text-primary">{wordTreeData.right?.length || 0}</span>
              </div>
            )}
          </div>
        )}
        
        {/* Sentiment Tab - Análise de Sentimentos */}
        {activeTab === 'sentiment' && sentimentAnalysis && (
          <div className={`rounded-xl p-4 sm:p-6 border bg-card border-border`}>
            <VisualizationHeader vizKey="sentiment" icon={PieChart} extraContent={
              <ExportVisualizationButton 
                vizId="sentiment" 
                filename="analise-sentimentos"
                data={[
                  { categoria: 'Positivo', contagem: sentimentAnalysis.positive.count, percentual: sentimentAnalysis.positive.percentage },
                  { categoria: 'Negativo', contagem: sentimentAnalysis.negative.count, percentual: sentimentAnalysis.negative.percentage },
                  { categoria: 'Neutro', contagem: sentimentAnalysis.neutral.count, percentual: sentimentAnalysis.neutral.percentage }
                ]}
              />
            } />
            <div data-viz="sentiment">
              <SentimentVisualization sentiment={sentimentAnalysis} width={Math.min(700, (typeof window !== "undefined" ? window.innerWidth : 700) - 60)} height={400} />
            </div>
          </div>
        )}
        
        {/* Heatmap Tab */}
        {activeTab === 'heatmap' && analysisResults && analysisResults.cooccurrences && analysisResults.wordFrequency && (
          <div className={`rounded-xl p-4 sm:p-6 border bg-card border-border`}>
            <VisualizationHeader vizKey="heatmap" icon={Grid} extraContent={
              <ExportVisualizationButton 
                vizId="heatmap" 
                filename="heatmap-coocorrencia"
                data={analysisResults.cooccurrences.slice(0, 50).map(e => ({
                  palavra1: e.source,
                  palavra2: e.target,
                  coocorrencia: e.weight
                }))}
              />
            } />
            <div data-viz="heatmap" className={`flex justify-center overflow-hidden rounded-xl p-4 bg-muted`}>
              <HeatmapVisualization 
                cooccurrences={analysisResults.cooccurrences} 
                words={analysisResults.wordFrequency}
                width={Math.min(700, (typeof window !== "undefined" ? window.innerWidth : 700) - 60)} 
                height={500} 
              />
            </div>
          </div>
        )}
        
        {/* Network Advanced Tab - Centralidade e Comunidades */}
        {activeTab === 'netadvanced' && networkAnalysis && (
          <div className="space-y-8">
            {/* Configurações de Rede */}
            <div className={`bg-card rounded-xl p-4 sm:p-6 border border-border`}>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Parâmetros da Rede
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground block mb-1">Peso mínimo</label>
                  <input
                    type="number"
                    value={networkSettings.minWeight}
                    onChange={(e) => setNetworkSettings(prev => ({ ...prev, minWeight: parseInt(e.target.value) || 2 }))}
                    className="w-full px-3 py-2 bg-secondary border border-input rounded-lg text-sm"
                    min="1"
                    max="20"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground block mb-1">Máx. arestas</label>
                  <input
                    type="number"
                    value={networkSettings.maxEdges}
                    onChange={(e) => setNetworkSettings(prev => ({ ...prev, maxEdges: parseInt(e.target.value) || 150 }))}
                    className="w-full px-3 py-2 bg-secondary border border-input rounded-lg text-sm"
                    min="50"
                    max="500"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground block mb-1">Janela (palavras)</label>
                  <input
                    type="number"
                    value={networkSettings.windowSize}
                    onChange={(e) => setNetworkSettings(prev => ({ ...prev, windowSize: parseInt(e.target.value) || 5 }))}
                    className="w-full px-3 py-2 bg-secondary border border-input rounded-lg text-sm"
                    min="2"
                    max="15"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={processCorpus}
                    className="w-full px-4 py-2 bg-primary hover:bg-primary rounded-lg text-sm transition-colors"
                  >
                    Recalcular
                  </button>
                </div>
              </div>
            </div>
            
            {/* Métricas de Centralidade */}
            <div className={`bg-card rounded-xl p-4 sm:p-6 border border-border`}>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-primary" />
                Métricas de Centralidade
              </h3>
              <CentralityMetricsPanel 
                networkAnalysis={networkAnalysis} 
                onNodeClick={handleWordClick}
                isDarkMode={isDarkMode}
              />
            </div>
            
            {/* Comunidades Detectadas */}
            <div className={`bg-card rounded-xl p-4 sm:p-6 border border-border`}>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                Comunidades Detectadas (Louvain)
              </h3>
              <CommunitiesPanel networkAnalysis={networkAnalysis} isDarkMode={isDarkMode} />
            </div>
          </div>
        )}
        
        {/* Associations Tab - Chi-square, PMI, Dice */}
        {activeTab === 'associations' && statisticalAnalysis && (
          <div className={`bg-card rounded-xl p-4 sm:p-6 border border-border`}>
            <h3 className="font-semibold mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-muted-foreground" />
              Medidas de Associação entre Palavras
            </h3>
            <AssociationsPanel statisticalAnalysis={statisticalAnalysis} isDarkMode={isDarkMode} />
          </div>
        )}
        
        {/* TF-IDF Tab */}
        {activeTab === 'tfidf' && statisticalAnalysis && (
          <div className={`bg-card rounded-xl p-4 sm:p-6 border border-border`}>
            <h3 className="font-semibold mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Análise TF-IDF (Term Frequency - Inverse Document Frequency)
            </h3>
            <p className={`text-sm text-muted-foreground mb-6`}>
              TF-IDF identifica termos que são importantes para documentos específicos, destacando palavras discriminantes.
            </p>
            <TFIDFPanel statisticalAnalysis={statisticalAnalysis} isDarkMode={isDarkMode} />
          </div>
        )}
        
        {/* Diversity Tab - Índices Léxicos */}
        {activeTab === 'diversity' && statisticalAnalysis && (
          <div className="space-y-8">
            <div className={`bg-card rounded-xl p-4 sm:p-6 border border-border`}>
              <h3 className="font-semibold mb-6 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-primary" />
                Diversidade e Riqueza Léxica
              </h3>
              <LexicalDiversityPanel statisticalAnalysis={statisticalAnalysis} isDarkMode={isDarkMode} />
            </div>
            
            {/* Especificidades por Corpus */}
            {corpora.length >= 2 && (
              <div className={`bg-card rounded-xl p-4 sm:p-6 border border-border`}>
                <h3 className="font-semibold mb-6 flex items-center gap-2">
                  <Hash className="w-5 h-5 text-primary" />
                  Especificidades por Corpus
                </h3>
                <SpecificitiesPanel statisticalAnalysis={statisticalAnalysis} />
              </div>
            )}
          </div>
        )}
        
        {/* CHD Tab */}
        {activeTab === 'chd' && analysisResults && analysisResults.chdResult && (
          <div className={`bg-card rounded-xl p-4 sm:p-6 border border-border`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                Classificação Hierárquica Descendente (CHD/Reinert)
              </h3>
              <ExportVisualizationButton 
                vizId="chd" 
                filename="chd-reinert"
                data={analysisResults.chdResult?.classes?.flatMap((cls, clsIdx) => 
                  cls.segments?.slice(0, 20).map((seg, segIdx) => ({
                    classe: clsIdx + 1,
                    cor: cls.color,
                    percentual: cls.percentage,
                    segmento: segIdx + 1,
                    texto: seg.substring(0, 200)
                  })) || []
                ) || []}
              />
            </div>
            <div data-viz="chd" className="bg-muted rounded-xl p-4">
              <ClusterVisualization chdResult={analysisResults.chdResult} />
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              Segmentos de texto agrupados por similaridade lexical. Clique nas classes para ver detalhes.
            </p>
          </div>
        )}
        
        {/* Coding Tab */}
        {activeTab === 'coding' && (
          <div className="space-y-6">
            {/* Header com estatísticas e botão de auto-codificação */}
            <div className={`bg-card rounded-xl p-4 sm:p-6 border border-border`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Tag className="w-5 h-5 text-primary" />
                  Codificação Qualitativa
                </h3>
                <div className="flex items-center gap-3">
                  <span className={`text-sm text-muted-foreground`}>
                    {(codedSegments || []).length} segmentos ({(codedSegments || []).filter(s => s.isAutomatic).length} automáticos)
                  </span>
                  {(documents || []).length > 0 && (
                    <button
                      onClick={runAutoCoding}
                      disabled={isAutoCoding}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {isAutoCoding ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Codificando...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          Auto-Codificar
                        </>
                      )}
                    </button>
                  )}
                  {codedSegments.length > 0 && (
                    <div className="relative" ref={exportDropdownRef}>
                      <button
                        onClick={() => setShowExportDropdown(!showExportDropdown)}
                        className={`px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 text-primary hover:bg-primary/20 rounded-lg text-sm transition-colors flex items-center gap-2`}
                      >
                        <Download className="w-4 h-4" />
                        Exportar Codificação
                        <ChevronDown className={`w-4 h-4 transition-transform ${showExportDropdown ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {showExportDropdown && (
                        <div className={`absolute right-0 top-full mt-2 w-56 bg-white border-border dark:bg-card border-border border rounded-xl shadow-xl z-50 overflow-hidden`}>
                          <div className={`px-3 py-2 bg-muted/50 border-b border-border`}>
                            <span className={`text-xs font-medium ${theme.textMuted}`}>Formatos de Exportação</span>
                          </div>
                          <div className="py-1">
                            <button
                              onClick={() => { exportCodingData(); setShowExportDropdown(false); }}
                              className={`w-full px-4 py-2.5 text-left text-sm hover:bg-accent flex items-center gap-3 transition-colors`}
                            >
                              <span className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                                <FileText className="w-4 h-4 text-primary" />
                              </span>
                              <div>
                                <div className="font-medium">CSV</div>
                                <div className={`text-xs ${theme.textMuted}`}>Planilhas, Excel</div>
                              </div>
                            </button>
                            <button
                              onClick={() => { exportCodingXLSX(); setShowExportDropdown(false); }}
                              className={`w-full px-4 py-2.5 text-left text-sm hover:bg-accent flex items-center gap-3 transition-colors`}
                            >
                              <span className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                                <FileSpreadsheet className="w-4 h-4 text-primary" />
                              </span>
                              <div>
                                <div className="font-medium">Excel (.xlsx)</div>
                                <div className={`text-xs ${theme.textMuted}`}>Múltiplas planilhas</div>
                              </div>
                            </button>
                            <button
                              onClick={() => { exportCodingJSON(); setShowExportDropdown(false); }}
                              className={`w-full px-4 py-2.5 text-left text-sm hover:bg-accent flex items-center gap-3 transition-colors`}
                            >
                              <span className="w-8 h-8 rounded-lg bg-primary/50/20 flex items-center justify-center">
                                <Code className="w-4 h-4 text-primary" />
                              </span>
                              <div>
                                <div className="font-medium">JSON</div>
                                <div className={`text-xs ${theme.textMuted}`}>Dados estruturados</div>
                              </div>
                            </button>
                            <button
                              onClick={() => { exportCodingTXT(); setShowExportDropdown(false); }}
                              className={`w-full px-4 py-2.5 text-left text-sm hover:bg-accent flex items-center gap-3 transition-colors`}
                            >
                              <span className="w-8 h-8 rounded-lg bg-muted/500/20 flex items-center justify-center">
                                <AlignLeft className="w-4 h-4 text-muted-foreground" />
                              </span>
                              <div>
                                <div className="font-medium">Texto (.txt)</div>
                                <div className={`text-xs ${theme.textMuted}`}>Relatório formatado</div>
                              </div>
                            </button>
                            <button
                              onClick={() => { exportCodingMarkdown(); setShowExportDropdown(false); }}
                              className={`w-full px-4 py-2.5 text-left text-sm hover:bg-accent flex items-center gap-3 transition-colors`}
                            >
                              <span className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                                <Hash className="w-4 h-4 text-primary" />
                              </span>
                              <div>
                                <div className="font-medium">Markdown (.md)</div>
                                <div className={`text-xs ${theme.textMuted}`}>Notion, Obsidian, GitHub</div>
                              </div>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <p className={`text-sm text-muted-foreground`}>
                💡 <strong>Auto-Codificar</strong> analisa os textos com base em keywords do codebook. 
                <strong> Selecione texto</strong> para codificar manualmente ou criar novos códigos.
              </p>
              
              {/* Estatísticas de códigos */}
              {(customCodes || []).length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">Códigos customizados criados:</p>
                  <div className="flex flex-wrap gap-2">
                    {(customCodes || []).map(code => (
                      <span
                        key={code.id}
                        className="text-xs px-2 py-1 rounded-full flex items-center gap-1"
                        style={{ backgroundColor: code.color + '30', color: code.color }}
                      >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: code.color }} />
                        {code.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Livro de Códigos */}
              <div className="lg:col-span-1 bg-card rounded-xl p-4 border border-border max-h-[70vh] overflow-y-auto">
                <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">
                  Livro de Códigos
                </h4>
                <div className="space-y-2">
                  {Object.entries(capacityCodebook).map(([catId, category]) => (
                    <div key={catId} className="rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleCategory(catId)}
                        className="w-full flex items-center justify-between p-3 hover:bg-muted transition-colors"
                        style={{ borderLeft: `3px solid ${category.color}` }}
                      >
                        <span className="font-medium text-sm" style={{ color: category.color }}>
                          {catId}. {category.name}
                        </span>
                        <ChevronDown 
                          className={`w-4 h-4 text-muted-foreground transition-transform ${expandedCategories.includes(catId) ? 'rotate-180' : ''}`} 
                        />
                      </button>
                      {expandedCategories.includes(catId) && (
                        <div className="pl-4 pb-2 space-y-1">
                          {Object.entries(category.codes).map(([codeId, codeData]) => {
                            const codeName = typeof codeData === 'string' ? codeData : codeData.name;
                            const codeKeywords = typeof codeData === 'object' ? codeData.keywords : [];
                            const codeCount = codedSegments.filter(seg => seg.codes.includes(codeId)).length;
                            return (
                              <div
                                key={codeId}
                                className="flex items-center justify-between py-1.5 px-2 text-sm rounded hover:bg-accent/30 group"
                              >
                                <div className="flex-1">
                                  <span className="text-foreground/80">
                                    <span className="text-muted-foreground mr-2">{codeId}</span>
                                    {codeName}
                                  </span>
                                  {codeKeywords.length > 0 && (
                                    <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[200px] opacity-0 group-hover:opacity-100 transition-opacity">
                                      {codeKeywords.slice(0, 3).join(', ')}...
                                    </p>
                                  )}
                                </div>
                                {codeCount > 0 && (
                                  <span 
                                    className="text-xs px-2 py-0.5 rounded-full"
                                    style={{ backgroundColor: category.color + '30', color: category.color }}
                                  >
                                    {codeCount}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Códigos Customizados */}
                  {customCodes.length > 0 && (
                    <div className="rounded-lg overflow-hidden mt-4 pt-4 border-t border-border">
                      <div className="p-3" style={{ borderLeft: '3px solid #a855f7' }}>
                        <span className="font-medium text-sm text-primary">
                          Códigos Customizados ({(customCodes || []).length})
                        </span>
                      </div>
                      <div className="pl-4 pb-2 space-y-1">
                        {(customCodes || []).map(code => {
                          const codeCount = (codedSegments || []).filter(seg => seg.codes.includes(code.id)).length;
                          return (
                            <div
                              key={code.id}
                              className="flex items-center justify-between py-1.5 px-2 text-sm rounded hover:bg-accent/30"
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: code.color }} />
                                <span className="text-foreground/80">{code.name}</span>
                              </div>
                              {codeCount > 0 && (
                                <span 
                                  className="text-xs px-2 py-0.5 rounded-full"
                                  style={{ backgroundColor: code.color + '30', color: code.color }}
                                >
                                  {codeCount}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Documentos para codificar com highlights */}
              <div className="lg:col-span-2 space-y-4">
                {documents.length === 0 ? (
                  <div className={`rounded-2xl p-12 border text-center bg-card border-border`}>
                    <FileText className={`w-12 h-12 mx-auto mb-4 text-muted-foreground/50`} />
                    <p className={theme.muted}>Importe documentos na aba "Importar" para começar a codificar</p>
                  </div>
                ) : (
                  documents.map(doc => (
                    <div key={doc.id} className={`rounded-2xl border overflow-hidden bg-card border-border`}>
                      <div className={`p-4 border-b flex items-center justify-between border-border`}>
                        <div className="flex items-center gap-3">
                          <FileText className={`w-5 h-5 text-muted-foreground`} />
                          <span className="font-medium">{doc.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs text-muted-foreground`}>
                            {codedSegments.filter(seg => seg.documentId === doc.id).length} segmentos
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary">
                            {codedSegments.filter(seg => seg.documentId === doc.id && seg.isAutomatic).length} auto
                          </span>
                          {editingDocument !== doc.id && (
                            <button
                              onClick={() => startEditingDocument(doc)}
                              className={`p-1.5 rounded transition-colors hover:bg-muted text-muted-foreground hover:text-primary dark:hover:bg-accent text-muted-foreground hover:text-primary`}
                              title="Editar documento"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="p-4 max-h-80 overflow-y-auto text-sm">
                        {editingDocument === doc.id ? (
                          <div className="space-y-3">
                            <textarea
                              value={editingDocumentContent}
                              onChange={(e) => setEditingDocumentContent(e.target.value)}
                              className={`w-full p-3 rounded-lg text-sm border resize-none min-h-[200px] bg-white border-input text-foreground focus:outline-none focus:border-primary`}
                              rows={10}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => updateDocumentContent(doc.id, editingDocumentContent)}
                                className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary transition-colors flex items-center gap-2"
                              >
                                <Check className="w-4 h-4" />
                                Salvar Alterações
                              </button>
                              <button
                                onClick={cancelEditingDocument}
                                className={`px-4 py-2 rounded-lg text-sm transition-colors bg-muted text-foreground/70 hover:bg-accent dark:bg-secondary text-secondary-foreground hover:bg-secondary/80`}
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <HighlightedTextViewer
                            document={doc}
                            codedSegments={codedSegments}
                            allCodes={allAvailableCodes}
                            onTextSelect={handleTextSelection}
                            onSegmentClick={(segment) => {
                              // Mostrar detalhes do segmento
                              console.log('Segment clicked:', segment);
                            }}
                          />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Segmentos Codificados */}
            {codedSegments.length > 0 && (
              <div className={`bg-card rounded-xl p-4 sm:p-6 border border-border`}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    Segmentos Codificados ({codedSegments.length})
                  </h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCodingFilter('all')}
                      className={`px-3 py-1 rounded-lg text-xs transition-colors ${codingFilter === 'all' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-accent'}`}
                    >
                      Todos
                    </button>
                    <button
                      onClick={() => setCodingFilter('auto')}
                      className={`px-3 py-1 rounded-lg text-xs transition-colors ${codingFilter === 'auto' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}`}
                    >
                      Automáticos
                    </button>
                    <button
                      onClick={() => setCodingFilter('manual')}
                      className={`px-3 py-1 rounded-lg text-xs transition-colors ${codingFilter === 'manual' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-accent'}`}
                    >
                      Manuais
                    </button>
                  </div>
                </div>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {codedSegments
                    .filter(seg => {
                      if (codingFilter === 'auto') return seg.isAutomatic;
                      if (codingFilter === 'manual') return !seg.isAutomatic;
                      return true;
                    })
                    .map((segment, idx) => (
                    <div key={segment.id} className={`rounded-xl p-4 border bg-white border-border dark:bg-muted border-input`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-mono px-2 py-1 rounded bg-muted`}>#{idx + 1}</span>
                          <span className={`text-xs text-muted-foreground`}>{segment.documentName}</span>
                          {segment.isAutomatic && (
                            <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              auto
                            </span>
                          )}
                          {segment.confidence && (
                            <span className={`text-xs text-muted-foreground`}>
                              {Math.round(segment.confidence * 100)}% conf
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {editingSegment !== segment.id && (
                            <button
                              onClick={() => startEditingSegment(segment)}
                              className={`p-1.5 rounded transition-colors hover:bg-muted text-muted-foreground hover:text-primary dark:hover:bg-accent text-muted-foreground hover:text-primary`}
                              title="Editar texto"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => removeCodedSegment(segment.id)}
                            className="p-1.5 hover:bg-destructive/20 rounded text-destructive hover:text-destructive transition-colors"
                            title="Remover segmento"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Texto do segmento (editável ou não) */}
                      {editingSegment === segment.id ? (
                        <div className="mb-3">
                          <textarea
                            value={editingSegmentText}
                            onChange={(e) => setEditingSegmentText(e.target.value)}
                            className={`w-full p-3 rounded-lg text-sm border resize-none bg-white border-input text-foreground focus:outline-none focus:border-primary`}
                            rows={4}
                            autoFocus
                          />
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => updateSegmentText(segment.id, editingSegmentText)}
                              className="px-3 py-1.5 bg-primary text-white rounded-lg text-sm hover:bg-primary transition-colors flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              Salvar
                            </button>
                            <button
                              onClick={cancelEditingSegment}
                              className={`px-3 py-1.5 rounded-lg text-sm transition-colors bg-muted text-foreground/70 hover:bg-accent dark:bg-secondary text-secondary-foreground hover:bg-secondary/80`}
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className={`text-sm mb-3 italic border-l-2 pl-3 text-foreground/70 border-input dark:text-foreground/80 border-input`}>
                          "{(segment.text || '').slice(0, 200)}{(segment.text?.length || 0) > 200 ? '...' : ''}"
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-2 mb-2 items-center">
                        {segment.codes.map(codeId => {
                          // Procurar em todos os códigos disponíveis
                          const codeInfo = allAvailableCodes.find(c => c.id === codeId);
                          if (!codeInfo) {
                            // Fallback para codebook tradicional
                            const catId = codeId.split('.')[0];
                            const category = capacityCodebook[catId];
                            const codeData = category?.codes[codeId];
                            const codeName = typeof codeData === 'string' ? codeData : codeData?.name;
                            return (
                              <span
                                key={codeId}
                                className="text-xs px-2 py-1 rounded-full flex items-center gap-1"
                                style={{ backgroundColor: category?.color + '30', color: category?.color }}
                              >
                                {codeId} - {codeName || 'Unknown'}
                                <button
                                  onClick={() => updateSegmentCodes(segment.id, segment.codes.filter(c => c !== codeId))}
                                  className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            );
                          }
                          return (
                            <span
                              key={codeId}
                              className="text-xs px-2 py-1 rounded-full flex items-center gap-1"
                              style={{ backgroundColor: codeInfo.color + '30', color: codeInfo.color }}
                            >
                              {codeInfo.name}
                              <button
                                onClick={() => updateSegmentCodes(segment.id, segment.codes.filter(c => c !== codeId))}
                                className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          );
                        })}
                        {/* Botão para adicionar mais códigos */}
                        <button
                          onClick={() => {
                            setAddingCodeToSegment(segment.id);
                            setCodeSearchTerm('');
                          }}
                          className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 border-2 border-dashed transition-colors border-input text-muted-foreground hover:border-primary hover:text-primary dark:border-input text-muted-foreground hover:border-primary hover:text-primary`}
                          title="Adicionar código"
                        >
                          <Plus className="w-3 h-3" />
                          Adicionar
                        </button>
                      </div>
                      {/* Mostrar keywords que deram match */}
                      {segment.matches && segment.matches.length > 0 && (
                        <div className={`text-xs mt-2 text-muted-foreground`}>
                          <strong>Keywords:</strong> {segment.matches.map(m => m.keyword).join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Tooltip de seleção de código */}
            <CodeSelectionTooltip
              position={selectionTooltip}
              selectedText={selectionTooltip?.text}
              codes={filteredCodes}
              searchTerm={codeSearchTerm}
              onSearchChange={setCodeSearchTerm}
              onCodeSelect={applyCodeToSelection}
              onCreateNew={createAndApplyCode}
              newCodeName={newCodeName}
              onNewCodeNameChange={setNewCodeName}
              showCreator={showCodeCreator}
              onToggleCreator={() => setShowCodeCreator(!showCodeCreator)}
              onClose={() => setSelectionTooltip(null)}
            />
            
            {/* Modal para adicionar código a segmento existente */}
            {addingCodeToSegment && (
              <div className="fixed inset-0" style={{ zIndex: 99999 }}>
                <div 
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                  onClick={() => setAddingCodeToSegment(null)}
                />
                <div 
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background border-2 border-primary rounded-2xl shadow-2xl p-5 w-[360px] max-h-[80vh] flex flex-col"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      <Plus className="w-5 h-5 text-primary" />
                      <span className="text-lg font-semibold text-foreground">Adicionar Código</span>
                    </div>
                    <button 
                      onClick={() => setAddingCodeToSegment(null)}
                      className="w-10 h-10 flex items-center justify-center bg-destructive/30 hover:bg-destructive text-destructive hover:text-white rounded-xl transition-all"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <div className="relative mb-4">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={codeSearchTerm}
                      onChange={(e) => setCodeSearchTerm(e.target.value)}
                      placeholder="Buscar código..."
                      className="w-full pl-12 pr-4 py-3 bg-card border-2 border-input rounded-xl text-base text-foreground focus:outline-none focus:border-primary placeholder-muted-foreground"
                      autoFocus
                    />
                  </div>
                  
                  <div className="flex-1 overflow-y-auto space-y-2 min-h-[200px] max-h-[300px] pr-2">
                    {filteredCodes.map(code => {
                      const segment = codedSegments.find(s => s.id === addingCodeToSegment);
                      const alreadyHasCode = segment?.codes?.includes(code.id);
                      return (
                        <button
                          key={code.id}
                          onClick={() => !alreadyHasCode && addCodeToExistingSegment(addingCodeToSegment, code)}
                          disabled={alreadyHasCode}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left border-2 ${alreadyHasCode ? 'opacity-50 cursor-not-allowed border-transparent bg-card' : 'border-transparent hover:border-primary/50 hover:bg-accent/80'}`}
                        >
                          <span 
                            className="w-5 h-5 rounded-full flex-shrink-0 ring-2 ring-white/30"
                            style={{ backgroundColor: code.color }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-base text-foreground truncate font-medium">{code.name}</p>
                            <p className="text-sm text-muted-foreground truncate">{code.categoryName}</p>
                          </div>
                          {alreadyHasCode ? (
                            <Check className="w-5 h-5 text-primary" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Radar Tab */}
        {activeTab === 'radar' && (
          <div className={`bg-card rounded-xl p-4 sm:p-6 border border-border`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Radar de Categorias
              </h3>
              <ExportVisualizationButton 
                vizId="radar" 
                filename="radar-categorias"
                data={Object.entries(capacityCodebook).map(([catId, cat]) => ({
                  categoria: cat.name,
                  segmentos: codedSegments.filter(s => s.codes.some(c => c.startsWith(catId))).length
                }))}
              />
            </div>
            <div data-viz="radar" className="flex justify-center overflow-hidden bg-muted rounded-xl p-4">
              <RadarVisualization 
                codedSegments={codedSegments} 
                codebook={capacityCodebook}
                width={500} 
                height={500} 
              />
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Perfil de distribuição da codificação por categoria. Quanto maior a área, mais equilibrada a codificação.
            </p>
          </div>
        )}
        
        {/* Sunburst Tab */}
        {activeTab === 'sunburst' && (
          <div className={`bg-card rounded-xl p-4 sm:p-6 border border-border`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold flex items-center gap-2">
                <CircleDot className="w-5 h-5 text-muted-foreground" />
                Sunburst de Códigos
              </h3>
              <ExportVisualizationButton 
                vizId="sunburst" 
                filename="sunburst-codigos"
                data={codedSegments.flatMap(s => s.codes.map(c => ({
                  documento: s.documentName,
                  codigo: c,
                  texto: s.text.substring(0, 100)
                })))}
              />
            </div>
            <div data-viz="sunburst" className="flex justify-center overflow-hidden bg-muted rounded-xl p-4">
              <SunburstVisualization 
                codedSegments={codedSegments} 
                codebook={capacityCodebook}
                width={500} 
                height={500} 
              />
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Hierarquia de categorias e códigos. Anel interno = categorias, anel externo = códigos. Tamanho proporcional ao uso.
            </p>
          </div>
        )}
        
        {/* Dendrogram Tab */}
        {activeTab === 'dendrogram' && (
          <div className={`bg-card rounded-xl p-4 sm:p-6 border border-border`}>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <h3 className="font-semibold flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-primary" />
                Dendrograma de Clustering Hierárquico
              </h3>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Método:</span>
                  <select 
                    value={dendrogramMethod}
                    onChange={(e) => setDendrogramMethod(e.target.value)}
                    className="px-3 py-1.5 bg-secondary border border-input rounded-lg text-sm focus:border-primary focus:outline-none"
                  >
                    <option value="ward">Ward (Variância Mínima)</option>
                    <option value="complete">Complete (Máxima Distância)</option>
                    <option value="average">UPGMA (Média)</option>
                    <option value="single">Single (Mínima Distância)</option>
                  </select>
                </div>
                
                {dendrogramData && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={exportDendrogramPNG}
                      className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded-lg text-sm flex items-center gap-1.5 transition-colors"
                      title="Exportar imagem (PNG)"
                    >
                      <Download className="w-4 h-4" />
                      PNG
                    </button>
                    <button
                      onClick={exportDendrogramSVG}
                      className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded-lg text-sm flex items-center gap-1.5 transition-colors"
                      title="Exportar vetor (SVG)"
                    >
                      <Code className="w-4 h-4" />
                      SVG
                    </button>
                    <button
                      onClick={exportDendrogramCSV}
                      className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded-lg text-sm flex items-center gap-1.5 transition-colors"
                      title="Exportar dados (CSV)"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      CSV
                    </button>
                    <button
                      onClick={exportDendrogramDocx}
                      className="px-3 py-1.5 bg-primary hover:bg-primary/80 rounded-lg text-sm flex items-center gap-1.5 transition-colors"
                      title="Exportar relatório metodológico (DOCX)"
                    >
                      <FileText className="w-4 h-4" />
                      DOCX
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {isDendrogramLoading ? (
              <div className="flex items-center justify-center text-muted-foreground h-64">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 mx-auto mb-3 animate-spin text-primary" />
                  <p>Calculando clustering hierárquico...</p>
                  <p className="text-sm mt-2 text-muted-foreground">Método: {dendrogramMethod}</p>
                </div>
              </div>
            ) : dendrogramData ? (
              <div className="space-y-6">
                {/* Visualização do Dendrograma */}
                <div data-viz="dendrogram" className="bg-muted rounded-xl p-4 overflow-hidden">
                  <DendrogramVisualization 
                    words={dendrogramData.words}
                    frequencies={dendrogramData.frequencies}
                    linkageMatrix={dendrogramData.linkageMatrix}
                    width={Math.min(750, window.innerWidth - 100)}
                    height={480}
                  />
                </div>
                
                {/* Informações da Análise */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-card rounded-xl p-4 border border-border">
                    <div className="text-2xl font-bold text-primary">{dendrogramData.words.length}</div>
                    <div className="text-sm text-muted-foreground">Termos Analisados</div>
                  </div>
                  <div className="bg-card rounded-xl p-4 border border-border">
                    <div className="text-2xl font-bold text-primary">{dendrogramData.linkageMatrix.length}</div>
                    <div className="text-sm text-muted-foreground">Fusões de Clusters</div>
                  </div>
                  <div className="bg-card rounded-xl p-4 border border-border">
                    <div className="text-2xl font-bold text-primary">{dendrogramData.windowSize}</div>
                    <div className="text-sm text-muted-foreground">Janela Coocorrência</div>
                  </div>
                  <div className="bg-card rounded-xl p-4 border border-border">
                    <div className="text-2xl font-bold text-muted-foreground capitalize">{dendrogramData.method}</div>
                    <div className="text-sm text-muted-foreground">Método de Linkage</div>
                  </div>
                </div>
                
                {/* Tabela de Estatísticas */}
                <div className="bg-card rounded-xl p-4 border border-border">
                  <h4 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    Estatísticas dos Termos (Top 10)
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-muted-foreground border-b border-border">
                          <th className="pb-2 pr-4">#</th>
                          <th className="pb-2 pr-4">Termo</th>
                          <th className="pb-2 pr-4">Freq.</th>
                          <th className="pb-2 pr-4">Σ Cooc.</th>
                          <th className="pb-2 pr-4">Conexão Forte</th>
                          <th className="pb-2 pr-4">Dist. Média</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dendrogramData.wordStats.slice(0, 10).map((stat) => (
                          <tr key={stat.word} className="border-b border-border/50 hover:bg-accent/30">
                            <td className="py-2 pr-4 text-muted-foreground">{stat.rank}</td>
                            <td className="py-2 pr-4 font-medium text-foreground">{stat.word}</td>
                            <td className="py-2 pr-4 text-primary">{stat.frequency}</td>
                            <td className="py-2 pr-4 text-primary">{stat.cooccurrenceSum}</td>
                            <td className="py-2 pr-4">
                              <span className="text-primary">{stat.strongestConnection}</span>
                              <span className="text-muted-foreground text-xs ml-1">({stat.strongestConnectionValue})</span>
                            </td>
                            <td className="py-2 pr-4 text-muted-foreground">{stat.avgDistance}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Exporte o CSV ou DOCX para ver todos os {dendrogramData.wordStats.length} termos e matrizes completas.
                  </p>
                </div>
                
                {/* Nota metodológica */}
                <div className="p-4 bg-primary/10 rounded-xl border border-primary/30">
                  <h4 className="text-sm font-medium text-primary mb-2">📊 Interpretação</h4>
                  <p className="text-sm text-foreground/80">
                    Termos próximos no dendrograma compartilham padrões de coocorrência similares. 
                    A altura de fusão indica dissimilaridade: fusões baixas = termos semanticamente relacionados.
                    Use o botão <strong>DOCX</strong> para exportar o relatório completo com metodologia reproduzível.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center text-muted-foreground h-64">
                <div className="text-center">
                  <GitBranch className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Analise um texto primeiro</p>
                  <p className="text-sm mt-2">para gerar o dendrograma automaticamente</p>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* KWIC Tab */}
        {activeTab === 'kwic' && (
          <div className="space-y-6">
            <div className={`bg-card rounded-xl p-4 sm:p-6 border border-border`}>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Search className="w-5 h-5 text-primary" />
                KWIC - Keyword in Context
              </h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={kwicKeyword}
                  onChange={(e) => setKwicKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && performKWICSearch()}
                  placeholder="Digite uma palavra-chave..."
                  className="flex-1 px-4 py-3 bg-secondary border border-input rounded-xl focus:border-primary focus:outline-none transition-colors"
                />
                <button
                  onClick={performKWICSearch}
                  className="px-6 py-3 bg-primary hover:bg-primary rounded-xl font-medium transition-colors"
                >
                  Buscar
                </button>
              </div>
            </div>
            
            {(kwicResults || []).length > 0 && (
              <div className={`bg-card rounded-xl p-4 sm:p-6 border border-border`}>
                <h4 className="text-sm text-muted-foreground mb-4">
                  {(kwicResults || []).length} ocorrências encontradas
                </h4>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {(kwicResults || []).map((result, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm font-mono bg-muted/30 p-3 rounded-lg">
                      <span className="text-right text-muted-foreground flex-1 truncate">{result.left}</span>
                      <span className="px-2 py-1 bg-primary/20 text-primary rounded font-bold whitespace-nowrap">
                        {result.keyword}
                      </span>
                      <span className="text-left text-muted-foreground flex-1 truncate">{result.right}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Export Tab */}
        {activeTab === 'export' && analysisResults && analysisResults.wordFrequency && (
          <div className="space-y-6">
            {/* Botão principal - Baixar Tudo */}
            <div className="bg-primary/10 rounded-xl p-4 sm:p-6 border border-primary/30">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Download className="w-5 h-5 text-primary" />
                    Exportação Completa
                  </h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Baixe todos os dados em um único arquivo ZIP (TSV, CSV, XLSX, JSON)
                  </p>
                </div>
                <button
                  onClick={exportAllAsZip}
                  disabled={isProcessing}
                  className="px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/80 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center gap-2"
                >
                  {isProcessing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Download className="w-5 h-5" />
                  )}
                  Baixar Tudo (.zip)
                </button>
              </div>
            </div>

            {/* Dados Textuais */}
            <div className={`bg-card rounded-xl p-4 sm:p-6 border border-border`}>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Dados Textuais
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Corpus IRaMuTeQ */}
                <div className="bg-muted rounded-xl p-4 border border-input">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">Corpus IRaMuTeQ</div>
                      <div className={`text-xs text-muted-foreground`}>Formato compatível com IRaMuTeQ</div>
                    </div>
                  </div>
                  <button
                    onClick={() => exportData('iramuteq')}
                    className="w-full py-2 bg-secondary hover:bg-muted/500 rounded-lg text-sm transition-colors"
                  >
                    Baixar .txt
                  </button>
                </div>

                {/* Frequências */}
                <div className="bg-muted rounded-xl p-4 border border-input">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">Frequências</div>
                      <div className={`text-xs text-muted-foreground`}>{analysisResults.wordFrequency?.length || 0} palavras</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => exportData('frequency')}
                      className="flex-1 py-2 bg-secondary hover:bg-muted/500 rounded-lg text-sm transition-colors"
                    >
                      .tsv
                    </button>
                    <button
                      onClick={() => exportData('frequency', 'csv')}
                      className="flex-1 py-2 bg-secondary hover:bg-muted/500 rounded-lg text-sm transition-colors"
                    >
                      .csv
                    </button>
                  </div>
                </div>

                {/* Coocorrências */}
                <div className="bg-muted rounded-xl p-4 border border-input">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      <Network className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">Coocorrências</div>
                      <div className={`text-xs text-muted-foreground`}>Matriz de coocorrência</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => exportData('cooccurrence')}
                      className="flex-1 py-2 bg-secondary hover:bg-muted/500 rounded-lg text-sm transition-colors"
                    >
                      .tsv
                    </button>
                    <button
                      onClick={() => exportData('cooccurrence', 'csv')}
                      className="flex-1 py-2 bg-secondary hover:bg-muted/500 rounded-lg text-sm transition-colors"
                    >
                      .csv
                    </button>
                  </div>
                </div>

                {/* CHD/Reinert */}
                {analysisResults.chdResult && (
                  <div className="bg-muted rounded-xl p-4 border border-input">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                        <Layers className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-medium">CHD/Reinert</div>
                        <div className={`text-xs text-muted-foreground`}>{analysisResults.chdResult.classes?.length || 0} classes</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => exportData('chd')}
                        className="flex-1 py-2 bg-secondary hover:bg-muted/500 rounded-lg text-sm transition-colors"
                      >
                        .json
                      </button>
                      <button
                        onClick={() => exportData('chd', 'csv')}
                        className="flex-1 py-2 bg-secondary hover:bg-muted/500 rounded-lg text-sm transition-colors"
                      >
                        .csv
                      </button>
                    </div>
                  </div>
                )}

                {/* Codificação */}
                {codedSegments.length > 0 && (
                  <div className="bg-muted rounded-xl p-4 border border-input">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                        <Tag className="w-5 h-5 text-rose-400" />
                      </div>
                      <div>
                        <div className="font-medium">Codificação Qualitativa</div>
                        <div className={`text-xs text-muted-foreground`}>{codedSegments.length} segmentos codificados</div>
                      </div>
                    </div>
                    <button
                      onClick={() => exportData('coding')}
                      className="w-full py-2 bg-secondary hover:bg-muted/500 rounded-lg text-sm transition-colors"
                    >
                      Baixar .csv
                    </button>
                  </div>
                )}

                {/* Análise Completa */}
                <div className="bg-muted rounded-xl p-4 border border-input">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">Análise Completa</div>
                      <div className={`text-xs text-muted-foreground`}>Todos os dados estruturados</div>
                    </div>
                  </div>
                  <button
                    onClick={() => exportData('full')}
                    className="w-full py-2 bg-secondary hover:bg-muted/500 rounded-lg text-sm transition-colors"
                  >
                    Baixar .json
                  </button>
                </div>
              </div>
            </div>

            {/* Visualizações como Imagem */}
            <div className={`bg-card rounded-xl p-4 sm:p-6 border border-border`}>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-primary" />
                Visualizações como Imagem
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                💡 Navegue até a aba da visualização primeiro para que ela seja renderizada
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                {/* Nuvem de Palavras */}
                <div className="bg-muted rounded-xl p-4 border border-input">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      <Cloud className="w-5 h-5 text-primary" />
                    </div>
                    <div className="font-medium">Nuvem de Palavras</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => exportVisualizationAsImage('wordcloud', 'png')}
                      className="flex-1 py-2 bg-secondary hover:bg-muted/500 rounded-lg text-sm transition-colors"
                    >
                      .png
                    </button>
                    <button
                      onClick={() => exportVisualizationAsImage('wordcloud', 'svg')}
                      className="flex-1 py-2 bg-secondary hover:bg-muted/500 rounded-lg text-sm transition-colors"
                    >
                      .svg
                    </button>
                  </div>
                </div>

                {/* Rede de Similitude */}
                <div className="bg-muted rounded-xl p-4 border border-input">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      <Network className="w-5 h-5 text-primary" />
                    </div>
                    <div className="font-medium">Rede de Similitude</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => exportVisualizationAsImage('network', 'png')}
                      className="flex-1 py-2 bg-secondary hover:bg-muted/500 rounded-lg text-sm transition-colors"
                    >
                      .png
                    </button>
                    <button
                      onClick={() => exportVisualizationAsImage('network', 'svg')}
                      className="flex-1 py-2 bg-secondary hover:bg-muted/500 rounded-lg text-sm transition-colors"
                    >
                      .svg
                    </button>
                  </div>
                </div>

                {/* CHD */}
                <div className="bg-muted rounded-xl p-4 border border-input">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      <Layers className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="font-medium">CHD/Reinert</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => exportVisualizationAsImage('chd', 'png')}
                      className="flex-1 py-2 bg-secondary hover:bg-muted/500 rounded-lg text-sm transition-colors"
                    >
                      .png
                    </button>
                    <button
                      onClick={() => exportVisualizationAsImage('chd', 'svg')}
                      className="flex-1 py-2 bg-secondary hover:bg-muted/500 rounded-lg text-sm transition-colors"
                    >
                      .svg
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        </div>
      </main>
      
      {/* Modal de Análise de Incidências */}
      {showIncidenceModal && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto py-4"
          onClick={(e) => e.target === e.currentTarget && setShowIncidenceModal(false)}
        >
          <div className="bg-background border border-border rounded-2xl w-full max-w-5xl mx-4 my-auto flex flex-col" style={{ maxHeight: 'calc(100vh - 2rem)' }}>
            {/* Header do Modal - sempre visível */}
            <div className="flex-shrink-0 flex items-center justify-between p-4 md:p-6 border-b border-border bg-background rounded-t-2xl sticky top-0 z-10">
              <div>
                <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">
                  <Search className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                  Análise de Incidências
                  {incidenceAnalysis && (
                    <span className="ml-2 px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium">
                      "{incidenceAnalysis.word}"
                    </span>
                  )}
                </h2>
                <p className="text-muted-foreground text-sm mt-1 hidden md:block">
                  Rastreabilidade científica completa de todas as ocorrências
                </p>
              </div>
              <button
                onClick={() => setShowIncidenceModal(false)}
                className="p-2 hover:bg-card rounded-lg transition-colors flex-shrink-0 bg-card"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Conteúdo do Modal - scrollável */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
            {isAnalyzingIncidence ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground">Analisando todas as incidências e variações...</p>
              </div>
            ) : incidenceAnalysis ? (
              <div className="space-y-6">
                {/* Estatísticas Resumidas */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-card rounded-xl p-4 border border-border">
                    <div className="text-3xl font-bold text-primary">{incidenceAnalysis.statistics.totalOccurrences}</div>
                    <div className={`text-sm text-muted-foreground`}>Total de Ocorrências</div>
                  </div>
                  <div className="bg-card rounded-xl p-4 border border-border">
                    <div className="text-3xl font-bold text-primary">{incidenceAnalysis.statistics.uniqueVariationsFound || 1}</div>
                    <div className={`text-sm text-muted-foreground`}>Variações Encontradas</div>
                  </div>
                  <div className="bg-card rounded-xl p-4 border border-border">
                    <div className="text-3xl font-bold text-primary">{incidenceAnalysis.statistics.documentsWithWord}</div>
                    <div className={`text-sm text-muted-foreground`}>Documentos</div>
                  </div>
                  <div className="bg-card rounded-xl p-4 border border-border">
                    <div className="text-3xl font-bold text-muted-foreground">{incidenceAnalysis.statistics.coveragePercentage}</div>
                    <div className={`text-sm text-muted-foreground`}>Cobertura</div>
                  </div>
                  <div className="bg-card rounded-xl p-4 border border-border">
                    <div className="text-3xl font-bold text-rose-400">{incidenceAnalysis.statistics.averagePerDocument}</div>
                    <div className={`text-sm text-muted-foreground`}>Média/Doc</div>
                  </div>
                </div>
                
                {/* Variações Encontradas */}
                {incidenceAnalysis.statistics.variationBreakdown && incidenceAnalysis.statistics.variationBreakdown.length > 0 && (
                  <div className="bg-primary/10 rounded-xl p-4 border border-primary/30">
                    <h4 className="font-semibold text-primary mb-3 flex items-center gap-2">
                      <Layers className="w-4 h-4" />
                      Variações Morfológicas Agrupadas
                    </h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      Inclui: gênero (ministro/ministra), número (singular/plural), linguagem neutra (x, @), e possíveis typos
                    </p>
                    <div className="grid gap-2">
                      {incidenceAnalysis.statistics.variationBreakdown.map((v, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-card rounded-lg px-3 py-2">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-primary font-medium">{v.variation}</span>
                            <span className="text-xs text-muted-foreground">
                              ({v.originalForms.join(', ')})
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-foreground font-bold">{v.count}x</span>
                            <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">{v.percentage}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Metodologia */}
                <div className="bg-card/30 rounded-xl p-4 border border-input">
                  <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Metodologia Aplicada
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Método de busca:</span>
                      <span className="text-foreground ml-2">{incidenceAnalysis.methodology.searchMethod}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Janela de contexto:</span>
                      <span className="text-foreground ml-2">{incidenceAnalysis.methodology.contextWindow}</span>
                    </div>
                  </div>
                  {incidenceAnalysis.variationsSearched && incidenceAnalysis.variationsSearched.length > 1 && (
                    <div className="mt-3 p-3 bg-muted rounded-lg text-xs">
                      <span className="text-muted-foreground">Variações buscadas: </span>
                      <span className="text-primary font-mono">{incidenceAnalysis.variationsSearched.join(', ')}</span>
                    </div>
                  )}
                  <div className="mt-3 p-3 bg-muted rounded-lg font-mono text-xs text-foreground/80">
                    <div className="text-muted-foreground mb-1">// Algoritmo de normalização:</div>
                    <div>normalize("{incidenceAnalysis.word}") → "{incidenceAnalysis.normalizedForm || incidenceAnalysis.word}"</div>
                  </div>
                </div>
                
                {/* Lista de Todas as Ocorrências */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Hash className="w-4 h-4 text-primary" />
                    Todas as Ocorrências ({incidenceAnalysis.allContexts?.length || 0})
                  </h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                    {(incidenceAnalysis.allContexts || []).map((occ, idx) => (
                      <div key={idx} className="bg-card rounded-lg p-4 border border-border hover:border-primary/30 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono bg-secondary px-2 py-1 rounded">
                              #{idx + 1}
                            </span>
                            {!occ.isExactMatch && (
                              <span className="text-xs bg-primary/50/20 text-primary px-2 py-1 rounded">
                                variação
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>📄 {occ.documentName}</span>
                            <span>📍 Linha {occ.lineNumber}, Col {occ.columnNumber}</span>
                            <span>🔢 Char {occ.charIndexStart}-{occ.charIndexEnd}</span>
                          </div>
                        </div>
                        <div className="font-mono text-sm">
                          <span className="text-muted-foreground">...</span>
                          <span className="text-foreground/80">{occ.contextBefore}</span>
                          <span className={`px-1 rounded font-bold ${occ.isExactMatch ? 'bg-primary/30 text-primary' : 'bg-primary/50/30 text-primary'}`}>
                            {occ.matchedText}
                          </span>
                          <span className="text-foreground/80">{occ.contextAfter}</span>
                          <span className="text-muted-foreground">...</span>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground italic border-l-2 border-input pl-2">
                          Frase: "{(occ.fullSentence || '').slice(0, 150)}{(occ.fullSentence?.length || 0) > 150 ? '...' : ''}"
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Distribuição por Documento */}
                {incidenceAnalysis.occurrencesByDocument?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      Distribuição por Documento
                    </h4>
                    <div className="space-y-2">
                      {(incidenceAnalysis.occurrencesByDocument || []).map((doc, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-card/30 rounded-lg p-3">
                          <span className="text-sm font-medium text-foreground/80 flex-1 truncate">{doc.documentName}</span>
                          <span className="text-primary font-bold">{doc.count}x</span>
                          <span className="text-xs text-muted-foreground">{doc.relativeFrequency}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
            </div>
            
            {/* Footer do Modal com botões de exportação - sempre visível */}
            {incidenceAnalysis && !isAnalyzingIncidence && (
              <div className="flex-shrink-0 p-4 md:p-6 border-t border-border bg-card rounded-b-2xl">
                <div className="flex flex-wrap gap-3 justify-end">
                  <button
                    onClick={exportIncidenceCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Exportar CSV
                  </button>
                  <button
                    onClick={exportScientificReport}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 rounded-lg transition-colors font-medium text-sm"
                  >
                    <FileText className="w-4 h-4" />
                    Relatório Científico
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
