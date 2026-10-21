/**
 * Shared game data: word dictionaries, syllables, draw prompts, and AI bot helpers.
 */

// Common syllable prompts for Word Bomb
export const SYLLABLE_PROMPTS = [
  'TH', 'CH', 'SH', 'STR', 'BL', 'CR', 'SP', 'FL', 'GR', 'PL',
  'TR', 'ST', 'BR', 'CL', 'DR', 'FR', 'GL', 'PR', 'SC', 'SK',
  'SL', 'SM', 'SN', 'SW', 'TW', 'ING', 'TION', 'OUS', 'ABLE',
  'MENT', 'ER', 'EST', 'ALL', 'ELL', 'ILL', 'OLL', 'ULL',
  'AND', 'END', 'IND', 'OND', 'UND', 'ARK', 'ERK', 'IRK', 'ORK',
  'ACE', 'ICE', 'OCE', 'UCE', 'ATE', 'ITE', 'OTE', 'UTE',
  'CAT', 'DOG', 'SUN', 'STAR', 'FIRE', 'WIND', 'SEA', 'RAIN',
  'RED', 'BLUE', 'GOLD', 'FAST', 'SLOW', 'HIGH', 'DEEP', 'COLD'
];

// Rich dictionary of valid English words for Word Bomb verification
export const COMMON_DICTIONARY = new Set([
  'about', 'above', 'across', 'action', 'activity', 'actor', 'actually', 'addition', 'address', 'admin',
  'admit', 'adult', 'advance', 'advice', 'affect', 'after', 'again', 'against', 'agency', 'agent',
  'agree', 'agreement', 'ahead', 'air', 'aircraft', 'airline', 'airport', 'alarm', 'album', 'alcohol',
  'alive', 'allow', 'almost', 'alone', 'along', 'already', 'also', 'alter', 'always', 'amazing',
  'america', 'american', 'among', 'amount', 'analysis', 'ancient', 'animal', 'announce', 'annual', 'another',
  'answer', 'anticipate', 'anxious', 'anybody', 'anymore', 'anyone', 'anything', 'anyway', 'anywhere', 'apart',
  'apartment', 'apparent', 'appeal', 'appear', 'apple', 'apply', 'approach', 'approve', 'area', 'argue',
  'argument', 'arise', 'armed', 'army', 'around', 'arrange', 'arrival', 'arrive', 'artist', 'aside',
  'ask', 'asleep', 'aspect', 'assert', 'assess', 'asset', 'assign', 'assist', 'assume', 'athlete',
  'attack', 'attempt', 'attend', 'attitude', 'attorney', 'attract', 'audience', 'author', 'authority', 'auto',
  'available', 'average', 'avoid', 'award', 'aware', 'away', 'baby', 'back', 'background', 'bad',
  'bag', 'balance', 'ball', 'banana', 'band', 'bank', 'bar', 'barely', 'barrel', 'base',
  'baseball', 'basic', 'basically', 'basis', 'basket', 'basketball', 'battery', 'battle', 'beach', 'bear',
  'beat', 'beautiful', 'beauty', 'because', 'become', 'bed', 'bedroom', 'beer', 'before', 'begin',
  'beginning', 'behavior', 'behind', 'being', 'belief', 'believe', 'bell', 'belong', 'below', 'belt',
  'bench', 'bend', 'beneath', 'benefit', 'beside', 'best', 'better', 'between', 'beyond', 'bicycle',
  'big', 'bike', 'bill', 'billion', 'bind', 'biological', 'bird', 'birth', 'birthday', 'bit',
  'bite', 'black', 'blade', 'blame', 'blanket', 'blind', 'block', 'blood', 'blow', 'blue',
  'board', 'boat', 'body', 'bomb', 'bond', 'bone', 'book', 'boom', 'boot', 'border',
  'born', 'borrow', 'boss', 'both', 'bother', 'bottle', 'bottom', 'boundary', 'bowl', 'box',
  'boy', 'brain', 'branch', 'brand', 'bread', 'break', 'breakfast', 'breast', 'breath', 'breathe',
  'brick', 'bridge', 'brief', 'briefly', 'bright', 'brilliant', 'bring', 'broad', 'broken', 'brother',
  'brown', 'brush', 'buck', 'budget', 'build', 'building', 'bullet', 'bunch', 'burden', 'burn',
  'bury', 'bus', 'business', 'busy', 'butter', 'button', 'buy', 'buyer', 'cabin', 'cabinet',
  'cable', 'cake', 'calculate', 'call', 'camera', 'camp', 'campaign', 'campus', 'can', 'cancer',
  'candidate', 'candle', 'candy', 'canvas', 'cap', 'capability', 'capable', 'capacity', 'capital', 'captain',
  'capture', 'car', 'carbon', 'card', 'care', 'career', 'careful', 'carefully', 'carrier', 'carry',
  'case', 'cash', 'cast', 'cat', 'catch', 'category', 'cause', 'ceiling', 'celebrate', 'celebration',
  'celebrity', 'cell', 'center', 'central', 'century', 'ceremony', 'certain', 'certainly', 'chain', 'chair',
  'chairman', 'challenge', 'chamber', 'champion', 'championship', 'chance', 'change', 'channel', 'chapter', 'character',
  'charge', 'charity', 'chart', 'chase', 'cheap', 'check', 'cheek', 'cheese', 'chef', 'chemical',
  'chest', 'chicken', 'chief', 'child', 'childhood', 'chill', 'chip', 'chocolate', 'choice', 'choose',
  'church', 'cigarette', 'circle', 'circumstance', 'cite', 'citizen', 'city', 'civil', 'claim', 'class',
  'classic', 'classroom', 'clean', 'clear', 'clearly', 'clerk', 'clever', 'click', 'client', 'climate',
  'climb', 'clinic', 'clinical', 'clock', 'close', 'closely', 'closer', 'clothes', 'clothing', 'cloud',
  'club', 'clue', 'cluster', 'coach', 'coal', 'coalition', 'coast', 'coat', 'code', 'coffee',
  'cognitive', 'cold', 'collapse', 'colleague', 'collect', 'collection', 'collective', 'college', 'colonial', 'color',
  'column', 'combination', 'combine', 'come', 'comedy', 'comfort', 'comfortable', 'command', 'commander', 'comment',
  'commercial', 'commission', 'commit', 'commitment', 'committee', 'common', 'communicate', 'communication', 'community', 'company',
  'compare', 'comparison', 'compete', 'competition', 'competitive', 'competitor', 'complain', 'complaint', 'complete', 'completely',
  'complex', 'complicated', 'component', 'compose', 'composition', 'comprehensive', 'computer', 'concentrate', 'concentration', 'concept',
  'concern', 'concerned', 'concert', 'conclude', 'conclusion', 'concrete', 'condition', 'conduct', 'conference', 'confidence',
  'confident', 'confirm', 'conflict', 'confront', 'confusion', 'congress', 'congressional', 'connect', 'connection', 'consciousness',
  'consensus', 'consequence', 'conservative', 'consider', 'considerable', 'consideration', 'consist', 'consistent', 'constant', 'constantly',
  'constitute', 'constitutional', 'construct', 'construction', 'consultant', 'consume', 'consumer', 'consumption', 'contact', 'contain',
  'container', 'contemporary', 'content', 'contest', 'context', 'continue', 'continued', 'contract', 'contrast', 'contribute',
  'contribution', 'control', 'controversial', 'controversy', 'convention', 'conventional', 'conversation', 'convert', 'conviction', 'convince',
  'cook', 'cookie', 'cooking', 'cool', 'cooperation', 'cop', 'cope', 'copy', 'core', 'corn',
  'corner', 'corporate', 'corporation', 'correct', 'correspondent', 'cost', 'cotton', 'couch', 'could', 'council',
  'counselor', 'count', 'counter', 'country', 'county', 'couple', 'courage', 'course', 'court', 'cousin',
  'cover', 'coverage', 'cow', 'crack', 'craft', 'crash', 'crazy', 'cream', 'create', 'creation',
  'creative', 'creature', 'credit', 'crew', 'crime', 'criminal', 'crisis', 'criteria', 'critic', 'critical',
  'criticism', 'criticize', 'crop', 'cross', 'crowd', 'crucial', 'cry', 'cultural', 'culture', 'cup',
  'curious', 'current', 'currently', 'curriculum', 'custom', 'customer', 'cut', 'cycle', 'dad', 'daily',
  'damage', 'dance', 'danger', 'dangerous', 'dare', 'dark', 'darkness', 'data', 'date', 'daughter',
  'day', 'dead', 'deal', 'dealer', 'dear', 'death', 'debate', 'debt', 'decade', 'decide',
  'decision', 'deck', 'declare', 'decline', 'decrease', 'deep', 'deeply', 'deer', 'defeat', 'defend',
  'defendant', 'defense', 'defensive', 'deficit', 'define', 'definitely', 'definition', 'degree', 'delay', 'deliver',
  'delivery', 'demand', 'democracy', 'democrat', 'democratic', 'demonstrate', 'demonstration', 'deny', 'department', 'depend',
  'dependent', 'depending', 'depict', 'depression', 'depth', 'deputy', 'derive', 'describe', 'description', 'desert',
  'deserve', 'design', 'designer', 'desire', 'desk', 'desperate', 'despite', 'destroy', 'destruction', 'detail',
  'detailed', 'detect', 'determine', 'develop', 'developing', 'development', 'device', 'devote', 'dialogue', 'die',
  'diet', 'differ', 'difference', 'different', 'differently', 'difficult', 'difficulty', 'dig', 'digital', 'dimension',
  'dining', 'dinner', 'direct', 'direction', 'directly', 'director', 'dirt', 'dirty', 'disability', 'disagree',
  'disappear', 'disaster', 'discipline', 'discourse', 'discover', 'discovery', 'discrimination', 'discuss', 'discussion', 'disease',
  'dish', 'dismiss', 'disorder', 'display', 'dispute', 'distance', 'distant', 'distinct', 'distinction', 'distinguish',
  'distribute', 'distribution', 'district', 'diverse', 'diversity', 'divide', 'division', 'divorce', 'doctor', 'document',
  'dog', 'domestic', 'dominant', 'dominate', 'door', 'double', 'doubt', 'down', 'draft', 'drag',
  'drama', 'dramatic', 'dramatically', 'draw', 'drawing', 'dream', 'dress', 'drink', 'drive', 'driver',
  'drop', 'drug', 'dry', 'due', 'during', 'dust', 'duty', 'each', 'eager', 'ear',
  'early', 'earn', 'earnings', 'earth', 'ease', 'easily', 'east', 'eastern', 'easy', 'eat',
  'economic', 'economics', 'economist', 'economy', 'edge', 'edition', 'editor', 'educate', 'education', 'educational',
  'educator', 'effect', 'effective', 'effectively', 'efficiency', 'efficient', 'effort', 'egg', 'eight', 'either',
  'elderly', 'elect', 'election', 'electric', 'electricity', 'electronic', 'element', 'elementary', 'eliminate', 'elite',
  'else', 'elsewhere', 'email', 'embrace', 'emerge', 'emergency', 'emission', 'emotion', 'emotional', 'emphasis',
  'emphasize', 'employ', 'employee', 'employer', 'employment', 'empty', 'enable', 'encounter', 'encourage', 'end',
  'enemy', 'energy', 'enforcement', 'engage', 'engine', 'engineer', 'engineering', 'english', 'enhance', 'enjoy',
  'enormous', 'enough', 'ensure', 'enter', 'enterprise', 'entertainment', 'entire', 'entirely', 'entrance', 'entry',
  'environment', 'environmental', 'episode', 'equal', 'equally', 'equipment', 'era', 'error', 'escape', 'especially',
  'essay', 'essential', 'essentially', 'establish', 'establishment', 'estate', 'estimate', 'etc', 'ethics', 'ethnic',
  'european', 'evaluate', 'evaluation', 'even', 'evening', 'event', 'eventually', 'ever', 'every', 'everybody',
  'everyday', 'everyone', 'everything', 'everywhere', 'evidence', 'evolution', 'evolve', 'exact', 'exactly', 'examination',
  'examine', 'example', 'exceed', 'excellent', 'except', 'exception', 'exchange', 'exciting', 'executive', 'exercise',
  'exhibit', 'exhibition', 'exist', 'existence', 'existing', 'expand', 'expansion', 'expect', 'expectation', 'expense',
  'expensive', 'experience', 'experiment', 'expert', 'explain', 'explanation', 'explode', 'explore', 'explosion', 'expose',
  'exposure', 'express', 'expression', 'extend', 'extension', 'extensive', 'extent', 'external', 'extra', 'extraordinary',
  'extreme', 'extremely', 'eye', 'fabric', 'face', 'facility', 'fact', 'factor', 'factory', 'faculty',
  'fade', 'fail', 'failure', 'fair', 'fairly', 'faith', 'fall', 'false', 'familiar', 'family',
  'famous', 'fan', 'fantasy', 'far', 'farm', 'farmer', 'fashion', 'fast', 'fat', 'fate',
  'father', 'fault', 'favor', 'favorite', 'fear', 'feature', 'federal', 'fee', 'feed', 'feel',
  'feeling', 'fellow', 'female', 'fence', 'few', 'fewer', 'fiber', 'fiction', 'field', 'fifteen',
  'fifth', 'fifty', 'fight', 'fighter', 'fighting', 'figure', 'file', 'fill', 'film', 'final',
  'finally', 'finance', 'financial', 'find', 'finding', 'fine', 'finger', 'finish', 'fire', 'firm',
  'first', 'fish', 'fishing', 'fit', 'fitness', 'five', 'fix', 'flag', 'flame', 'flat',
  'flavor', 'flee', 'flesh', 'flight', 'float', 'floor', 'flow', 'flower', 'fly', 'focus',
  'folk', 'follow', 'following', 'food', 'foot', 'football', 'for', 'force', 'foreign', 'forest',
  'forever', 'forget', 'form', 'formal', 'formation', 'former', 'formula', 'forth', 'fortune', 'forward',
  'found', 'foundation', 'founder', 'four', 'fourth', 'frame', 'framework', 'free', 'freedom', 'freeze',
  'french', 'frequency', 'frequent', 'frequently', 'fresh', 'friend', 'friendly', 'friendship', 'from', 'front',
  'fruit', 'frustration', 'fuel', 'full', 'fully', 'fun', 'function', 'fund', 'fundamental', 'funding',
  'funeral', 'funny', 'furniture', 'furthermore', 'future', 'gain', 'galaxy', 'gallery', 'game', 'gang',
  'gap', 'garage', 'garden', 'garlic', 'gas', 'gate', 'gather', 'gay', 'gaze', 'gear',
  'gender', 'gene', 'general', 'generally', 'generate', 'generation', 'genetic', 'gentleman', 'gently', 'german',
  'gesture', 'get', 'ghost', 'giant', 'gift', 'gifted', 'girl', 'girlfriend', 'give', 'given',
  'glad', 'glance', 'glass', 'global', 'glove', 'go', 'goal', 'god', 'gold', 'golden',
  'golf', 'good', 'government', 'governor', 'grab', 'grade', 'gradually', 'graduate', 'grain', 'grand',
  'grandfather', 'grandmother', 'grant', 'grass', 'grave', 'gray', 'great', 'greatest', 'green', 'grocery',
  'ground', 'group', 'grow', 'growing', 'growth', 'guarantee', 'guard', 'guess', 'guest', 'guide',
  'guideline', 'guilty', 'gun', 'guy', 'habit', 'habitat', 'hair', 'half', 'hall', 'hand',
  'handful', 'handle', 'hang', 'happen', 'happy', 'hard', 'hardly', 'hat', 'hate', 'have',
  'head', 'headline', 'headquarters', 'health', 'healthy', 'hear', 'hearing', 'heart', 'heat', 'heaven',
  'heavy', 'heavyweight', 'helicopter', 'hell', 'hello', 'help', 'helpful', 'her', 'here', 'heritage',
  'hero', 'herself', 'hide', 'high', 'highlight', 'highly', 'highway', 'hill', 'him', 'himself',
  'hire', 'his', 'historian', 'historic', 'historical', 'history', 'hit', 'hold', 'hole', 'holiday',
  'holy', 'home', 'homeless', 'honest', 'honey', 'honor', 'hope', 'horizon', 'horror', 'horse',
  'hospital', 'host', 'hot', 'hotel', 'hour', 'house', 'household', 'housing', 'how', 'however',
  'huge', 'human', 'humor', 'hundred', 'hungry', 'hunter', 'hunting', 'hurt', 'husband', 'hypothesis',
  'ice', 'idea', 'ideal', 'identification', 'identify', 'identity', 'ignore', 'ill', 'illegal', 'illness',
  'illustrate', 'image', 'imagination', 'imagine', 'immediate', 'immediately', 'immigrant', 'immigration', 'impact', 'implement',
  'implication', 'imply', 'importance', 'important', 'impose', 'impossible', 'impress', 'impression', 'impressive', 'improve',
  'improvement', 'incentive', 'incident', 'include', 'including', 'income', 'incorporate', 'increase', 'increased', 'increasing',
  'increasingly', 'incredible', 'indeed', 'independence', 'independent', 'index', 'indian', 'indicate', 'indication', 'individual',
  'industrial', 'industry', 'infant', 'infection', 'inflation', 'influence', 'inform', 'information', 'ingredient', 'initial',
  'initially', 'initiative', 'injury', 'inner', 'innocent', 'inquiry', 'inside', 'insight', 'insist', 'inspire',
  'install', 'instance', 'instead', 'institution', 'institutional', 'instruction', 'instructor', 'instrument', 'insurance', 'intellectual',
  'intelligence', 'intend', 'intense', 'intensity', 'intention', 'interaction', 'interest', 'interested', 'interesting', 'internal',
  'international', 'internet', 'interpret', 'interpretation', 'intervention', 'interview', 'into', 'introduce', 'introduction', 'invasion',
  'invest', 'investigate', 'investigation', 'investigator', 'investment', 'investor', 'invite', 'involve', 'involved', 'involvement',
  'iraqi', 'irish', 'iron', 'islamic', 'island', 'israeli', 'issue', 'item', 'its', 'itself',
  'jacket', 'jail', 'japanese', 'jet', 'jew', 'jewish', 'job', 'join', 'joint', 'joke',
  'journal', 'journalist', 'journey', 'joy', 'judge', 'judgment', 'juice', 'jump', 'junior', 'jury',
  'just', 'justice', 'justify', 'keep', 'key', 'kick', 'kid', 'kill', 'killer', 'killing',
  'kind', 'king', 'kiss', 'kitchen', 'knee', 'knife', 'knock', 'know', 'knowledge', 'lab',
  'label', 'labor', 'laboratory', 'lack', 'lady', 'lake', 'land', 'landscape', 'language', 'lap',
  'large', 'largely', 'laser', 'last', 'late', 'lately', 'later', 'latter', 'laugh', 'launch',
  'law', 'lawn', 'lawsuit', 'lawyer', 'lay', 'layer', 'lead', 'leader', 'leadership', 'leading',
  'leaf', 'league', 'lean', 'learn', 'learning', 'least', 'leather', 'leave', 'left', 'leg',
  'legacy', 'legal', 'legend', 'legislation', 'legitimate', 'lemon', 'length', 'less', 'lesson', 'let',
  'letter', 'level', 'liberal', 'library', 'license', 'lie', 'life', 'lifestyle', 'lifetime', 'lift',
  'light', 'like', 'likely', 'limit', 'limitation', 'limited', 'line', 'link', 'lip', 'list',
  'listen', 'literally', 'literary', 'literature', 'little', 'live', 'living', 'load', 'loan', 'local',
  'locate', 'location', 'lock', 'long', 'look', 'loose', 'lose', 'loss', 'lost', 'lot',
  'lots', 'loud', 'love', 'lovely', 'lover', 'low', 'lower', 'luck', 'lucky', 'lunch',
  'lung', 'machine', 'mad', 'magazine', 'mail', 'main', 'mainly', 'maintain', 'maintenance', 'major',
  'majority', 'make', 'maker', 'makeup', 'male', 'mall', 'man', 'manage', 'management', 'manager',
  'manner', 'manufacturer', 'manufacturing', 'many', 'map', 'margin', 'mark', 'market', 'marketing', 'marriage',
  'married', 'marry', 'mask', 'mass', 'massive', 'master', 'match', 'material', 'math', 'matter',
  'may', 'maybe', 'mayor', 'meal', 'mean', 'meaning', 'meantime', 'measure', 'measurement', 'meat',
  'mechanism', 'media', 'medical', 'medication', 'medicine', 'medium', 'meet', 'meeting', 'member', 'membership',
  'memory', 'mental', 'mention', 'menu', 'mere', 'merely', 'message', 'metal', 'meter', 'method',
  'mexican', 'middle', 'might', 'military', 'milk', 'million', 'mind', 'mine', 'minister', 'minor',
  'minority', 'minute', 'miracle', 'mirror', 'miss', 'missile', 'mission', 'mistake', 'mix', 'mixture',
  'mm-hmm', 'mode', 'model', 'moderate', 'modern', 'modest', 'mom', 'moment', 'money', 'monitor',
  'month', 'mood', 'moon', 'moral', 'more', 'moreover', 'morning', 'mortgage', 'most', 'mostly',
  'mother', 'motion', 'motivation', 'motor', 'mount', 'mountain', 'mouse', 'mouth', 'move', 'movement',
  'movie', 'much', 'multiple', 'murder', 'muscle', 'museum', 'music', 'musical', 'musician', 'muslim',
  'must', 'mutual', 'myself', 'mystery', 'myth', 'naked', 'name', 'narrative', 'narrow', 'nation',
  'national', 'native', 'natural', 'naturally', 'nature', 'near', 'nearby', 'nearly', 'necessarily', 'necessary',
  'neck', 'need', 'negative', 'negotiate', 'negotiation', 'neighbor', 'neighborhood', 'neither', 'nerve', 'nervous',
  'net', 'network', 'never', 'nevertheless', 'new', 'newly', 'news', 'newspaper', 'next', 'nice',
  'night', 'nine', 'nobody', 'nod', 'noise', 'nomination', 'none', 'nonetheless', 'nor', 'normal',
  'normally', 'north', 'northern', 'nose', 'not', 'note', 'nothing', 'notice', 'notion', 'novel',
  'now', 'nowhere', 'nuclear', 'number', 'numerous', 'nurse', 'nut', 'object', 'objective', 'obligation',
  'observation', 'observe', 'observer', 'obtain', 'obvious', 'obviously', 'occasion', 'occasionally', 'occupation', 'occupy',
  'occur', 'ocean', 'odd', 'odds', 'off', 'offense', 'offensive', 'offer', 'office', 'officer',
  'official', 'often', 'oil', 'okay', 'old', 'olympic', 'once', 'one', 'ongoing', 'onion',
  'online', 'only', 'onto', 'open', 'opening', 'operate', 'operating', 'operation', 'operator', 'opinion',
  'opponent', 'opportunity', 'oppose', 'opposite', 'opposition', 'option', 'orange', 'order', 'ordinary', 'organic',
  'organization', 'organize', 'orientation', 'origin', 'original', 'originally', 'other', 'others', 'otherwise', 'ought',
  'our', 'ourselves', 'out', 'outcome', 'outside', 'oven', 'over', 'overall', 'overcome', 'overlook',
  'owe', 'own', 'owner', 'pace', 'pack', 'package', 'page', 'pain', 'painful', 'paint',
  'painter', 'painting', 'pair', 'pale', 'palestinian', 'palm', 'pan', 'panel', 'pant', 'paper',
  'parent', 'park', 'parking', 'part', 'participant', 'participate', 'participation', 'particular', 'particularly', 'partly',
  'partner', 'partnership', 'party', 'pass', 'passage', 'passenger', 'passion', 'past', 'patch', 'path',
  'patient', 'pattern', 'pause', 'pay', 'payment', 'peace', 'peak', 'peer', 'penalty', 'people',
  'pepper', 'per', 'perceive', 'percentage', 'perception', 'perfect', 'perfectly', 'perform', 'performance', 'performer',
  'perhaps', 'period', 'permanent', 'permission', 'permit', 'person', 'personal', 'personality', 'personally', 'personnel',
  'perspective', 'persuade', 'pet', 'phase', 'phenomenon', 'philosophy', 'phone', 'photo', 'photograph', 'photographer',
  'phrase', 'physical', 'physically', 'physician', 'piano', 'pick', 'picture', 'pie', 'piece', 'pile',
  'pilot', 'pine', 'pink', 'pipe', 'pitch', 'pizza', 'place', 'plan', 'plane', 'planet',
  'planning', 'plant', 'plastic', 'plate', 'platform', 'play', 'player', 'please', 'pleasure', 'plenty',
  'plot', 'plus', 'pocket', 'poem', 'poet', 'poetry', 'point', 'pole', 'police', 'policy',
  'political', 'politically', 'politician', 'politics', 'poll', 'pollution', 'pool', 'poor', 'pop', 'popular',
  'population', 'porch', 'port', 'portion', 'portrait', 'portray', 'pose', 'position', 'positive', 'possess',
  'possibility', 'possible', 'possibly', 'post', 'pot', 'potato', 'potential', 'potentially', 'pound', 'pour',
  'poverty', 'powder', 'power', 'powerful', 'practical', 'practice', 'pray', 'prayer', 'precisely', 'predict',
  'prefer', 'preference', 'pregnancy', 'pregnant', 'preparation', 'prepare', 'prescription', 'presence', 'present', 'presentation',
  'preserve', 'president', 'presidential', 'press', 'pressure', 'pretend', 'pretty', 'prevent', 'previous', 'previously',
  'price', 'pride', 'priest', 'primarily', 'primary', 'prime', 'principal', 'principle', 'print', 'prior',
  'priority', 'prison', 'prisoner', 'privacy', 'private', 'probably', 'problem', 'procedure', 'proceed', 'process',
  'produce', 'producer', 'product', 'production', 'profession', 'professional', 'professor', 'profile', 'profit', 'program',
  'progress', 'project', 'prominent', 'promise', 'promote', 'prompt', 'proof', 'proper', 'properly', 'property',
  'proportion', 'proposal', 'propose', 'proposed', 'prosecutor', 'prospect', 'protect', 'protection', 'protein', 'protest',
  'proud', 'prove', 'provide', 'provider', 'province', 'provision', 'psychological', 'psychologist', 'psychology', 'public',
  'publication', 'publicly', 'publish', 'publisher', 'pull', 'punishment', 'purchase', 'pure', 'purpose', 'pursue',
  'push', 'put', 'qualify', 'quality', 'quarter', 'quarterback', 'question', 'quick', 'quickly', 'quiet',
  'quietly', 'quit', 'quite', 'quote', 'race', 'racial', 'radical', 'radio', 'rail', 'rain',
  'raise', 'range', 'rank', 'rapid', 'rapidly', 'rare', 'rarely', 'rate', 'rather', 'rating',
  'ratio', 'raw', 'reach', 'react', 'reaction', 'read', 'reader', 'reading', 'ready', 'real',
  'reality', 'realize', 'really', 'reason', 'reasonable', 'recall', 'receive', 'recent', 'recently', 'recipe',
  'recognition', 'recognize', 'recommend', 'recommendation', 'record', 'recording', 'recover', 'recovery', 'recruit', 'red',
  'reduce', 'reduction', 'refer', 'reference', 'reflect', 'reflection', 'reform', 'refugee', 'refuse', 'regard',
  'regarding', 'regardless', 'regime', 'region', 'regional', 'register', 'regular', 'regularly', 'regulate', 'regulation',
  'reinforce', 'reject', 'relate', 'relation', 'relationship', 'relative', 'relatively', 'relax', 'release', 'relevant',
  'relief', 'religion', 'religious', 'rely', 'remain', 'remaining', 'remarkable', 'remember', 'remind', 'remote',
  'remove', 'repeat', 'repeatedly', 'replace', 'reply', 'report', 'reporter', 'represent', 'representation', 'representative',
  'republican', 'reputation', 'request', 'require', 'requirement', 'research', 'researcher', 'resemble', 'reservation', 'resident',
  'resist', 'resistance', 'resolution', 'resolve', 'resort', 'resource', 'respect', 'respond', 'respondent', 'response',
  'responsibility', 'responsible', 'rest', 'restaurant', 'restore', 'restriction', 'result', 'retain', 'retire', 'retirement',
  'return', 'reveal', 'revenue', 'review', 'revolution', 'rhythm', 'rice', 'rich', 'rid', 'ride',
  'rifle', 'right', 'ring', 'rise', 'risk', 'river', 'road', 'rock', 'role', 'roll',
  'romantic', 'roof', 'room', 'root', 'rope', 'rose', 'rough', 'roughly', 'round', 'route',
  'routine', 'row', 'rub', 'rule', 'run', 'running', 'rural', 'rush', 'russian', 'sacred',
  'sad', 'safe', 'safety', 'sake', 'salad', 'salary', 'sale', 'sales', 'salt', 'same',
  'sample', 'sanction', 'sand', 'satellite', 'satisfaction', 'satisfy', 'sauce', 'save', 'saving', 'say',
  'scale', 'scandal', 'scared', 'scenario', 'scene', 'schedule', 'scheme', 'scholar', 'scholarship', 'school',
  'science', 'scientific', 'scientist', 'scope', 'score', 'scream', 'screen', 'script', 'sea', 'search',
  'season', 'seat', 'second', 'secret', 'secretary', 'section', 'sector', 'secure', 'security', 'see',
  'seed', 'seek', 'seem', 'segment', 'seize', 'select', 'selection', 'self', 'sell', 'senate',
  'senator', 'send', 'senior', 'sense', 'sensitive', 'sentence', 'separate', 'sequence', 'series', 'serious',
  'seriously', 'serve', 'service', 'session', 'set', 'setting', 'settle', 'settlement', 'seven', 'several',
  'severe', 'sex', 'sexual', 'shade', 'shadow', 'shake', 'shall', 'shape', 'share', 'sharp',
  'she', 'sheet', 'shelf', 'shell', 'shelter', 'shift', 'shine', 'ship', 'shirt', 'shit',
  'shock', 'shoe', 'shoot', 'shooting', 'shop', 'shopping', 'shore', 'short', 'shortly', 'shot',
  'should', 'shoulder', 'shout', 'show', 'shower', 'shrug', 'shut', 'sick', 'side', 'sigh',
  'sight', 'sign', 'signal', 'significance', 'significant', 'significantly', 'silence', 'silent', 'silver', 'similar',
  'similarly', 'simple', 'simply', 'sin', 'since', 'sing', 'singer', 'single', 'sink', 'sir',
  'sister', 'sit', 'site', 'situation', 'six', 'size', 'ski', 'skill', 'skin', 'sky',
  'slave', 'sleep', 'slice', 'slide', 'slight', 'slightly', 'slip', 'slow', 'slowly', 'small',
  'smart', 'smell', 'smile', 'smoke', 'smooth', 'snap', 'snow', 'so-called', 'soccer', 'social',
  'society', 'soft', 'software', 'soil', 'solar', 'soldier', 'solid', 'solution', 'solve', 'some',
  'somebody', 'somehow', 'someone', 'something', 'sometimes', 'somewhat', 'somewhere', 'son', 'song', 'soon',
  'sophisticated', 'sorry', 'sort', 'soul', 'sound', 'soup', 'source', 'south', 'southern', 'soviet',
  'space', 'spanish', 'speak', 'speaker', 'special', 'specialist', 'species', 'specific', 'specifically', 'speech',
  'speed', 'spend', 'spending', 'spin', 'spirit', 'spiritual', 'split', 'spokesman', 'sport', 'spot',
  'spread', 'spring', 'square', 'squeeze', 'stability', 'stable', 'staff', 'stage', 'stair', 'stake',
  'stand', 'standard', 'standing', 'star', 'stare', 'start', 'state', 'statement', 'station', 'statistics',
  'status', 'stay', 'steady', 'steal', 'steel', 'step', 'stick', 'still', 'stir', 'stock',
  'stomach', 'stone', 'stop', 'storage', 'store', 'storm', 'story', 'straight', 'strange', 'stranger',
  'strategic', 'strategy', 'stream', 'street', 'strength', 'strengthen', 'stress', 'stretch', 'strike', 'string',
  'strip', 'stroke', 'strong', 'strongly', 'structure', 'struggle', 'student', 'studio', 'study', 'stuff',
  'stupid', 'style', 'subject', 'submit', 'subsequent', 'substance', 'substantial', 'succeed', 'success', 'successful',
  'successfully', 'such', 'sudden', 'suddenly', 'sue', 'suffer', 'sufficient', 'sugar', 'suggest', 'suggestion',
  'suicide', 'suit', 'summer', 'summit', 'sun', 'super', 'supply', 'support', 'supporter', 'suppose',
  'supposed', 'supreme', 'sure', 'surely', 'surface', 'surgery', 'surprise', 'surprised', 'surprising', 'surprisingly',
  'surround', 'survey', 'survival', 'survive', 'survivor', 'suspect', 'sustain', 'swear', 'sweep', 'sweet',
  'swim', 'swing', 'switch', 'symbol', 'symptom', 'system', 'table', 'tablespoon', 'tactic', 'tail',
  'take', 'tale', 'talent', 'talk', 'tall', 'tank', 'tap', 'tape', 'target', 'task',
  'taste', 'tax', 'taxpayer', 'tea', 'teach', 'teacher', 'teaching', 'team', 'tear', 'teaspoon',
  'technical', 'technique', 'technology', 'teen', 'teenager', 'telephone', 'telescope', 'television', 'tell', 'temperature',
  'temporary', 'ten', 'tend', 'tendency', 'tennis', 'tension', 'tent', 'term', 'terms', 'terrible',
  'territory', 'terror', 'terrorism', 'terrorist', 'test', 'testify', 'testimony', 'testing', 'text', 'than',
  'thank', 'thanks', 'that', 'the', 'theater', 'their', 'them', 'theme', 'themselves', 'then',
  'theory', 'therapy', 'there', 'therefore', 'these', 'they', 'thick', 'thin', 'thing', 'think',
  'thinking', 'third', 'thirty', 'this', 'those', 'though', 'thought', 'thousand', 'threat', 'threaten',
  'three', 'throat', 'through', 'throughout', 'throw', 'thus', 'ticket', 'tie', 'tight', 'time',
  'tiny', 'tip', 'tire', 'tired', 'tissue', 'title', 'today', 'together', 'tomato', 'tomorrow',
  'tone', 'tongue', 'tonight', 'too', 'tool', 'tooth', 'top', 'topic', 'toss', 'total',
  'totally', 'touch', 'tough', 'tour', 'tourist', 'tournament', 'toward', 'towards', 'tower', 'town',
  'toy', 'trace', 'track', 'trade', 'tradition', 'traditional', 'traffic', 'tragedy', 'trail', 'train',
  'training', 'transfer', 'transform', 'transformation', 'transition', 'translate', 'transportation', 'travel', 'treat', 'treatment',
  'treaty', 'tree', 'tremendous', 'trend', 'trial', 'tribe', 'trick', 'trip', 'troop', 'trouble',
  'truck', 'truly', 'trunk', 'trust', 'truth', 'try', 'tube', 'tunnel', 'turn', 'twelve',
  'twenty', 'twice', 'twin', 'two', 'type', 'typical', 'typically', 'ugly', 'ultimate', 'ultimately',
  'unable', 'uncle', 'under', 'undergo', 'understand', 'understanding', 'unfortunately', 'uniform', 'union', 'unique',
  'unit', 'united', 'universal', 'universe', 'university', 'unknown', 'unless', 'unlike', 'unlikely', 'until',
  'unusual', 'upon', 'upper', 'urban', 'urge', 'used', 'useful', 'user', 'usual', 'usually',
  'utility', 'vacation', 'valley', 'valuable', 'value', 'variable', 'variation', 'variety', 'various', 'vary',
  'vast', 'vegetable', 'vehicle', 'venture', 'version', 'versus', 'very', 'vessel', 'veteran', 'via',
  'victim', 'victory', 'video', 'view', 'viewer', 'village', 'violate', 'violation', 'violence', 'violent',
  'virtually', 'virtue', 'virus', 'visible', 'vision', 'visit', 'visitor', 'visual', 'vital', 'voice',
  'volume', 'volunteer', 'vote', 'voter', 'vulnerable', 'wage', 'wait', 'wake', 'walk', 'wall',
  'wander', 'want', 'war', 'warm', 'warn', 'warning', 'wash', 'waste', 'watch', 'water',
  'wave', 'way', 'weak', 'wealth', 'wealthy', 'weapon', 'wear', 'weather', 'wedding', 'week',
  'weekend', 'weekly', 'weigh', 'weight', 'welcome', 'welfare', 'well', 'west', 'western', 'wet',
  'what', 'whatever', 'wheel', 'when', 'whenever', 'where', 'whereas', 'whether', 'which', 'while',
  'whisper', 'white', 'who', 'whole', 'whom', 'whose', 'why', 'wide', 'widely', 'widespread',
  'wife', 'wild', 'will', 'willing', 'win', 'wind', 'window', 'wine', 'wing', 'winner',
  'winter', 'wipe', 'wire', 'wisdom', 'wise', 'wish', 'with', 'withdraw', 'within', 'without',
  'witness', 'woman', 'wonder', 'wonderful', 'wood', 'wooden', 'word', 'work', 'worker', 'working',
  'works', 'workshop', 'world', 'worried', 'worry', 'worth', 'would', 'wound', 'wrap', 'write',
  'writer', 'writing', 'wrong', 'yard', 'yeah', 'year', 'yell', 'yellow', 'yes', 'yesterday',
  'yield', 'young', 'your', 'yours', 'yourself', 'youth', 'zone'
]);

// Draw & Guess Words Catalog
export const DRAW_WORDS: { word: string; category: string; difficulty: 'easy' | 'medium' | 'hard' }[] = [
  { word: 'PIZZA', category: 'Food', difficulty: 'easy' },
  { word: 'CAT', category: 'Animals', difficulty: 'easy' },
  { word: 'SUN', category: 'Nature', difficulty: 'easy' },
  { word: 'HOUSE', category: 'Objects', difficulty: 'easy' },
  { word: 'CAR', category: 'Vehicles', difficulty: 'easy' },
  { word: 'APPLE', category: 'Food', difficulty: 'easy' },
  { word: 'TREE', category: 'Nature', difficulty: 'easy' },
  { word: 'FLOWER', category: 'Nature', difficulty: 'easy' },
  { word: 'AIRPLANE', category: 'Vehicles', difficulty: 'medium' },
  { word: 'GUITAR', category: 'Music', difficulty: 'medium' },
  { word: 'PENGUIN', category: 'Animals', difficulty: 'medium' },
  { word: 'CASTLE', category: 'Places', difficulty: 'medium' },
  { word: 'ROCKET', category: 'Space', difficulty: 'medium' },
  { word: 'OCTOPUS', category: 'Animals', difficulty: 'medium' },
  { word: 'CAMPFIRE', category: 'Nature', difficulty: 'medium' },
  { word: 'SUBMARINE', category: 'Vehicles', difficulty: 'hard' },
  { word: 'ASTRONAUT', category: 'Space', difficulty: 'hard' },
  { word: 'LIGHTHOUSE', category: 'Places', difficulty: 'hard' },
  { word: 'DRAGON', category: 'Fantasy', difficulty: 'hard' },
  { word: 'MICROSCOPE', category: 'Science', difficulty: 'hard' },
  { word: 'VOLCANO', category: 'Nature', difficulty: 'medium' },
  { word: 'BICYCLE', category: 'Vehicles', difficulty: 'medium' },
  { word: 'PUPPY', category: 'Animals', difficulty: 'easy' },
  { word: 'BURGER', category: 'Food', difficulty: 'easy' },
  { word: 'RAINBOW', category: 'Nature', difficulty: 'easy' },
];

export function getRandomWordOptions(count = 3) {
  const shuffled = [...DRAW_WORDS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export function generateHint(word: string): string {
  return word
    .split('')
    .map((ch, idx) => {
      if (ch === ' ' || ch === '-') return ch;
      if (idx === 0 || idx === word.length - 1) return ch;
      return '_';
    })
    .join(' ');
}

// Bot AI for Connect Four
export function getBotConnectFourMove(grid: (number | null)[][], botPlayerIndex: number, difficulty: 'easy' | 'medium' | 'master'): number {
  const opponentIndex = botPlayerIndex === 0 ? 1 : 0;
  const cols = 7;
  const rows = 6;

  const validCols: number[] = [];
  for (let c = 0; c < cols; c++) {
    if (grid[0][c] === null) {
      validCols.push(c);
    }
  }

  if (validCols.length === 0) return 3;

  if (difficulty === 'easy') {
    return validCols[Math.floor(Math.random() * validCols.length)];
  }

  const simulateDrop = (col: number, pIndex: number): [number, number] | null => {
    for (let r = rows - 1; r >= 0; r--) {
      if (grid[r][col] === null) {
        return [r, col];
      }
    }
    return null;
  };

  const checkWinAt = (r: number, c: number, pIndex: number): boolean => {
    const directions = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
    ];

    for (const [dr, dc] of directions) {
      let count = 1;
      // forward
      for (let step = 1; step <= 3; step++) {
        const nr = r + dr * step;
        const nc = c + dc * step;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && (grid[nr][nc] === pIndex || (nr === r && nc === c))) {
          count++;
        } else break;
      }
      // backward
      for (let step = 1; step <= 3; step++) {
        const nr = r - dr * step;
        const nc = c - dc * step;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && (grid[nr][nc] === pIndex || (nr === r && nc === c))) {
          count++;
        } else break;
      }
      if (count >= 4) return true;
    }
    return false;
  };

  // 1. Check if bot can win immediately
  for (const c of validCols) {
    const drop = simulateDrop(c, botPlayerIndex);
    if (drop && checkWinAt(drop[0], drop[1], botPlayerIndex)) {
      return c;
    }
  }

  // 2. Check if opponent can win next turn and block them
  for (const c of validCols) {
    const drop = simulateDrop(c, opponentIndex);
    if (drop && checkWinAt(drop[0], drop[1], opponentIndex)) {
      return c;
    }
  }

  if (difficulty === 'master') {
    // Prefer center column or adjacent columns
    const preferences = [3, 2, 4, 1, 5, 0, 6];
    for (const pref of preferences) {
      if (validCols.includes(pref)) {
        // avoid setting up opponent to win on top
        const drop = simulateDrop(pref, botPlayerIndex);
        if (drop && drop[0] > 0) {
          const aboveR = drop[0] - 1;
          if (checkWinAt(aboveR, pref, opponentIndex)) {
            continue; // unsafe move!
          }
        }
        return pref;
      }
    }
  }

  return validCols[Math.floor(Math.random() * validCols.length)];
}

// Bot AI for Word Bomb
export function getBotWord(prompt: string, usedWords: string[]): string | null {
  const lowerPrompt = prompt.toLowerCase();
  const candidates: string[] = [];

  for (const word of COMMON_DICTIONARY) {
    if (word.includes(lowerPrompt) && !usedWords.includes(word)) {
      candidates.push(word);
      if (candidates.length > 25) break;
    }
  }

  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

// -------------------------------------------------------------
// CHESS HELPERS & INITIAL STATE
// -------------------------------------------------------------
import type { ChessPiece, ChessState, UnoCard, UnoState, UnoColor, MonopolyState, MonopolyTile, HideSeekState, HidingSpot } from '../types/game';

export function createInitialChessState(): ChessState {
  const board: (ChessPiece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));

  // Black pieces (row 0 & 1)
  const backRowBlack: ChessPiece['type'][] = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
  for (let c = 0; c < 8; c++) {
    board[0][c] = { type: backRowBlack[c], color: 'b', hasMoved: false };
    board[1][c] = { type: 'p', color: 'b', hasMoved: false };
  }

  // White pieces (row 6 & 7)
  const backRowWhite: ChessPiece['type'][] = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
  for (let c = 0; c < 8; c++) {
    board[6][c] = { type: 'p', color: 'w', hasMoved: false };
    board[7][c] = { type: backRowWhite[c], color: 'w', hasMoved: false };
  }

  return {
    board,
    currentTurn: 'w',
    winner: null,
    isCheck: false,
    capturedWhite: [],
    capturedBlack: [],
    movesCount: 0,
  };
}

export function getBotChessMove(board: (ChessPiece | null)[][], botColor: 'w' | 'b'): { from: [number, number]; to: [number, number] } | null {
  const oppColor = botColor === 'w' ? 'b' : 'w';
  const inBounds = (r: number, c: number) => r >= 0 && r < 8 && c >= 0 && c < 8;

  const allLegalMoves: { from: [number, number]; to: [number, number]; isCapture: boolean; targetType?: string }[] = [];

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece || piece.color !== botColor) continue;

      const moves: [number, number][] = [];
      const addMove = (nr: number, nc: number): boolean => {
        if (!inBounds(nr, nc)) return false;
        const target = board[nr][nc];
        if (!target) {
          moves.push([nr, nc]);
          return true;
        }
        if (target.color === oppColor) {
          moves.push([nr, nc]);
          return false;
        }
        return false;
      };

      switch (piece.type) {
        case 'p': {
          const dir = botColor === 'w' ? -1 : 1;
          const startR = botColor === 'w' ? 6 : 1;
          if (inBounds(r + dir, c) && !board[r + dir][c]) {
            moves.push([r + dir, c]);
            if (r === startR && inBounds(r + 2 * dir, c) && !board[r + 2 * dir][c]) {
              moves.push([r + 2 * dir, c]);
            }
          }
          for (const dc of [-1, 1]) {
            const nr = r + dir;
            const nc = c + dc;
            if (inBounds(nr, nc) && board[nr][nc]?.color === oppColor) {
              moves.push([nr, nc]);
            }
          }
          break;
        }
        case 'n': {
          const offsets = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
          for (const [dr, dc] of offsets) addMove(r + dr, c + dc);
          break;
        }
        case 'b': {
          const diags = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
          for (const [dr, dc] of diags) {
            for (let s = 1; s < 8; s++) if (!addMove(r + dr * s, c + dc * s)) break;
          }
          break;
        }
        case 'r': {
          const orthos = [[-1, 0], [1, 0], [0, -1], [0, 1]];
          for (const [dr, dc] of orthos) {
            for (let s = 1; s < 8; s++) if (!addMove(r + dr * s, c + dc * s)) break;
          }
          break;
        }
        case 'q': {
          const allDirs = [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]];
          for (const [dr, dc] of allDirs) {
            for (let s = 1; s < 8; s++) if (!addMove(r + dr * s, c + dc * s)) break;
          }
          break;
        }
        case 'k': {
          const kDirs = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
          for (const [dr, dc] of kDirs) addMove(r + dr, c + dc);
          break;
        }
      }

      for (const [toR, toC] of moves) {
        const target = board[toR][toC];
        allLegalMoves.push({
          from: [r, c],
          to: [toR, toC],
          isCapture: !!target,
          targetType: target?.type,
        });
      }
    }
  }

  if (allLegalMoves.length === 0) return null;

  // Bot strategy: prefer captures (especially King, Queen, Rook)
  const captures = allLegalMoves.filter(m => m.isCapture);
  if (captures.length > 0) {
    const kingCap = captures.find(m => m.targetType === 'k');
    if (kingCap) return { from: kingCap.from, to: kingCap.to };
    const queenCap = captures.find(m => m.targetType === 'q');
    if (queenCap) return { from: queenCap.from, to: queenCap.to };
    return { from: captures[0].from, to: captures[0].to };
  }

  const chosen = allLegalMoves[Math.floor(Math.random() * allLegalMoves.length)];
  return { from: chosen.from, to: chosen.to };
}

// -------------------------------------------------------------
// UNO HELPERS & INITIAL STATE
// -------------------------------------------------------------
export function createUnoDeck(): UnoCard[] {
  const colors: ('red' | 'blue' | 'green' | 'yellow')[] = ['red', 'blue', 'green', 'yellow'];
  const deck: UnoCard[] = [];
  let idCounter = 1;

  for (const color of colors) {
    // One 0 per color
    deck.push({ id: `c-${idCounter++}`, color, value: '0', symbol: '0', type: 'number' });
    // Two of 1-9
    for (let v = 1; v <= 9; v++) {
      const strVal = v.toString();
      deck.push({ id: `c-${idCounter++}`, color, value: strVal, symbol: strVal, type: 'number' });
      deck.push({ id: `c-${idCounter++}`, color, value: strVal, symbol: strVal, type: 'number' });
    }
    // Action cards (2 each)
    for (let i = 0; i < 2; i++) {
      deck.push({ id: `c-${idCounter++}`, color, value: 'skip', symbol: '🚫', type: 'skip' });
      deck.push({ id: `c-${idCounter++}`, color, value: 'reverse', symbol: '🔄', type: 'reverse' });
      deck.push({ id: `c-${idCounter++}`, color, value: 'draw2', symbol: '+2', type: 'draw2' });
    }
  }

  // 4 Wild and 4 Wild Draw 4
  for (let i = 0; i < 4; i++) {
    deck.push({ id: `c-${idCounter++}`, color: 'wild', value: 'wild', symbol: '🌈', type: 'wild' });
    deck.push({ id: `c-${idCounter++}`, color: 'wild', value: 'wild4', symbol: '+4', type: 'wild4' });
  }

  // Shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
}

export function createInitialUnoState(playerCount: number): UnoState {
  const deck = createUnoDeck();
  const hands: UnoCard[][] = [];

  for (let p = 0; p < playerCount; p++) {
    hands.push(deck.splice(0, 7));
  }

  // Find a non-wild starting top card
  let topCardIdx = deck.findIndex(c => c.color !== 'wild');
  if (topCardIdx === -1) topCardIdx = 0;
  const initialTopCard = deck.splice(topCardIdx, 1)[0] || {
    id: 'starter',
    color: 'red' as UnoColor,
    value: '7',
    symbol: '7',
    type: 'number' as const,
  };

  return {
    hands,
    discardPile: [initialTopCard],
    drawPileCount: deck.length,
    currentColor: initialTopCard.color === 'wild' ? 'red' : (initialTopCard.color as 'red' | 'blue' | 'green' | 'yellow'),
    currentTurn: 0,
    direction: 1,
    winner: null,
    pendingWild: false,
    unoCalled: {},
    lastActionText: `Match ${initialTopCard.color.toUpperCase()} ${initialTopCard.symbol} to start!`,
  };
}

export function getBotUnoMove(hand: UnoCard[], topCard: UnoCard, currentColor: 'red' | 'blue' | 'green' | 'yellow'): { card: UnoCard; chosenColor: 'red' | 'blue' | 'green' | 'yellow' } | null {
  const playable = hand.filter(c => c.color === 'wild' || c.color === currentColor || c.value === topCard.value);
  if (playable.length === 0) return null;

  // Prefer action cards or highest matching color
  const chosen = playable[0];
  const colors: ('red' | 'blue' | 'green' | 'yellow')[] = ['red', 'blue', 'green', 'yellow'];
  const chosenColor = colors[Math.floor(Math.random() * colors.length)];
  return { card: chosen, chosenColor };
}

// -------------------------------------------------------------
// MONOPOLY HELPERS & INITIAL STATE
// -------------------------------------------------------------
export const MONOPOLY_BOARD_TILES: MonopolyTile[] = [
  { id: 0, name: 'GO', type: 'go' },
  { id: 1, name: 'Mediterranean Ave', type: 'property', price: 60, rent: 15, color: '#9333ea' },
  { id: 2, name: 'Community Chest', type: 'chance' },
  { id: 3, name: 'Baltic Avenue', type: 'property', price: 80, rent: 20, color: '#9333ea' },
  { id: 4, name: 'Income Tax', type: 'tax', price: 100 },
  { id: 5, name: 'Reading Railroad', type: 'property', price: 120, rent: 30, color: '#64748b' },
  { id: 6, name: 'Oriental Avenue', type: 'property', price: 100, rent: 25, color: '#06b6d4' },
  { id: 7, name: 'Jail / Visiting', type: 'jail' },
  { id: 8, name: 'St. Charles Place', type: 'property', price: 140, rent: 35, color: '#ec4899' },
  { id: 9, name: 'Electric Company', type: 'property', price: 150, rent: 40, color: '#eab308' },
  { id: 10, name: 'States Avenue', type: 'property', price: 160, rent: 40, color: '#ec4899' },
  { id: 11, name: 'Free Parking', type: 'parking' },
  { id: 12, name: 'Pennsylvania Ave', type: 'property', price: 200, rent: 50, color: '#10b981' },
  { id: 13, name: 'Lucky Chance', type: 'chance' },
  { id: 14, name: 'Boardwalk', type: 'property', price: 250, rent: 75, color: '#2563eb' },
  { id: 15, name: 'Luxury Tax', type: 'tax', price: 75 },
];

export function createInitialMonopolyState(playerCount: number): MonopolyState {
  return {
    tiles: JSON.parse(JSON.stringify(MONOPOLY_BOARD_TILES)),
    playerCash: Array(playerCount).fill(1000),
    playerPositions: Array(playerCount).fill(0),
    inJail: Array(playerCount).fill(false),
    currentTurn: 0,
    lastDice: [1, 2],
    winner: null,
    phase: 'roll',
    log: ['🎲 Welcome to Monopoly Tycoon! Roll the dice to begin.'],
  };
}

// -------------------------------------------------------------
// HIDE AND SEEK HELPERS & INITIAL STATE
// -------------------------------------------------------------
export const HAUNTED_HIDING_SPOTS: HidingSpot[] = [
  { id: 'spot-1', name: 'Grand Piano', room: 'Ballroom', icon: '🎹', noiseLevel: 25, isSearched: false },
  { id: 'spot-2', name: 'Heavy Velvet Curtains', room: 'Ballroom', icon: '🎭', noiseLevel: 10, isSearched: false },
  { id: 'spot-3', name: 'Secret Bookcase Door', room: 'Library', icon: '📚', noiseLevel: 15, isSearched: false },
  { id: 'spot-4', name: 'Suit of Medieval Armor', room: 'Grand Gallery', icon: '🛡️', noiseLevel: 40, isSearched: false },
  { id: 'spot-5', name: 'Under Four-Poster Bed', room: 'Master Chamber', icon: '🛏️', noiseLevel: 20, isSearched: false },
  { id: 'spot-6', name: 'Grandfather Clock', room: 'Foyer', icon: '🕰️', noiseLevel: 30, isSearched: false },
  { id: 'spot-7', name: 'Behind Wine Barrels', room: 'Cellar Vault', icon: '🍷', noiseLevel: 15, isSearched: false },
  { id: 'spot-8', name: 'Cobweb Attic Trunk', room: 'Attic', icon: '📦', noiseLevel: 10, isSearched: false },
  { id: 'spot-9', name: 'Garden Hedge Maze', room: 'Courtyard', icon: '🌳', noiseLevel: 50, isSearched: false },
  { id: 'spot-10', name: 'Stone Fireplace', room: 'Drawing Room', icon: '🔥', noiseLevel: 35, isSearched: false },
  { id: 'spot-11', name: 'Pantry Food Cabinet', room: 'Kitchen', icon: '🥫', noiseLevel: 20, isSearched: false },
  { id: 'spot-12', name: 'Observatory Telescope', room: 'Tower Dome', icon: '🔭', noiseLevel: 10, isSearched: false },
];

export function createInitialHideSeekState(playerCount: number): HideSeekState {
  return {
    phase: 'hiding',
    seekerIndex: 0,
    round: 1,
    maxRounds: 3,
    spots: JSON.parse(JSON.stringify(HAUNTED_HIDING_SPOTS)),
    playerHidingSpots: {},
    foundPlayers: [],
    searchesLeft: 4,
    lastEventText: 'Quietly slip into a hiding spot before the seeker begins searching!',
    winner: null,
  };
}
